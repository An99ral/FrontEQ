import React, { useState } from 'react'
import { Client, Wallet } from 'xrpl'
import { sendPayment } from '../core'

interface SendPaymentProps {
  client: Client | null
  wallet: Wallet | null
}

const SendPaymentComponent: React.FC<SendPaymentProps> = ({ client, wallet }) => {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [result, setResult] = useState<any>(null)

  const handleSend = async () => {
    if (!client || !wallet) return
    const res = await sendPayment(client, wallet, to, amount)
    setResult(res)
  }

  return (
    <div>
      <h3>Enviar XRP</h3>
      <input placeholder="Destino" value={to} onChange={e => setTo(e.target.value)} style={{ marginRight: 9 }} />

      <input
        placeholder="Cantidad"
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))} style={{ marginRight: 9 }}
      />
      <button onClick={handleSend}>Enviar</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}

export default SendPaymentComponent
