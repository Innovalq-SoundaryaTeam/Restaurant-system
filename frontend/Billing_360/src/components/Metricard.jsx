import { FaShoppingCart, FaDollarSign, FaBox, FaUsers } from "react-icons/fa";

export default function Metricard({ title, value, color, trend, iconType }) {
  // Mapping icons to types
  const icons = {
    order: <FaShoppingCart />,
    revenue: <FaDollarSign />,
    stock: <FaBox />,
    staff: <FaUsers />
  };

  return (
    <div className="metric-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="card-content">
        <div className="card-info">
          <p className="card-title">{title}</p>
          <h2 className="card-value">{value}</h2>
          <p className="card-trend" style={{ color: trend.includes('+') ? '#00c853' : '#ffab40' }}>
            {trend}
          </p>
        </div>
        <div className="card-icon" style={{ backgroundColor: `${color}22`, color: color }}>
          {icons[iconType]}
        </div>
      </div>
    </div>
  );
}