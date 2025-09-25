import React from "react";
import { getJudgeFundingPools, submitVote } from "../../core"; // <-- submitVote

interface VotosProps {
    client: any;
    address: string;
    wallet: { address: string; secret: string };
}
const VotosComponent: React.FC<VotosProps> = ({ client, address, wallet }) => {
    const [data, setData] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState<string | null>(null);
    const [voteOptions, setVoteOptions] = React.useState([
        { label: "1", value: true },
        { label: "2", value: false },
    ]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getJudgeFundingPools(client, address);
                setData(res);
            } catch (e: any) {
                setError(e?.message || String(e));
            }
        };
        fetchData();
    }, [client, address]);

    const handleSubmit = async (e: React.FormEvent, pool: any, stageIndex: number, vote: boolean) => {
        e.preventDefault();
        try {
            const res = await submitVote(client, wallet, {
                Owner: pool.PoolOwner,
                offerSequence: pool.PoolSequence,
                StageIndex: stageIndex,
                Vote: vote,
            });
            if (res?.result?.engine_result !== "tesSUCCESS") {
                alert(`Error: ${res.result.engine_result_message || res.result.engine_result}`);
                setError(res.result.engine_result_message || res.result.engine_result);
            } else {
                setMessage("Voto enviado correctamente");
            }
        } catch (err: any) {
            setError(err?.message || String(err));
        }
    };

    return (
        <div>
            <h2>Fundings donde eres juez</h2>
            {error && <p>{error}</p>}
            {message && <p>{message}</p>}

            {data && Array.isArray(data) && data.length > 0 ? (
                <div className="votos-grid">
                    {data.map((pool: any, idx: number) => (
                        <form
                            key={idx}
                            className="card votos-card"
                            onSubmit={e => {
                                e.preventDefault();
                                const stageIndex = Number((e.target as any).StageIndex.value);
                                const vote = (e.target as any).Vote.value === "true";
                                handleSubmit(e, pool, stageIndex, vote);
                            }}
                        >
                            <div>Nombre: {hexToUtf8(pool.PoolName)}</div>
                            <div>
                                <b>Secuencia:</b>
                                <input type="number" name="offerSequence" defaultValue={pool.PoolSequence} readOnly />
                            </div>
                            <div>
                                <b>Etapa:</b>
                                <input type="number" name="StageIndex" min={1} max={10} defaultValue={1} required />
                            </div>
                            <div>
                                <b>Voto:</b>
                                <select name="Vote" defaultValue="true" required>
                                    <option value="true">A favor</option>
                                    <option value="false">En contra</option>
                                </select>
                            </div>
                            <button type="submit">Votar</button>
                        </form>
                    ))}
                </div>
            ) : (
                <div>No hay pools donde seas juez.</div>
            )}
        </div>
    );
}

function hexToUtf8(hex: string) {
    if (!hex) return '';
    if (hex.length % 2 !== 0) hex = '0' + hex;
    return decodeURIComponent(hex.replace(/(..)/g, '%$1'));
}

export default VotosComponent;


