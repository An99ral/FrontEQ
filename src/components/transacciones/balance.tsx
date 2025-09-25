import React from 'react'
import { useEffect, useState } from 'react'
import { balanceOf } from '../../core/index'
import divicion from '../funciones/EQ'

interface BalanceProps {
    client: any
    wallet: { address: string; secret: string }
}

const BalanceComponent: React.FC<BalanceProps> = ({ wallet, client }) => {
    const [balance, setBalance] = useState(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!client) {
            setError('Debes conectar el nodo primero.')
            return
        }
        setError(null)
        balanceOf(client, wallet.address)
            .then(setBalance)
            .catch(e => {
                setError('Error al consultar el balance')
                console.error(e)
            })
    }, [client, wallet.address])

    return (
        <div>
            <h2>Balance</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {balance !== null ? (
                <p>Your balance is: {divicion(balance)} EQ</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}

export default BalanceComponent
