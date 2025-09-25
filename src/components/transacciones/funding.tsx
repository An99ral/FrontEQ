import React, { useState } from "react";
import BottomTabs from "../com/bottom";
import FundingCreateComponent from "./fundingcreate";
import FundingDepositComponent from "./FundingDeposit";
import InfoPoolComponent from "./infopool";
import PoolActivComponent from "./poolactiv";
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import VotosComponent from "./votos";

interface FundingProps {
    client: any;
    wallet: { address: string; secret: string };
    onPageChange?: (page: string) => void;
}

const FundingComponent: React.FC<FundingProps> = ({ wallet, client, onPageChange }) => {
    const [tab, setTab] = useState(0);
    const [showPoolActiv, setShowPoolActiv] = useState(false);

    return (
        <div >
            <BottomTabs value={tab} onChange={setTab} />

            <div style={{ marginTop: 12, display: "flex", justifyContent: "center", maxWidth: 720, width: "100%" }}>
                {tab === 0 && <FundingCreateComponent wallet={wallet} client={client} onPageChange={onPageChange} />}
                {tab === 1 && (
                    <div className="card" style={{ maxWidth: 720, width: "100%" }}>
                        <FundingDepositComponent wallet={wallet} client={client} onPageChange={onPageChange} />
                    </div>
                )}
                {tab === 2 && (
                    <div className="votos-page">
                        <VotosComponent client={client} address={wallet.address} wallet={wallet} />
                    </div>
                )}
                {tab === 3 && (
                    <div className="card" style={{ maxWidth: 720, width: "100%" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showPoolActiv}
                                    onChange={(_, checked) => setShowPoolActiv(checked)}
                                    color="primary"
                                />
                            }
                            label={showPoolActiv ? "fundings creados" : "fundings en los que eres juez"}
                            sx={{ mb: 2 }}
                        />
                        {showPoolActiv
                            ? <PoolActivComponent client={client} address={wallet.address} />
                            : <InfoPoolComponent client={client} address={wallet.address} />
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default FundingComponent;
