import React from "react";
import { submitAssignJudges } from "../../core";


interface SetJudgesProps {
    client: any;
    address: string; // Owner (dueño del pool)
    wallet: { address: string; secret: string };
    offerSequence: number; // OfferSequence del pool
    initialJudges?: string[]; // opcional, arranque
    onSuccess?: () => void;
}

const SetJudges: React.FC<SetJudgesProps> = ({
    client,
    address,
    wallet,
    offerSequence,
    initialJudges = ["", ""],
    onSuccess
}) => {
    const [judges, setJudges] = React.useState<string[]>(initialJudges);
    const [count, setCount] = React.useState<number>(Math.min(10, Math.max(1, initialJudges.length)));
    const [signerQuorum, setSignerQuorum] = React.useState<number>(1);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Mantener el arreglo de jueces con el tamaño indicado (1..10)
    React.useEffect(() => {
        setJudges(prev => {
            const c = Math.min(10, Math.max(1, count));
            if (prev.length < c) return [...prev, ...Array(c - prev.length).fill("")];
            if (prev.length > c) return prev.slice(0, c);
            return prev;
        });
    }, [count]);

    const handleChangeJudge = (idx: number, val: string) => {
        setJudges(prev => {
            const copy = [...prev];
            copy[idx] = val.trim();
            return copy;
        });
    };

    const handleSetJudges = async () => {
        setError(null);
        // Validaciones básicas
        const filled = judges.filter(j => !!j);
        if (filled.length === 0) {
            setError("Agrega al menos un juez.");
            return;
        }
        if (signerQuorum < 1 || signerQuorum > filled.length) {
            setError(`SignerQuorum debe estar entre 1 y ${filled.length}.`);
            return;
        }

        setLoading(true);
        try {
            const result = await submitAssignJudges(client, wallet, {
                Owner: address,
                offerSequence: offerSequence,
                SignerQuorum: signerQuorum,
                AuthAccounts: filled.map(j => ({ AuthAccount: { Account: j } }))
            });

            if (result?.result && "engine_result" in result.result && result.result.engine_result !== "tesSUCCESS") {
                alert(result.result.engine_result_message || result.result.engine_result || "Transacción no exitosa.");
            } else {
                alert("Jueces asignados correctamente.");
                onSuccess && onSuccess();
            }
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: 720, width: "100%" }}>
            <h3>Asignar jueces</h3>

            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
                <div>
                    <label>Número de jueces (1–10)</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={count}
                        onChange={e => setCount(Number(e.target.value))}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label>SignerQuorum</label>
                    <input
                        type="number"
                        min={1}
                        max={Math.max(1, judges.filter(j => !!j).length || 1)}
                        value={signerQuorum}
                        onChange={e => setSignerQuorum(Number(e.target.value))}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {judges.map((j, i) => (
                    <input
                        key={i}
                        placeholder={`Cuenta juez ${i + 1}`}
                        value={j}
                        onChange={e => handleChangeJudge(i, e.target.value)}
                        style={{ width: "100%" }}
                    />
                ))}
            </div>

            <button className="button" style={{ marginTop: 12 }} onClick={handleSetJudges} disabled={loading}>
                {loading ? "Enviando..." : "Confirmar"}
            </button>

            {error && <div style={{ marginTop: 8, color: "salmon" }}>{error}</div>}
        </div>
    );
};

export default SetJudges;