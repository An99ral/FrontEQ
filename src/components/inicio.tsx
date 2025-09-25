import { useState } from "react";
import SendPaymentComponent from "./SendPayment";
import ResponsiveAppBar from "./com/ResponsiveAppBar";
import BalanceComponent from "./transacciones/balance";
import FundingComponent from "./transacciones/funding";
import FundingCreateComponent from "./transacciones/fundingcreate"
import LandPage from "./land";
import Footer from "./com/footer";
import type { Margin } from "@mui/icons-material";

interface InicioProps {
  wallet: { address: string; secret: string }
  client: any
}
const InicioComponent: React.FC<InicioProps> = ({ wallet, client }) => {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="main-container">
      <ResponsiveAppBar onPageChange={setActivePage}/>
      <div className="page-content">
        {activePage === "home" && <LandPage />}
        {activePage === "payment" && <SendPaymentComponent wallet={wallet} client={client} />}
        {activePage === "funding" && (
          <FundingComponent wallet={wallet} client={client} onPageChange={setActivePage} />
        )}
        
        {activePage === "profile" && <BalanceComponent wallet={wallet} client={client} />}
      </div>
      <Footer />
    </div>
  );
};

export default InicioComponent;