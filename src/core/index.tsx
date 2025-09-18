import { Client, Wallet, xrpToDrops } from 'xrpl'

// Conectar a nodo custom
export const connectClient = async (nodeUrl: string) => {
  const client = new Client(nodeUrl)
  await client.connect()
  return client
}

// Crear una nueva wallet
export const createWallet = () => {
  const wallet = Wallet.generate()
  return {
    seed: wallet.seed,
    address: wallet.classicAddress
  }
}

// Enviar XRP (drops)
export const sendPayment = async (
  client: Client,
  fromWallet: Wallet,
  toAddress: string,
  amountXRP: number
) => {
  const prepared = await client.autofill({
    TransactionType: 'Payment',
    Account: fromWallet.classicAddress,
    Destination: toAddress,
    Amount: xrpToDrops(amountXRP)
  })

  const signed = fromWallet.sign(prepared)
  const result = await client.submitAndWait(signed.tx_blob)
  return result
}
