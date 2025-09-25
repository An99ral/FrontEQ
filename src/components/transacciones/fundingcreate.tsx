import React, { useState } from 'react'
import { Client } from 'xrpl'
import { submitFundingCreate, toRippleTime } from '../../core/index'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { multiplicar } from '../funciones/EQ'


interface FundingCreateProps {
    client: Client | null
    wallet: { address: string; secret: string }
    onPageChange?: (page: string) => void // <-- agrega esta prop
}

const FundingCreateComponent: React.FC<FundingCreateProps> = ({ client, wallet, onPageChange }) => {
    const [destination, setDestination] = useState(wallet.address)
    const [poolName, setPoolName] = useState('')
    const [poolData, setPoolData] = useState('')
    const [transferRate, setTransferRate] = useState<number>(1000000000)
    const [finishAfterMins, setFinishAfterMins] = useState<number>(5)     // <-- default
    // En vez de pedir "cancel after desde ahora", pedimos el margen sobre finish:
    const [cancelGapMins, setCancelGapMins] = useState<number>(5)         // <-- default

    // Etapas dinámicas: cantidad + descripciones
    const [stageCount, setStageCount] = useState<number>(2)
    const [stageDescriptions, setStageDescriptions] = useState<string[]>([
        'Etapa 1: Concepto y diseño del videojuego AAA',
        'Etapa 2: Desarrollo de la trama y el videojuego'
    ])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<any>(null)
    const [amountEQ, setAmountEQ] = useState<number>(0)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleStageCountChange = (n: number) => {
        const count = Math.max(1, Math.min(20, isNaN(n) ? 1 : n))
        setStageCount(count)
        setStageDescriptions(prev => {
            if (count > prev.length) {
                // agrega vacíos
                return [...prev, ...Array(count - prev.length).fill('')]
            } else if (count < prev.length) {
                // recorta
                return prev.slice(0, count)
            }
            return prev
        })
    }

    const handleStageDescChange = (index: number, value: string) => {
        setStageDescriptions(prev => {
            const copy = [...prev]
            copy[index] = value
            return copy
        })
    }

    const handleCreate = async () => {
        setError(null)
        setResult(null)
        if (!client) return setError('Debes conectar el nodo primero.')

        setLoading(true)
        try {
            const nowUnix = Math.floor(Date.now() / 1000)
            const finishUnix = nowUnix + Math.max(1, finishAfterMins || 1) * 60
            const cancelUnix = finishUnix + Math.max(1, cancelGapMins || 1) * 60

            const finishAfter = toRippleTime(finishUnix)
            const cancelAfter = toRippleTime(cancelUnix)

            const stages = stageDescriptions.map((desc, i) => ({
                StageIndex: i + 1,
                StageData: desc || `Etapa ${i + 1}`
            }))

            const res = await submitFundingCreate(client, wallet, {
                destination,
                poolName,
                poolData,
                transferRate: transferRate || 0,
                finishAfter,
                cancelAfter,
                stages
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
                <input placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                    // ...otros estilos...
                }} />
                <input placeholder="Pool Name" value={poolName} onChange={e => setPoolName(e.target.value)} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                }} />
                <input placeholder="Pool Data" value={poolData} onChange={e => setPoolData(e.target.value)} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                }} />
                <input type="number" placeholder="FinishAfter (mins)" value={finishAfterMins} onChange={e => setFinishAfterMins(Number(e.target.value))} style={{
                    border: '1px solid #ffffff2c',
                    borderRadius: 6,
                    margin: '6px 0',
                    padding: '8px'
                }} />
                <input
                    type="number"
                    placeholder="Margen CancelAfter sobre Finish (mins)"
                    value={cancelGapMins}
                    onChange={e => setCancelGapMins(Number(e.target.value))}
                    style={{
                        border: '1px solid #ffffff2c',
                        borderRadius: 6,
                        margin: '6px 0',
                        padding: '8px'
                    }} />

            </div>

            {/* Control de cantidad de etapas */}
            <div style={{ marginTop: 16 }}>
                <label style={{ marginRight: 8 }}>Número de etapas:</label>
                <input
                    type="number"
                    min={1}
                    max={20}
                    value={stageCount}
                    onChange={e => handleStageCountChange(Number(e.target.value))}

                    style={{
                        border: '1px solid #ffffff2c',
                        borderRadius: 6,
                        margin: '6px 0',
                        padding: '8px'
                    }} />

            </div>

            {/* Campos dinámicos de etapas */}
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {stageDescriptions.map((desc, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 80, color: '#b0b8c1' }}>Etapa {i + 1}</div>
                        <textarea
                            placeholder={`Descripción de la etapa ${i + 1}`}
                            value={desc}
                            onChange={e => handleStageDescChange(i, e.target.value)}
                            style={{
                                border: '1px solid #ffffff2c',
                                borderRadius: 6,
                                margin: '6px 0',
                                padding: '8px',
                                minHeight: '48px',
                                width: '100%',
                                resize: 'vertical',
                                background: '#181818',
                                color: '#fff'
                            }}
                        />

                    </div>
                ))}
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

export default FundingCreateComponent