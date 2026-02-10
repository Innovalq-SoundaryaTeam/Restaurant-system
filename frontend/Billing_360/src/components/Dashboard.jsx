import { useState } from "react";
import EarningsChart from "../charts/EarningsBar";
import OrdersPie from "../charts/OrdersPie";
import Metricard from "./Metricard";
import Topselling from "./Topselling";
import OrdersFrom from "./OrdersFrom";

export default function Dashboard() {
  const [range, setRange] = useState("monthly");

  return (
    <div className="dashboard">
      <div className="grid-2">
        <EarningsChart range={range} setRange={setRange} />

        <div className="metrics">
          <Metricard title="Total Menus" value="128" />
          <Metricard title="Revenue" value="400" />
          <Metricard title="Items Sold" value="678" />
          <Metricard title="Total Orders" value="128" />
        </div>
      </div>

      <div className="grid-2">
        <OrdersPie />
        <Topselling />
      </div>

      
    <div className="grid-2">
        <OrdersFrom />
    </div>
    </div>
  );
}
