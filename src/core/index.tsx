import { Client, LedgerEntry, Wallet, xrpToDrops, ServerInfoResponse, LedgerIndex, validate } from 'xrpl'

// Conectar a nodo custom
export const connectClient = async (nodeUrl: string) => {
  const client = new Client(nodeUrl)
  await client.connect()
  return client
}

// Crear una nueva wallet
export const createWallet = () => {
  const wallet = Wallet.generate()
  return wallet
}
export const balanceOf = async (client: Client, address: string) => {
  // Obtener el saldo de la cuenta
  const accountInfo = await client.request({
    command: 'account_info',
    account: address,
    ledger_index: 'validated'
  })

  return accountInfo.result.account_data.Balance
}

// Enviar EQ (drops)
export const sendPayment = async (
  client: Client,
  fromWallet: Wallet,
  toAddress: string,
  amountEQ: number
) => {
  console.log('Preparando transacción...')
  const prepared = await client.autofill({
    TransactionType: 'Payment',
    Account: fromWallet.classicAddress,
    Destination: toAddress,
    Amount: xrpToDrops(amountEQ),
  })

  const signed = fromWallet.sign(prepared)

  const result = await client.submitAndWait(signed.tx_blob)
  console.log('Resultado submitAndWait:', result)
  return result
}

// Ripple epoch helper (Unix -> Ripple time)
const RIPPLE_EPOCH = 946684800
export const toRippleTime = (unixOrDate: number | Date) => {
  const unix = typeof unixOrDate === 'number' ? unixOrDate : Math.floor(unixOrDate.getTime() / 1000)
  return unix - RIPPLE_EPOCH
}

export const getAccountSequence = async (client: Client, address: string) => {
  const r = await client.request({ command: 'account_info', account: address, ledger_index: 'current' })
  return r.result.account_data.Sequence as number
}

export const getBaseFeeDrops = async (client: Client) => {
  const r = await client.request({ command: 'fee' })
  return r.result.drops.minimum_fee as string
}

export const getLastLedgerSequence = async (client: Client, delta = 20) => {
  const info = await client.request({ command: 'server_info' })
  const seq = info.result.info.validated_ledger?.seq
  return (Number(seq) || 0) + delta
}

export const getNetworkID = async (client: Client) => {
  try {
    const info = await client.request({ command: 'server_info' })
    return (info as any).result.info.network_id as number | undefined
  } catch {
    return undefined
  }
}

// Enviar transacción custom 151 (FundingCreate)
export const submitFundingCreate = async (
  client: Client,
  wallet: { address: string; secret: string },
  params: {
    destination: string
    poolName: string
    poolData: string
    transferRate: number
    cancelAfter?: number
    finishAfter?: number
    stages: Array<{ StageIndex: number; StageData: string }>
  }
) => {
  const Sequence = await getAccountSequence(client, wallet.address)
  const Fee = await getBaseFeeDrops(client)
  const LastLedgerSequence = await getLastLedgerSequence(client, 20)
  // const NetworkID = await getNetworkID(client) // <-- NO usar por defecto

  const buildTx = (withNetworkId = false) => {
    const tx: any = {
      TransactionType: 151,
      Account: wallet.address,
      Destination: params.destination,
      PoolName: params.poolName,
      PoolData: params.poolData,
      TransferRate: params.transferRate,
      Sequence,
      Fee,
      LastLedgerSequence,
      ...(typeof params.cancelAfter === 'number' ? { CancelAfter: params.cancelAfter } : {}),
      ...(typeof params.finishAfter === 'number' ? { FinishAfter: params.finishAfter } : {}),
      Stages: params.stages.map(s => ({ Stage: { StageIndex: s.StageIndex, StageData: s.StageData } }))
    }
    // if (withNetworkId && NetworkID) tx.NetworkID = NetworkID
    return tx
  }

  // 1) intentar SIN NetworkID
  try {
    const res = await client.request({
      command: 'submit',
      secret: wallet.secret,
      tx_json: buildTx(false)
    } as any)
    return res
  } catch (e: any) {
    throw e
  }

}
// donar XRP a una cuenta 
export const submitFundingDeposit = async (
  client: Client,
  wallet: { address: string; secret: string },
  params: {
    owner: string
    Amount: number
    offerSequence: number
  }
) => {
  // Validaciones mínimas
  if (!params.owner) throw new Error("owner es requerido")
  if (params.offerSequence == null) throw new Error("OfferSequence es requerido")
  if (!(params.Amount > 0)) throw new Error("Amount debe ser mayor a 0 (en EQ)")

  const Sequence = await getAccountSequence(client, wallet.address)
  const Fee = await getBaseFeeDrops(client)
  const LastLedgerSequence = await getLastLedgerSequence(client, 20)

  const buildTx = () => {
    const tx: any = {
      TransactionType: 152,
      Account: wallet.address,
      Owner: params.owner,
      OfferSequence: params.offerSequence,
      Amount: xrpToDrops(String(params.Amount)), // drops como string
      Sequence,
      Fee,
      LastLedgerSequence
    }
    return tx
  }

  try {
    const res = await client.request({
      command: 'submit',
      secret: wallet.secret,
      tx_json: buildTx() // <-- solo tx_json
    } as any)
    return res
  } catch (e) {
    throw e
  }
}
//-----------------info


