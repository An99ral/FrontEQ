import React from 'react'

interface WalletInfoProps {
  address: string
  seed: string
}

const WalletInfo: React.FC<WalletInfoProps> = ({ address, seed }) => {
  return (
    <div>
      <h2>Información de Wallet</h2>
      <p>Address: {address}</p>
      <p>Seed: {seed}</p>
    </div>
  )
}

export default WalletInfo
