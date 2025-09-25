import React from "react";
import { submitClosePool } from "../../core";

interface CerrarProps {
    client: any;
    address: string;
    wallet: { address: string; secret: string };
    offerSequence: number;
    stageIndex: number;
}

export const Cerrar = ({ client, address, wallet, offerSequence, stageIndex }: CerrarProps) => {
    const [result, setResult] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);

    const cerrar = async () => {
        setError(null);
        setResult(null);
        try {
            const res = await submitClosePool(client, wallet, {
                Owner: address,
                offerSequence,
                StageIndex: stageIndex,

            });
            if (res?.result && "engine_result" in res.result && res.result.engine_result !== "tesSUCCESS") {
                alert(res.result.engine_result_message || res.result.engine_result);
                setResult(res);
              
            }
            if (res?.result?.engine_result === "tesSUCCESS") {
                alert("Pool cerrado correctamente");
                console.log("Pool cerrado correctamente:", res);
            }


        } catch (e: any) {
            setError(e?.message || String(e));
            alert(e?.message || String(e));
            console.error("Error al cerrar el pool:", e);
        }
    };

    console.log("wallet en InfoPoolComponent", wallet);

    if (!client || !address || !wallet || !offerSequence) {
        if (!client) {
            return <div>Error: Faltan datos para cerrar el pool. Falta el cliente.</div>;
        }
        if (!address) {
            return <div>Error: Faltan datos para cerrar el pool. Falta la dirección.</div>;
        }
        if (!wallet) {
            return <div>Error: Faltan datos para cerrar el pool. Falta la billetera.</div>;
        }
        if (!offerSequence) {
            return <div>Error: Faltan datos para cerrar el pool. Falta la secuencia de oferta.</div>;
        }
    }

    return (
        <div>
            <button onClick={cerrar}>Cerrar</button>
            {error && <div style={{ color: "salmon" }}>{error}</div>}
        </div>
    );
};

export default Cerrar;
