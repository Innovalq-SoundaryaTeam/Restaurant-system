import { FaShoppingCart, FaRupeeSign, FaBox, FaUsers, FaDollarSign } from "react-icons/fa"; 
import { SiExpensify } from "react-icons/si";
import "../styles/Metricard.css";

export default function Metricard({ title, value, color, trend, iconType }) {
  const icons = {
    order: <FaShoppingCart />,
    revenue: <FaDollarSign />,
    revenue: <FaRupeeSign />, 
    expenses: <SiExpensify />,
    stock: <FaBox />,
    staff: <FaUsers />
  };

  return (
    <div className="premium-metric-card" style={{ "--accent": color }}>
      <div className="left-glow-strip"></div>
      
      <div className="card-shine"></div>
      
      <div className="card-content">
        <div className="card-info">
          <p className="card-title">{title}</p>
          {/* Ensure the value passed from Dashboard includes the ₹ symbol or add it here */}
          <h2 className="card-value gopron-font">
            {iconType === 'revenue' || iconType === 'expenses' ? `₹${value}` : value}
          </h2>
          <div className="trend-pill">
             <p className="card-trend" style={{ color: trend.includes('+') ? '#00c853' : '#ffab40' }}>
               {trend}
             </p>
          </div>
        </div>
        
        <div className="icon-container">
          <div className="icon-bloom" style={{ backgroundColor: color }}></div>
          <div className="icon-wrapper" style={{ color: color }}>
            {icons[iconType]}
          </div>
        </div>
      </div>
    </div>
  );
}