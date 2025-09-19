import { Client, LedgerEntry, Wallet, xrpToDrops, ServerInfoResponse } from 'xrpl'

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
    Amount: xrpToDrops(amountEQ)
  })

  const signed = fromWallet.sign(prepared)

  const result = await client.submitAndWait(signed.tx_blob)
  console.log('Resultado submitAndWait:', result)
  return result
}