export const getObjects = async (client: Client, address: string) => {
  try {
    const res = await client.request({
      command: 'account_objects2',
      account: address
    } as any)
    return res
  } catch (e) {
    throw e
  }
}

// Utilidad browser-safe para decodificar hex a UTF-8
export function hexToUtf8(hex: string): string {
  if (!hex || typeof hex !== "string" || !/^[0-9a-fA-F]+$/.test(hex)) return "";
  try {
    return decodeURIComponent(
      hex.replace(/(..)/g, '%$1')
    );
  } catch {
    return "";
  }
}

//----ledger data para usuarios objeto funding


export const getJudgeFundingPools = async (
  client: Client,
  judgeAddress: string
) => {
  const RIPPLE_EPOCH_UNIX = 946684800
  const nowRippleTimestamp = () => Math.floor(Date.now() / 1000) - RIPPLE_EPOCH_UNIX

  try {
    const res = await client.request({
      command: 'ledger_data',
      params: {
        ledger_index: 'validated',
        type: 'FundingPool',
        limit: 400
      },



    });

    const pools = res.result?.state || [];
    const now = nowRippleTimestamp();

    // Filtrar pools donde el usuario es juez
    const filtered = pools
      .filter((pool: any) =>
        Array.isArray(pool.AuthAccounts) &&
        pool.AuthAccounts.some(
          (auth: any) => auth.AuthAccount?.Account === judgeAddress
        )
      )
      .map((pool: any) => {
        // Decodificar nombre si está en hex
        let poolName = pool.PoolName || '';
        try {
          poolName = Buffer.from(poolName, 'hex').toString('utf8');
        } catch {
          // Si falla, deja el hex
        }
        let PoolData = pool.PoolData || '';
        try {
          PoolData = Buffer.from(PoolData, 'hex').toString('utf8');
        } catch {
          // Si falla, deja el hex
        }
        // Estado y tiempo
        const cancelAfter = pool.CancelAfter ?? null;
        let status = 'Unknown';
        let timeLeft = null;
        if (cancelAfter !== null) {
          if (cancelAfter < now) {
            status = 'Expired';
          } else {
            status = 'Active';
            timeLeft = cancelAfter - now;
          }
        }

        // Formatear tiempo restante
        let timeLeftStr = '';
        if (timeLeft !== null) {
          if (timeLeft < 60) {
            timeLeftStr = `${timeLeft} segundos`;
          } else if (timeLeft < 3600) {
            timeLeftStr = `${Math.floor(timeLeft / 60)} minutos ${timeLeft % 60} segundos`;
          } else if (timeLeft < 86400) {
            timeLeftStr = `${Math.floor(timeLeft / 3600)} horas ${Math.floor((timeLeft % 3600) / 60)} minutos`;
          } else {
            timeLeftStr = `${Math.floor(timeLeft / 86400)} días ${Math.floor((timeLeft % 86400) / 3600)} horas ${Math.floor((timeLeft % 3600) / 60)} minutos`;
          }
        }

        return {
          PoolSequence: pool.OfferSequence,
          PoolName: poolName,
          PoolOwner: pool.Owner,
          PoolData: PoolData,
          Judge: judgeAddress,
          CancelAfter: cancelAfter,
          CurrentTime: now,
          Status: status,
          Stages: Array.isArray(pool.Stages)
            ? pool.Stages.map((stage: any) => ({
              StageIndex: stage.Stage?.StageIndex,
              StageFlags: stage.Stage?.StageFlags,
              StageData: stage.Stage?.StageData,
              // agrega aquí cualquier otro campo que necesites
            }))
            : [],

          TimeLeft: timeLeftStr,
        };
      });

    return filtered;
  } catch (e) {
    throw e;
  }
};


//-----------------voto

