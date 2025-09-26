import React from "react";
import { getJudgeFundingPools } from "../../core";

interface InfoPoolProps {
    client: any;
    address: string;
}
const PoolActivComponent: React.FC<InfoPoolProps> = ({ client, address }) => {
    const [data, setData] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                if (!client || !address) return;
                const res = await getJudgeFundingPools(client, address);
                console.log("getJudgeFundingPools data:", res); // ver qué llega
                setData(res);
            } catch (e: any) {
                setError(e?.message || String(e));
            }
        };
        fetchData();
    }, [client, address]);

    return (
        <div>
            <h2>Fundings donde eres juez</h2>
            {error && <p>{error}</p>}
            {data && Array.isArray(data) && data.length > 0 ? (
                data.map((pool: any, idx: number) => {
                    const isUrl = typeof pool.PoolData === "string" && /^https?:\/\//i.test(pool.PoolData);
                    return (
                        <div key={idx} className="votos-grid" style={{ marginBottom: 16, padding: 12, border: '1px solid #333', borderRadius: 8 }}>
                            <div><b>Nombre del Pool:</b> {pool.PoolName || ''}</div>
                            <div><b>Secuencia:</b> {pool.PoolSequence}</div>
                            <div><b>Dueño:</b> {pool.PoolOwner}</div>
                            <div><b>Juez:</b> {pool.Judge}</div>
                            <div><b>Fecha límite:</b> {pool.CancelAfter ? new Date((pool.CancelAfter + 946684800) * 1000).toLocaleString() : 'N/A'}</div>
                            <div><b>Estado:</b> {pool.Status}</div>

                            {/* Mostrar imagen si PoolData es URL, si no mostrar texto */}
                            {isUrl ? (
                                <div style={{ marginTop: 8 }}>
                                    <img src={pool.PoolData} alt={pool.PoolName || "imagen"} style={{ maxWidth: "100%", borderRadius: 8 }} />
                                </div>
                            ) : (
                                <div><b>Descripción:</b> {pool.PoolData || ''}</div>
                            )}

                            <div>
                                <h3>Etapas:</h3>
                                <ul>
                                    {Array.isArray(pool.Stages) && pool.Stages.length > 0 ? (
                                        pool.Stages.map((stageObj: any, sidx: number) => {
                                            const isValidated = stageObj.StageFlags === 262144;
                                            const finish = stageObj.StageFlags === 786432;
                                            const pendiente = !isValidated && !finish;
                                            return (
                                                <li key={sidx}>
                                                    <div>
                                                        <b>estado:</b> {isValidated ? "validado" : finish ? "finalizado" : "pendiente"}
                                                        <div>Índice: {stageObj.StageIndex}</div>
                                                    </div>
                                                    {pendiente && (
                                                        <div style={{ marginLeft: 12 }}>
                                                            <div>Flags: {stageObj.StageFlags}</div>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li>No hay etapas</li>
                                    )}
                                </ul>
                            </div>
                            <div><b>Tiempo restante:</b> {pool.TimeLeft}</div>
                        </div>
                    );
                })
            ) : (
                <div>No hay pools donde seas juez.</div>
            )}
        </div>
    );
};

// hexToUtf8 local ya no se usa aquí porque los datos vienen decodificados desde core
export default PoolActivComponent;


