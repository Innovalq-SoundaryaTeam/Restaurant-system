import React from "react";
import "../styles/Topselling.css";

export default function Topselling() {
  const items = [
    { name: "Italiano pizza", count: "124 orders", price: "₹450", img: "https://via.placeholder.com/50" },
    { name: "Cheese Momos", count: "116 orders", price: "₹180", img: "https://via.placeholder.com/50" },
    { name: "French fries", count: "200 orders", price: "₹120", img: "https://via.placeholder.com/50" },
    { name: "Cheese Sandwich", count: "50 orders", price: "₹150", img: "https://via.placeholder.com/50" },
  ];

  return (
    <div className="topselling-card">
      <header className="topselling-header">
        <h3 className="gopron-font blue-text">Top Selling Items</h3>
        <span className="view-all">Full Report</span>
      </header>

      <div className="items-list">
        {items.map((item, i) => (
          <div className="topselling-item-row" key={i}>
            {/* Left Section: Fixed Width */}
            <div className="item-left-content">
              <div className="rank-badge">{i + 1}</div>
              <div className="img-container">
                <img src={item.img} alt={item.name} />
              </div>
            </div>

            {/* Middle Section: Flexible (Takes all available space) */}
            <div className="item-details">
              <span className="item-name">{item.name}</span>
              <span className="item-count">{item.count}</span>
            </div>

            {/* Right Section: Fixed Width & Aligned Right */}
            <div className="item-price gopron-font">
              {item.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}