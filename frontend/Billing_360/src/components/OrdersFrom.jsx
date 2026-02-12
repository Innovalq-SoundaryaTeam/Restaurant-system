import React from "react";
import "../styles/OrdersFrom.css";

export default function OrdersFrom() {
  const data = [
    { label: "Dine-in", value: 60, color: "#007bff" }, // Billing 360 Blue
    { label: "Takeaway", value: 25, color: "#00c853" }, // Billing 360 Green
    { label: "Online", value: 15, color: "#ffab40" },   // Warning Orange
  ];

  return (
    <div className="orders-from-card">
      <header className="orders-from-header">
        <h3 className="gopron-font blue-text">Orders Sources</h3>
      </header>

      <div className="progress-container">
        {data.map((item, i) => (
          <div key={i} className="progress-row">
            <div className="progress-info">
              <span className="source-label">{item.label}</span>
              {/* Fixed width for percentage ensures vertical alignment */}
              <span className="source-value gopron-font" style={{ color: item.color }}>
                {item.value}%
              </span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill-neon"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}44` // Subtle glow
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}