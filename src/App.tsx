import { useState } from 'react'
import { createWallet, connectClient } from './core'
import WalletInfo from './components/walletinfo'
import SendPaymentComponent from './components/SendPayment'

function App() {
  const [wallet, setWallet] = useState<any>(null)
  const [client, setClient] = useState<any>(null)

  const handleCreateWallet = () => {
    const w = createWallet()
    setWallet(w)
  }

  const handleConnect = async () => {
    const c = await connectClient(' http://127.0.0.1:5019')
    setClient(c)
  }

  return (
    <div>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        <h1>Wallet Demo</h1>
        <button onClick={handleCreateWallet}>Crear Wallet</button>
        <button onClick={handleConnect}>Conectar al nodo</button>
        {wallet && <WalletInfo address={wallet.address} seed={wallet.seed} />}
         <SendPaymentComponent client={client} wallet={wallet} />
      </div>  
     
    </div>
  )
}

export default App
