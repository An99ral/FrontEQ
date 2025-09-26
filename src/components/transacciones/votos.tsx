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

    // Etapas utilidades
    const getTotalStages = (pool: any) =>
        Array.isArray(pool?.Stages) ? pool.Stages.length : 0;

    // Verifica si se puede votar la etapa indicada (flag 0 y dentro de rango)
    // (mantengo el nombre que pediste: acitive)
    const acitive = (pool: any, stageIndex: number) => {
        const total = getTotalStages(pool);
        if (total === 0) return { ok: false, reason: "Este proyecto no tiene etapas." };
        if (stageIndex < 1 || stageIndex > total)
            return { ok: false, reason: `El proyecto solo tiene ${total} etapa(s).` };

        const stage = pool.Stages[stageIndex - 1];
        if (!stage) return { ok: false, reason: "Etapa inválida." };

        // Solo se puede votar si la etapa no ha sido votada (flag === 0)
        if (stage.StageFlags !== 0)
            return { ok: false, reason: "Esta etapa ya ha sido validada." };

        return { ok: true };
    };

    const handleSubmit = async (e: React.FormEvent, pool: any, stageIndex: number, vote: boolean) => {
        e.preventDefault();

        // Validación antes de enviar
        const check = acitive(pool, stageIndex);
        if (!check.ok) {
            alert(check.reason);
            return;
        }

        try {
            const res = await submitVote(client, wallet, {
                Owner: pool.PoolOwner,
                offerSequence: pool.PoolSequence,
                StageIndex: stageIndex,
                Vote: vote,
            });

            if (res?.result && "engine_result" in res.result && res.result.engine_result !== "tesSUCCESS") {
                alert(res.result.engine_result_message || res.result.engine_result || "La transacción no fue exitosa.");
                setError(res.result.engine_result_message || res.result.engine_result || "Transacción fallida");
            } else {
                alert("Voto enviado correctamente");
                console.log("Voto enviado correctamente:", res);
            }
        } catch (err: any) {
            setError(err?.message || String(err));
        }
    };


    return (
        <div>
            <h2>Fundings donde eres juez</h2>



            {data && Array.isArray(data) && data.length > 0 ? (
                <div className="votos-grid">
                    {data
                        .map((pool: any, idx: number) => {
                            const total = getTotalStages(pool);
                            const availableStages =
                                Array.isArray(pool.Stages)
                                    ? pool.Stages
                                        .map((s: any, i: number) => ({ index: i + 1, canVote: s?.StageFlags === 0 }))
                                        .filter(s => s.canVote)
                                    : [];
                            const canVoteAny = availableStages.length > 0;
                            const defaultStage = canVoteAny ? availableStages[0].index : "";

                            // Solo retorna el formulario si hay etapas disponibles
                            if (!canVoteAny) return null;

                            return (
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
                                    <div>Nombre: {pool.PoolName}</div>
                                    <div>
                                        <b>Secuencia:</b>
                                        <input type="number" name="offerSequence" defaultValue={pool.PoolSequence} readOnly />
                                    </div>
                                    <div>
                                        <b>Etapa:</b>
                                        <select
                                            name="StageIndex"
                                            required
                                            defaultValue={defaultStage as any}
                                        >
                                            {availableStages.map(s => (
                                                <option key={s.index} value={s.index}>
                                                    {s.index}
                                                </option>
                                            ))}
                                        </select>
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
                            );
                        })
                        .filter(Boolean)
                    }
                </div>
            ) : (
                <div>No hay pools donde seas juez.</div>
            )}
        </div>
    );
}

export default VotosComponent;


