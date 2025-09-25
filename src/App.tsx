import { useState, useEffect } from 'react'
import AccessComponent from './components/acces'
import InicioComponent from './components/inicio'
import { connectClient } from './core'
import './App.css'

function App() {
  const [loggedUser, setLoggedUser] = useState<{ address: string; secret: string } | null>(null)
  const [client, setClient] = useState<any>(null)

  const handleLogin = (user: { address: string; secret: string }) => {
    setLoggedUser(user)
  }

  useEffect(() => {
    if (loggedUser && !client) {
      const connect = async () => {
        const c = await connectClient('ws://127.0.0.1:6019')
        setClient(c)
      }
      connect()
    }
  }, [loggedUser, client])

  return (
    <div className="main-container">
      {!loggedUser && <AccessComponent onLogin={handleLogin} />}
      {client
        ? <span style={{ color: 'green', marginLeft: 10 }}> </span>
        : <span style={{ color: 'red', marginLeft: 10 }}>Nodo no conectado</span>
      }
      {loggedUser && <InicioComponent wallet={loggedUser} client={client} />}
    </div>
  )
}

export default App
