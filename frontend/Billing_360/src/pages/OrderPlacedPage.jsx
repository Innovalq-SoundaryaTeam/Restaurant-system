import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import websocketService from "../services/websocket";
import "../styles/OrderPlacedPage.css";

const OrderPlacedPage = () => {
  const navigate = useNavigate();
  const socketConnected = useRef(false);

  const [orderDetails, setOrderDetails] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mealFinished, setMealFinished] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);

  // -------------------- Load Last Order --------------------
  useEffect(() => {
    const savedOrder = localStorage.getItem("lastOrder");

    if (!savedOrder) {
      navigate("/usermenu");
      return;
    }

    try {
      const parsedOrder = JSON.parse(savedOrder);

      if (!parsedOrder.sessionId) {
        navigate("/usermenu");
        return;
      }

      setOrderDetails(parsedOrder);
      loadSession(parsedOrder.sessionId);
    } catch (err) {
      console.error("Invalid localStorage order");
      navigate("/usermenu");
    }
  }, [navigate]);

  // -------------------- Load Session --------------------
  const loadSession = async (sessionId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/sessions/${sessionId}`
      );

      if (!res.ok) {
        navigate("/usermenu");
        return;
      }

      const data = await res.json();

      setSessionData(data);
      setOrders(data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error("Session load error:", err);
      navigate("/usermenu");
    }
  };

  // -------------------- WebSocket Logic --------------------
  useEffect(() => {
    if (orderDetails?.orderId && !socketConnected.current) {
      try {
        websocketService.connect();
        socketConnected.current = true;

        const handleStatusUpdate = ({ order_id, status }) => {
          // Update order details if it's the current order
          if (order_id === orderDetails.orderId) {
            setOrderDetails((prev) => {
              const updated = { ...prev, status };
              localStorage.setItem("lastOrder", JSON.stringify(updated));
              return updated;
            });
          }
          
          // Refresh session to update order list
          if (orderDetails.sessionId) {
            loadSession(orderDetails.sessionId);
          }
        };

        websocketService.on("orderStatusUpdate", handleStatusUpdate);

        return () => {
          websocketService.off("orderStatusUpdate", handleStatusUpdate);
          websocketService.disconnect();
          socketConnected.current = false;
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        // Don't crash if WebSocket fails
      }
    }
  }, [orderDetails?.orderId, orderDetails?.sessionId]);

  // -------------------- Track Order --------------------
  const handleTrackOrder = (orderId) => {
    if (!orderId || isNaN(orderId)) return;
    navigate(`/track-order/${orderId}`);
  };

  // -------------------- New Order --------------------
  const handleNewOrder = () => {
    localStorage.removeItem("cart");

    navigate("/usermenu", {
      state: {
        sessionId: sessionData?.session_id,
        tableNumber: sessionData?.table_number,
      },
    });
  };

  // -------------------- Finish Meal --------------------
  const handleFinishMeal = async () => {
    if (!orderDetails?.sessionId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${orderDetails.sessionId}/finish`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setMealFinished(true);
        setSessionSummary(result);
      } else {
        console.error("Error finishing meal");
      }
    } catch (error) {
      console.error("Error finishing meal:", error);
    }
  };

  // -------------------- Download Bill --------------------
  const handleDownloadBill = () => {
    if (!orderDetails?.sessionId) return;
    window.open(`http://localhost:8000/api/sessions/${orderDetails.sessionId}/invoice/download`);
  };

  if (loading) {
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
          {mealFinished
            ? "Thank You for Your Visit!"
            : "Order Placed Successfully!"}
        </h1>

        {sessionData && (
          <div className="session-info" style={{backgroundColor: "#f0f8ff", padding: "10px", borderRadius: "8px", marginBottom: "15px"}}>
            <h3>Session: Table {sessionData.table_number}</h3>
            
            {orders.length > 0 && (
              <div className="orders-container">
                {orders.map(order => (
                  <div key={order.id} className="order-card" style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", margin: "5px 0", backgroundColor: "#fff", borderRadius: "5px"}}>
                    <div>
                      <h4>{order.order_number}</h4>
                      <p>Status: {order.status}</p>
                      <p>Total: ₹{Number(order.total_price).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => handleTrackOrder(order.id)}
                      className="track-btn"
                      style={{padding: "5px 10px", fontSize: "12px", marginLeft: "10px"}}
                    >
                      Track Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!mealFinished && orderDetails && (
          <div className="order-summary">
            <div className="summary-item">
              <span>Order Number:</span>
              <span className="order-number">{orderDetails.orderNumber || "N/A"}</span>
            </div>

            <div className="summary-item">
              <span>Table:</span>
              <span 
              style={{color:"black",fontWeight:"bold",fontSize:"medium"}}
              >{orderDetails.tableNumber || "N/A"}</span>
            </div>

            <div className="summary-item">
              <span>Total Amount:</span>
              <span className="total-amount highlight">₹{Number(orderDetails.totalAmount || 0).toFixed(2)}</span>
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
        )}

        {mealFinished && sessionSummary && (
          <div className="session-summary" style={{backgroundColor: "#f0fff0", padding: "15px", borderRadius: "8px", marginBottom: "15px"}}>
            <h3>Session Summary</h3>
            <p><strong>Total Orders:</strong> {sessionSummary.total_orders}</p>
            <p><strong>Subtotal:</strong> ₹{Number(sessionSummary.subtotal).toFixed(2)}</p>
            <p><strong>Tax (18%):</strong> ₹{Number(sessionSummary.tax).toFixed(2)}</p>
            <p><strong>Grand Total:</strong> ₹{Number(sessionSummary.grand_total).toFixed(2)}</p>
          </div>
        )}

        <div className="success-message">
          <p>📧 Your bill has been sent to <strong>{orderDetails.customerEmail || 'your email'}</strong></p>
          {!mealFinished && <p>🍽️ Your order is being prepared in the kitchen.</p>}
        </div>

        <div className="action-buttons">
          {mealFinished && orderDetails.sessionId && (
            <button onClick={handleDownloadBill} className="download-btn">
              📄 Download Bill
            </button>
          )}

          {!mealFinished && orderDetails.orderId && (
            <button 
              onClick={() => handleTrackOrder(orderDetails.orderId)} 
              className="track-btn">
              📍 Track Order
            </button>
          )}

          <button 
            onClick={handleNewOrder} 
            className="new-order-btn">
            🍴 New Order
          </button>

          {!mealFinished && orderDetails.sessionId && (
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
