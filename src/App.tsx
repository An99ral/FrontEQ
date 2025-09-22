import { useState } from 'react'
//import SendPaymentComponent from './components/SendPayment'
import AccessComponent from './components/acces'
import InicioComponent from './components/inicio'
import { connectClient } from './core';
import Button from '@mui/material/Button';


function App() {
  const [loggedUser, setLoggedUser] = useState<{ address: string; secret: string } | null>(null)
  const [client, setClient] = useState<any>(null)
  const handleLogin = (user: { address: string; secret: string }) => {
    setLoggedUser(user)
  }
  const handleConnect = async () => {
    const c = await connectClient('ws://127.0.0.1:6019')
    setClient(c)
  }


  return (
    <div style={{ padding: 20 }}>
      {/* Si NO hay usuario logueado, muestra el login */}
      {!loggedUser && <AccessComponent onLogin={handleLogin} />}
      <div>
        <button onClick={handleConnect}>Conectar nodo</button>
        {client
          ? <span style={{ color: 'green', marginLeft: 10 }}>Nodo conectado</span>
          : <span style={{ color: 'red', marginLeft: 10 }}>Nodo no conectado</span>
        }
      </div>
      {/* Si hay usuario logueado, muestra la pantalla de pagos */}
      {loggedUser && <InicioComponent wallet={loggedUser}client={client} style={{ display: "flex", justifyContent: "center" }} />}
     
    </div>
  )
}

export default App
