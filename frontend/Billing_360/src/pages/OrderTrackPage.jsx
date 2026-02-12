import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/OrderTrackPage.css";

const OrderTrackPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setError("Invalid Order ID");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://127.0.0.1:8000/api/orders/${orderId}`
        );

        if (!response.ok) {
          throw new Error("Order not found");
        }

        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 🔵 Loading State
  if (loading) {
    return (
      <div className="order-track-container">
        <div className="track-card">
          <h2>Loading Order...</h2>
        </div>
      </div>
    );
  }

  // 🔴 Error State
  if (error) {
    return (
      <div className="order-track-container">
        <div className="track-card">
          <h2 style={{ color: "red" }}>❌ {error}</h2>
          <button onClick={() => navigate("/usermenu")}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // 🟢 Success State
  return (
    <div className="order-track-container">
      <div className="track-card">
        <h2>Order #{orderDetails.order_number}</h2>

        <p>
          <strong>Table:</strong> {orderDetails.table_number}
        </p>

        <p>
          <strong>Status:</strong> {orderDetails.status}
        </p>

        <p>
          <strong>Total:</strong> ₹
          {Number(orderDetails.total_price).toFixed(2)}
        </p>

        <button onClick={() => navigate("/order-placed")}>
          Back
        </button>
      </div>
    </div>
  );
};

export default OrderTrackPage;
