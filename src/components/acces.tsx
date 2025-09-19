import React, { useState } from 'react'
import { Wallet } from 'xrpl'

interface AccessComponentProps {
  onLogin: (wallet: { address: string; secret: string }) => void
}

  const AccessComponent: React.FC<AccessComponentProps> = ({ onLogin }) => {
  const [from, setFrom] = useState<{ address: string; secret: string } | null>(null)
  const [inputAddress, setInputAddress] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleConnect = () => {
    setError(null)
    setResult(null)
    let fromWallet: Wallet
    try {
      fromWallet = Wallet.fromSeed(secret, { algorithm: 'secp256k1' })
      if (!fromWallet.classicAddress) {
        setError('No se pudo obtener la dirección de la wallet.')
        return
      } else if (fromWallet.classicAddress !== inputAddress) {
        setError('La dirección de la wallet no coincide.')
        return
      }
      setFrom({ address: fromWallet.classicAddress, secret })
      setResult('Acceso correcto')
      onLogin({ address: fromWallet.classicAddress, secret }) // Notifica al padre
    } catch {
      setError('Secret inválido')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>Acceso a la Wallet</h3>
      
      <input
        type='text'
        placeholder='secret'
        value={secret}
        onChange={e => setSecret(e.target.value)}
        style={{ marginRight: 9 }}
      />
      <input
        type="text"
        placeholder="Desde"
        value={inputAddress}
        onChange={e => setInputAddress(e.target.value)}
        style={{ marginRight: 9 }}
      />
      <button onClick={handleConnect} style={{ margin: 9 }}>Conectar</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result && <div style={{ color: 'green' }}>{result}</div>}
      {from && (
        <div style={{ marginTop: 10 }}>
          <b>Dirección conectada:</b> {from.address}
        </div>
      )}
    </div>
  )
}

export default AccessComponent