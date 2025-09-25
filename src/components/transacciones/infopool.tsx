import React from "react";
import { getObjects } from "../../core";
import Cerrar from "./cerrar";

interface InfoPoolProps {
    wallet: { address: string; secret: string }
    client: any;
    address: string;
    offerSequence: number;
}

const InfoPoolComponent: React.FC<InfoPoolProps> = ({ client, address, wallet, offerSequence }) => {
    const [data, setData] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getObjects(client, address);
                setData(res);
            } catch (e: any) {
                setError(e?.message || String(e));
            }
        };
        fetchData();
    }, [client, address]);

    if (error) return <div>Error: {error}</div>;

    const RIPPLE_EPOCH_OFFSET = 946684800;

    return (
        <div className="pools-page">
            <h2>fundings en los que eres dueño</h2>

            {data?.result?.account_objects2?.length ? (
                <div className="pools-grid">
                    {data.result.account_objects2.map((obj: any, i: number) => (
                        <div key={i} className="card pool-card">
                            <div><b>Nombre:</b> {obj.PoolName}</div>
                            <div>
                                <b>Tiempo límite:</b>{" "}
                                {obj.CancelAfter
                                    ? new Date((obj.CancelAfter + RIPPLE_EPOCH_OFFSET) * 1000).toLocaleString()
                                    : "N/A"}
                            </div>
                            <div>
                                <b>Tiempo de finalización:</b>{" "}
                                {obj.FinishAfter
                                    ? new Date((obj.FinishAfter + RIPPLE_EPOCH_OFFSET) * 1000).toLocaleString()
                                    : "N/A"}
                            </div>
                            <div><b>jueces:</b> {obj.AuthAccounts ? obj.AuthAccounts.length : 0}</div>
                            <div><b>Monto total:</b> {obj.Amount / 1_000_000} EQ</div>

                            {Array.isArray(obj.Stages) && (
                                <div className="pool-stages">
                                    <b>Etapas:</b>
                                    <ul>
                                        {obj.Stages.map((stageObj: any, idx: number) => {
                                            const isValidated = stageObj?.Stage?.StageFlags === 262144;
                                            return (
                                                <li key={idx}>
                                                    <b>{stageObj?.Stage?.StageData}</b>
                                                    <div>
                                                        <b>estado:</b> {isValidated ? "validado" : "pendiente"}
                                                    </div>
                                                    {isValidated && (
                                                        
                                                        <Cerrar
                                                            client={client}
                                                            address={address}
                                                            wallet={wallet}
                                                            
                                                            offerSequence={obj.OfferSequence} // <-- usa el OfferSequence del pool, no del stage
                                                        />
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default InfoPoolComponent;