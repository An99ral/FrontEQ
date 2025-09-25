import { submitClosePool } from "../../core";

interface CerrarProps {
    client: any;
    address: string;
    wallet: { address: string; secret: string };
    
    offerSequence: number;
}
export const Cerrar = ({ client, address, wallet, offerSequence }: CerrarProps) => {
    const [result, setResult] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);
    const cerrar = async () => {
        setError(null)
        setResult(null)
        try {
            const res = await submitClosePool(client, wallet, {
                Owner: address,
                offerSequence: offerSequence,
                
            });
            setResult(res);
        } catch (error) {
            console.error("Error al cerrar el pool:", error);
        }
    };

    return (
        <div>
            <h2>Cerrar Pool</h2>
            <button onClick={cerrar}>Cerrar</button>
        </div>
    );
};
export default Cerrar;
