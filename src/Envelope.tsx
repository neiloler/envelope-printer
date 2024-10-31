import './envelope.css';

interface EnvelopeProps {
  address: {
    name: string;
    street: string;
    cityStateZip: string;
  };
}

const Envelope: React.FC<EnvelopeProps> = ({ address }) => {
  return (
    <div className="envelope">
      <div className="store-address">
        Feels Deals<br />
        123 Seller St.<br />
        Townsville, ST 12345
      </div>
      <div className="recipient-address">
        {address.name}<br />
        {address.street}<br />
        {address.cityStateZip}
      </div>
    </div>
  );
}

export default Envelope;
