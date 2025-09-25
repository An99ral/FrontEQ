import React, { useState } from 'react'
import { Wallet } from 'xrpl'
import { connectClient } from '../core';

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
    let fromWallet: Wallet | null = null
    try {
      // Intenta secp256k1
      fromWallet = Wallet.fromSeed(secret, { algorithm: 'secp256k1' })
      if (fromWallet.classicAddress === inputAddress) {
        setFrom({ address: fromWallet.classicAddress, secret })
        setResult('Acceso correcto')
        onLogin({ address: fromWallet.classicAddress, secret })
        return
      }
      // Si no coincide, intenta ed25519
      fromWallet = Wallet.fromSeed(secret, { algorithm: 'ed25519' })
      if (fromWallet.classicAddress === inputAddress) {
        setFrom({ address: fromWallet.classicAddress, secret })
        setResult('Acceso correcto')
        onLogin({ address: fromWallet.classicAddress, secret })
        return
      }
      setError('La dirección de la wallet no coincide con el secret.')
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
        placeholder="key"
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