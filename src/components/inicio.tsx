import SendPaymentComponent from "./SendPayment";

interface InicioProps {
  wallet: { address: string; secret: string }
  client: any
}
const InicioComponent: React.FC<InicioProps> = ({ wallet, client }) => {
  return (
    <div>  
      <h2>Bienvenido a tu billetera</h2>
      <p>Dirección: {wallet.address}</p>
      <p>Secreto: {wallet.secret}</p>
      <SendPaymentComponent wallet={wallet} client={client} />
    </div>
  );
};


export default InicioComponent;
