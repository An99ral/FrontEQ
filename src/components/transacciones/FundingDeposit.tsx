import React, { useState } from 'react'
import { Client } from 'xrpl'
import { submitFundingDeposit } from '../../core/index'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { multiplicar } from '../funciones/EQ'


interface FundingDepositProps {
    client: Client | null
    wallet: { address: string; secret: string }
    onPageChange?: (page: string) => void // <-- agrega esta prop
}

const FundingDepositComponent: React.FC<FundingDepositProps> = ({ client, wallet, onPageChange }) => {
    const [walletAddress, setWalletAddress] = useState(wallet.address)
    const [owner, setOwner] = useState('')
    const [OfferSequence, setOfferSequence] = useState('')
    const [Amount, setAmount] = useState<number>(1)
  

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<any>(null)
   
    const [showSuccess, setShowSuccess] = useState(false)

   
    const handleCreate = async () => {
        setError(null)
        setResult(null)
        if (!client) return setError('Debes conectar el nodo primero.')

        setLoading(true)
        try {
             const res = await submitFundingDeposit(client, wallet, {
                wallet: walletAddress,
                owner: owner,
                Amount: Amount,
                offerSequence: OfferSequence // convertir a drops

            })
            setResult(res)
            if (res?.result?.engine_result === "tesSUCCESS") {
                setShowSuccess(true)
            }
        } catch (e: any) {
            console.error(e)
            setError(e?.message || JSON.stringify(e))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 720, width: '100%' }} class="card" >
            <h2>Create Funding</h2>

            {/* Datos básicos */}
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <input placeholder="Wallet Address" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                    // ...otros estilos...
                }} />
                <input placeholder="Owner" value={owner} onChange={e => setOwner(e.target.value)} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                }} />
                <input placeholder="Offer Sequence" value={OfferSequence} onChange={e => setOfferSequence(e.target.value)} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                }} />
                 <input placeholder="Amount of EQ" value={Amount} onChange={e => setAmount(e.target.value)} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                }} />
             
              

            </div>


          

            <button style={{ marginTop: 12 }} onClick={handleCreate} disabled={loading}>
                {loading ? 'Enviando...' : 'Crear Funding'}
            </button>

            {error && (
                <samp style={{ display: 'block', marginTop: 10, whiteSpace: 'pre-wrap' }}>
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {error}
                    </Alert>
                </samp>
            )}

            {/* Modal de éxito */}
            <Modal
                open={showSuccess}
                onClose={() => setShowSuccess(false)}
                aria-labelledby="modal-success-title"
                aria-describedby="modal-success-desc"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 340,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    textAlign: 'center'
                }}>
                    <Alert severity="success">
                        <AlertTitle>¡Pool creado!</AlertTitle>
                        Tu pool ha sido creado exitosamente.
                    </Alert>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => onPageChange && onPageChange('home')}
                    >

                        Ir a Home
                    </Button>
                </Box>
            </Modal>
        </div>
    )
}

export default FundingDepositComponent