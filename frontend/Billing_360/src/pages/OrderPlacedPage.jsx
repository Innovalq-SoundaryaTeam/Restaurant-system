import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import websocketService from "../services/websocket";
import "../styles/OrderPlacedPage.css";

const OrderPlacedPage = () => {
  const navigate = useNavigate();
  const socketConnected = useRef(false);

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------- Load Order + WebSocket --------------------
  useEffect(() => {
    const savedOrder = localStorage.getItem("lastOrder");

    if (!savedOrder) {
      navigate("/menu");
      return;
    }

    const parsedOrder = JSON.parse(savedOrder);
    setOrderDetails(parsedOrder);
    setLoading(false);

    // Connect WebSocket once
    if (!socketConnected.current) {
      websocketService.connect();
      socketConnected.current = true;
    }

    // Listen for order status updates
    const handleStatusUpdate = ({ order_id, status }) => {
      setOrderDetails((prev) => {
        if (!prev || prev.orderId !== order_id) return prev;
        return { ...prev, status };
      });
    };

    websocketService.on("orderStatusUpdate", handleStatusUpdate);

    // Cleanup
    return () => {
      websocketService.off("orderStatusUpdate", handleStatusUpdate);
      websocketService.disconnect();
      socketConnected.current = false;
    };
  }, [navigate]);

  // -------------------- Actions --------------------

  const handleDownloadBill = () => {
    if (!orderDetails?.billUrl) return;

    const link = document.createElement("a");
    link.href = `http://localhost:8000${orderDetails.billUrl}`;
    link.download = orderDetails.billFilename || "bill.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTrackOrder = () => {
    if (orderDetails?.orderId) {
      navigate(`/kitchen?order_id=${orderDetails.orderId}`);
    }
  };

  const handleNewOrder = () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("lastOrder");
    navigate("/menu");
  };

  const handleFinishMeal = () => {
    setOrderDetails((prev) => ({
      ...prev,
      mealFinished: true,
    }));
  };

  // -------------------- Loading --------------------
  if (loading || !orderDetails) {
    return (
      <div className="order-placed-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  // -------------------- UI --------------------
  return (
    <div className="order-placed-container">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <h1>
          {orderDetails.mealFinished
            ? "Thank You for Your Meal!"
            : "Order Placed Successfully!"}
        </h1>

        <div className="order-summary">
          <div className="summary-item">
            <span>Order Number:</span>
            <span className="order-number">
              {orderDetails.orderNumber}
            </span>
          </div>

          <div className="summary-item">
            <span>Table:</span>
            <span>{orderDetails.tableNumber}</span>
          </div>

          <div className="summary-item">
            <span>Total Amount:</span>
            <span className="total-amount">
              ₹{Number(orderDetails.totalAmount || 0).toFixed(2)}
            </span>
          </div>

          {orderDetails.customerEmail && (
            <div className="summary-item">
              <span>Email:</span>
              <span>{orderDetails.customerEmail}</span>
            </div>
          )}

          {orderDetails.status && (
            <div className="summary-item">
              <span>Status:</span>
              <span className="status-badge">
                {orderDetails.status}
              </span>
            </div>
          )}
        </div>

        <div className="success-message">
          <p>📧 Your bill has been sent to your email</p>
          <p>🍽️ Your order is being prepared in the kitchen</p>
          {orderDetails.mealFinished && <p>🎉 Enjoy your meal!</p>}
        </div>

        <div className="action-buttons">
          {orderDetails.billUrl && (
            <button onClick={handleDownloadBill} className="download-btn">
              📄 Download Bill
            </button>
          )}

          <button onClick={handleTrackOrder} className="track-btn">
            📍 Track Order
          </button>

          <button onClick={handleNewOrder} className="new-order-btn">
            🍴 New Order
          </button>

          {!orderDetails.mealFinished && (
            <button
              onClick={handleFinishMeal}
              className="finish-meal-btn"
            >
              ✅ Finish Meal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPlacedPage;
