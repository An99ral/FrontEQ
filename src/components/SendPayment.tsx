import React, { useState } from 'react'
import { Client, Wallet } from 'xrpl'
import { sendPayment } from '../core'

interface SendPaymentProps {
  client: Client | null

}

const SendPaymentComponent: React.FC<SendPaymentProps> = ({ client }) => {
  const [secret, setSecret] = useState<string>('')
  const [from, setFrom] = useState<string>('')
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
    if (!to || !amount || !secret || !from) {
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
      <input type='text' placeholder='secret' value={secret} onChange={e => setSecret(e.target.value)} style={{ marginRight: 9 }} />
      <input type="text" placeholder="Desde" value={from} onChange={e => setFrom(e.target.value)} style={{ marginRight: 9 }} />

      <input placeholder="Destino" value={to} onChange={e => setTo(e.target.value)} style={{ marginRight: 9 }} />
      <input
        placeholder="Cantidad"
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))} style={{ marginRight: 9 }}
      />
      <button onClick={handleSend}>Enviar</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={{ background: '#eee', padding: 8, marginTop: 8 }}>
          <div>
            <b>engine_result:</b> {result.engine_result}
          </div>
          <div>
            <b>Mensaje:</b> {result.engine_result_message}
          </div>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default SendPaymentComponent
