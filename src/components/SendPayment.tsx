import React, { useState } from 'react'
import { Client, Wallet } from 'xrpl'
import { sendPayment } from '../core'
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
//import {AlertCircleIcon} from 'mdi-react/AlertCircleIcon'

interface SendPaymentProps {
  client: Client | null

}

const SendPaymentComponent: React.FC<SendPaymentProps> = ({ wallet, client }) => {
  const [secret] = useState(wallet.secret)
  const [from] = useState(wallet.address) //

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    setError(null)
    setResult(null)

    if (!client) {
      setError('Debes conectar el nodo primero.')
      return
    }
    if (!to || !amount) {
      setError('Completa todos los campos.')
      return
    }

    let fromWallet: Wallet
    try {
      fromWallet = Wallet.fromSeed(secret, { algorithm: 'secp256k1' })
      if (fromWallet.classicAddress !== from) {
        setError('El secret no corresponde a la cuenta "Desde".')
        setError(fromWallet.classicAddress + ' !== ' + from)
        return
      }
    } catch {
      setError('Secret inválido.')
      return
    }

    try {
      console.log('Enviando pago...', { to, amount, from, secret })
      const res = await sendPayment(client, fromWallet, to, amount)
      console.log('Resultado del pago:', res)
      setResult(res)
    } catch (e: any) {
      console.error('Error al enviar:', e)
      setError('Error al enviar transacción')
      if (e && (e.engine_result || e.engine_result_message)) {
        setResult(e)
      } else if (e && e.data && (e.data.engine_result || e.data.engine_result_message)) {
        setResult(e.data)
      } else {
        setResult({ engine_result: 'error', engine_result_message: typeof e === 'string' ? e : JSON.stringify(e) })
      }
    }
  }

  return (
    <div>
      <h3>Enviar EQ</h3>

      <input placeholder="Destino" value={to} onChange={e => setTo(e.target.value)} style={{ marginRight: 9 }} />
      <input
        placeholder="Cantidad"
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))} style={{ marginRight: 9 }}
      />
      <button onClick={handleSend}>Enviar</button>

      {error && (
        <samp style={{ display: 'block', marginTop: 10, whiteSpace: 'pre-wrap' }}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error}
            <button onClick={() => setError(null)} style={{ display: "flex", justifyContent: "center"}}>Cerrar</button>
          </Alert>
        </samp>
      )}

    </div>
  )
}

export default SendPaymentComponent
