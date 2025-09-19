import { useState } from 'react'
import SendPaymentComponent from './components/SendPayment'
import AccessComponent from './components/acces'

function App() {
  const [loggedUser, setLoggedUser] = useState(null)

 
  const handleLogin = (user) => {
    setLoggedUser(user)
  }

  return (
    <div>
      {/* Si NO hay usuario logueado, muestra el login */}
      {!loggedUser && <AccessComponent onLogin={handleLogin} />}

      {/* Si hay usuario logueado, muestra la pantalla de pagos */}
      {loggedUser && <SendPaymentComponent wallet={loggedUser} />}
    </div>
  )
}

export default App
