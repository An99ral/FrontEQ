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
                const res = await getJudgeFundingPools(client, address);
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
                data.map((pool: any, idx: number) => (
                    <div key={idx} className="votos-grid" style={{ marginBottom: 16, padding: 12, border: '1px solid #333', borderRadius: 8 }}>
                        <div><b>Nombre del Pool:</b> {pool.PoolName ? hexToUtf8(pool.PoolName) : ''}</div>
                        <div><b>Secuencia:</b> {pool.PoolSequence}</div>
                        <div><b>Dueño:</b> {pool.PoolOwner}</div>
                        <div><b>Juez:</b> {pool.Judge}</div>
                        <div><b>Fecha límite:</b> {pool.CancelAfter ? new Date((pool.CancelAfter + 946684800) * 1000).toLocaleString() : 'N/A'}</div>
                        <div><b>Estado:</b> {pool.Status}</div>
                        <div><b>Descripción:</b> {pool.PoolData ? hexToUtf8(pool.PoolData) : ''}</div>
                        <div><h3>Etapas:</h3>

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
                ))
            ) : (
                <div>No hay pools donde seas juez.</div>
            )}
        </div>
    );
};

function hexToUtf8(hex: string) {
    if (!hex) return '';
    if (hex.length % 2 !== 0) hex = '0' + hex;
    return decodeURIComponent(
        hex.replace(/(..)/g, '%$1')
    );
}

export default PoolActivComponent;


