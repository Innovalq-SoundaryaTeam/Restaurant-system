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
        <Metricard title="Today's Orders" value="128" color="#00c853" trend="+12% from yesterday" />
        <Metricard title="Today's Revenue" value="$400.00" color="#2979ff" trend="+8% from yesterday" />
        <Metricard title="Low Stock Items" value="1" color="#ffab40" trend="Need reorder" />
        <Metricard title="Staff Present" value="8/10" color="#f50057" trend="All tables occupied" />
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