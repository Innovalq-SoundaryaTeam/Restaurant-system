import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import websocketService from "../services/websocket";
import "../styles/OrderPlacedPage.css";

const OrderPlacedPage = () => {
  const navigate = useNavigate();
  const socketConnected = useRef(false);

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------- Initialization --------------------
  useEffect(() => {
    const savedOrder = localStorage.getItem("lastOrder");

    if (!savedOrder) {
      console.error("No order found in local storage");
      navigate("/menu");
      return;
    }

    try {
      const parsedOrder = JSON.parse(savedOrder);
      
      // DEBUG: If your total is missing, check this log in the browser console
      console.log("Order Data Loaded:", parsedOrder);

      setOrderDetails(parsedOrder);
      setLoading(false);
    } catch (err) {
      console.error("Error parsing order JSON:", err);
      navigate("/menu");
    }
  }, [navigate]);

  // -------------------- WebSocket Logic --------------------
  useEffect(() => {
    // Only connect if we have an order ID and haven't connected yet
    if (orderDetails?.orderId && !socketConnected.current) {
      websocketService.connect();
      socketConnected.current = true;

      const handleStatusUpdate = ({ order_id, status }) => {
        if (order_id === orderDetails.orderId) {
          setOrderDetails((prev) => {
            const updated = { ...prev, status };
            // Keep localStorage in sync so refresh doesn't lose the status
            localStorage.setItem("lastOrder", JSON.stringify(updated));
            return updated;
          });
        }
      };

      websocketService.on("orderStatusUpdate", handleStatusUpdate);

      return () => {
        websocketService.off("orderStatusUpdate", handleStatusUpdate);
        websocketService.disconnect();
        socketConnected.current = false;
      };
    }
  }, [orderDetails?.orderId]);

  // -------------------- Helpers --------------------
  
  // Safely parse the amount even if it's a string or has a different key
  const renderAmount = () => {
    const amount = orderDetails?.totalAmount ?? orderDetails?.total_amount ?? 0;
    return Number(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  const handleDownloadBill = useCallback(() => {
    if (!orderDetails?.billUrl) return;
    
    // Use an environment variable for the base URL in production
    const API_BASE = "http://localhost:8000"; 
    const link = document.createElement("a");
    link.href = `${API_BASE}${orderDetails.billUrl}`;
    link.download = orderDetails.billFilename || `Bill-${orderDetails.orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [orderDetails]);

  // const handleTrackOrder = () => {
  //   if (orderDetails?.orderId) {
  //     navigate(`/kitchen?order_id=${orderDetails.orderId}`);
  //   }
  // };

  const handleNewOrder = () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("lastOrder");
    navigate("/usermenu");
  };

  const handleFinishMeal = () => {
    setOrderDetails((prev) => ({ ...prev, mealFinished: true }));
  };

  // -------------------- UI --------------------
  if (loading || !orderDetails) {
    return (
      <div className="order-placed-container">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="order-placed-container">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <h1>
          {orderDetails.mealFinished
            ? "Thank You for Your Visit!"
            : "Order Placed Successfully!"}
        </h1>

        <div className="order-summary">
          <div className="summary-item">
            <span>Order Number:</span>
            <span className="order-number">{orderDetails.orderNumber || "N/A"}</span>
          </div>

          <div className="summary-item"
          >
            <span>Table:</span>
            <span 
            style={{color:"black",fontWeight:"bold",fontSize:"medium"}}
            >{orderDetails.tableNumber || "N/A"}</span>
          </div>

          <div className="summary-item">
            <span>Total Amount:</span>
            <span className="total-amount highlight">{renderAmount()}</span>
          </div>

          {orderDetails.status && (
            <div className="summary-item">
              <span>Status:</span>
              <span className={`status-badge ${orderDetails.status.toLowerCase()}`}>
                {orderDetails.status}
              </span>
            </div>
          )}
        </div>

        <div className="success-message">
          <p>📧 Your bill has been sent to <strong>{orderDetails.customerEmail || 'your email'}</strong></p>
          {!orderDetails.mealFinished && <p>🍽️ Your order is being prepared in the kitchen.</p>}
        </div>

        <div className="action-buttons">
          {orderDetails.billUrl && (
            <button onClick={handleDownloadBill} className="download-btn">
              📄 Download Bill
            </button>
          )}

          <button 
          // onClick={handleTrackOrder} 
          className="track-btn">
            📍 Track Order
          </button>

          <button 
          onClick={handleNewOrder} 
          className="new-order-btn">
            🍴 New Order
          </button>

          {!orderDetails.mealFinished && (
            <button onClick={handleFinishMeal} className="finish-meal-btn">
              ✅ Finish Meal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPlacedPage;