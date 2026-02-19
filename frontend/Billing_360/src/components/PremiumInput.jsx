import '../styles/PremiumInput.css'

export default function PremiumInput({label, placeholder, type="text"}) {
  return (
    <>
    <div className="premium-field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder}/>
    </div>
    </>
  );
}