export const submitVote = async (
  client: Client,
  wallet: { address: string; secret: string },
  param: {
    Owner: string,
    offerSequence: number
    StageIndex: number
    Vote: boolean

  }
) => {
  if (!client || !wallet || !param.offerSequence) throw new Error("Invalid parameters");

  const Sequence = await getAccountSequence(client, wallet.address)
  const Fee = await getBaseFeeDrops(client)
  const LastLedgerSequence = await getLastLedgerSequence(client, 20)
  const buildTx = () => {
    const tx = {
      TransactionType: "FundingPoolVote",
      Account: wallet.address,
      Owner: param.Owner,
      OfferSequence: param.offerSequence, // <-- corregido aquí
      StageIndex: param.StageIndex,
      Vote: param.Vote ? 1 : 0,
      Sequence,
      Fee,
      LastLedgerSequence
    };
    return tx
  }

  try {
    const tx = buildTx();
    console.log("Datos enviados a submitVote:");
    console.log({
      wallet,
      param,
      tx_json: tx
    });

    const res = await client.request({
      command: "submit",
      secret: wallet.secret,
      tx_json: tx
    } as any);

    console.log("submitVote function executed");
    console.log(res);
    return res;

  } catch (e) {
    throw e;
  }

};

//----------------------cerrar pool
export const submitClosePool = async (
  client: Client,
  wallet: { address: string; secret: string },
  param: {
    Owner: string,
    offerSequence: number,
    StageIndex: number
  }
) => {
  if (!client || !wallet || !param.offerSequence) throw new Error("Invalid parameters");
  const Sequence = await getAccountSequence(client, wallet.address)
  const Fee = await getBaseFeeDrops(client)
  const LastLedgerSequence = await getLastLedgerSequence(client, 20)

  const buildTx = () => {
    const tx = {
      TransactionType: "FundingPoolClose",
      Account: wallet.address,
      Owner: param.Owner,
      OfferSequence: param.offerSequence,
      StageIndex: param.StageIndex,
      Sequence,
      Fee,
      LastLedgerSequence
    };
    return tx
  }
  try {
    const tx = buildTx();
    console.log("Datos enviados a submitClosePool:");
    console.log({
      wallet,
      param,
      tx_json: tx
    });
    const res = await client.request({
      command: "submit",
      secret: wallet.secret,
      tx_json: tx
    } as any);

    console.log("submitClosePool function executed");
    console.log(res);
    return res;

  } catch (e) {
    throw e;
  }

};
// --------------------- asignar jueces
export const submitAssignJudges = async (
  client: Client,
  wallet: { address: string; secret: string },
  param: {
    Owner: string,
    offerSequence: number,
    SignerQuorum: number,
    AuthAccounts: Array<{ AuthAccount: { Account: string } }>
  }
) => {
  if (!client || !wallet || !param.offerSequence) throw new Error("Invalid parameters");
  const Sequence = await getAccountSequence(client, wallet.address)
  const Fee = await getBaseFeeDrops(client)
  const LastLedgerSequence = await getLastLedgerSequence(client, 20)

  const buildTx = () => {
    const tx: any = {
      TransactionType: 156, // <-- numérico, igual al curl
      Account: wallet.address,
      Owner: param.Owner,
      OfferSequence: param.offerSequence,
      AuthAccounts: param.AuthAccounts.map(a => ({ AuthAccount: { Account: a.AuthAccount.Account } })),
      SignerQuorum: param.SignerQuorum,
      Sequence,
      Fee,
      LastLedgerSequence
    }
    return tx
  }

  try {
    const tx = buildTx();
    const res = await client.request({
      command: "submit",
      secret: wallet.secret,
      tx_json: tx
    } as any);
    return res;
  } catch (e) {
    throw e;
  }
};


//----------------------  funding  disponibles 

export const getAvailableFundings = async (
  client: Client,
) => {
  const getAvailable = await client.request({
    command: "ledger_data",
    params: {
      type: "FundingPool",
      ledger_index: "validated"
    }
  } as any);

  // Filtra solo FundingPool, decodifica y ordena por PoolName
  const pools = (getAvailable.result?.state || [])
    .filter((obj: any) => obj.LedgerEntryType === "FundingPool")
    .map((pool: any) => ({
      ...pool,
      PoolName: pool.PoolName ? hexToUtf8(pool.PoolName) : "",
      PoolData: pool.PoolData ? hexToUtf8(pool.PoolData) : ""
    }))
    .sort((a, b) => a.PoolName.localeCompare(b.PoolName, 'es', { sensitivity: 'base' }));

  console.log("getAvailableFundings pools:", pools);
  return pools;
}