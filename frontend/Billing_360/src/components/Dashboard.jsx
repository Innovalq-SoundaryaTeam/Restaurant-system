import { useState } from "react";
import EarningsChart from "../charts/EarningsBar";
import OrdersPie from "../charts/OrdersPie";
import Metricard from "./Metricard";
import Topselling from "./Topselling";
import OrdersFrom from "./OrdersFrom";
import "../styles/dashboard.css"; // Ensure you use the new dark theme CSS

export default function Dashboard() {
  const [range, setRange] = useState("monthly");

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="header-search">
          <input type="text" placeholder="Search data..." />
        </div>
      </header>

      {/* Metric Cards with HotelPro Accent Borders */}
      <div className="metrics-row">
  <Metricard title="Orders" value="120" color="#007bff" trend="+12%" iconType="order" />
  <Metricard title="Revenue" value="45k" color="#00c853" trend="+8%" iconType="revenue" />
  <Metricard title="Expenses" value="12k" color="#ff4444" trend="+5%" iconType="expenses" />
  <Metricard title="Stock" value="Low" color="#ffab40" trend="Check" iconType="stock" />
  <Metricard title="Staff" value="20" color="#0ff50b" trend="+3%" iconType="staff" />
</div>

      <div className="dashboard-grid-main">
        <div className="chart-section main-revenue">
          <div className="section-header">
            <h3>Weekly Revenue</h3>
          </div>
          <EarningsChart range={range} setRange={setRange} />
        </div>

        <div className="chart-section order-types">
          <div className="section-header">
            <h3>Order Types</h3>
          </div>
          <OrdersPie />
        </div>
      </div>

      <div className="dashboard-grid-secondary">
        <div className="list-section">
          <Topselling />
        </div>
        <div className="list-section">
          <OrdersFrom />
        </div>
      </div>
    </div>
  );
}