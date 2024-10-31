import './Envelope.css';

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
      <img src="/return-address.webp" alt="Return Address" className="return-address" />
      <div className="recipient-address">
        {address.name}<br />
        {address.street}<br />
        {address.cityStateZip}
      </div>
    </div>
  );
}

export default Envelope;
