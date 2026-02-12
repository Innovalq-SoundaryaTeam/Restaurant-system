import React, { useEffect, useState, useRef, useCallback } from "react";
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
      console.log("Order Data Loaded:", parsedOrder);

      setOrderDetails(parsedOrder);
      
      // Load session details if session_id exists
      if (parsedOrder.sessionId) {
        loadSessionDetails(parsedOrder.sessionId);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error parsing order JSON:", err);
      navigate("/menu");
    }
  }, [navigate]);

  const loadSessionDetails = async (sessionId) => {
    if (!sessionId) return;

    try {
      const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Session fetch failed");

      const data = await res.json();

      if (!data) return;

      setSessionData(data);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error loading session details:", err);
    }
  };

  // -------------------- WebSocket Logic --------------------
  useEffect(() => {
    // Only connect if we have an order ID and haven't connected yet
    if (orderDetails?.orderId && !socketConnected.current) {
      try {
        websocketService.connect();
        socketConnected.current = true;

        const handleStatusUpdate = ({ order_id, status }) => {
          if (order_id === orderDetails.orderId) {
            setOrderDetails((prev) => {
              const updated = { ...prev, status };
              localStorage.setItem("lastOrder", JSON.stringify(updated));
              return updated;
            });
            
            // Refresh session details if we have a session
            if (orderDetails.sessionId) {
              loadSessionDetails(orderDetails.sessionId);
            }
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

  const handleTrackOrder = (orderId) => {
    if (!orderId) return;

    navigate(`/track-order/${orderId}`);
  };

  const handleNewOrder = () => {
    navigate("/usermenu", {
      state: {
        sessionId: sessionData.session_id,
        tableNumber: sessionData.table_number,
      },
    });
  };

  if (loading) return <div className="order-container">Loading...</div>;

  return (
    <div className="order-container">
      <h2>Table {sessionData?.table_number} Orders</h2>

      {orders.length === 0 && (
        <p>No orders yet.</p>
      )}

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <p><strong>Order Number:</strong> {order.order_number}</p>
          <p><strong>Total Amount:</strong> ₹{Number(order.total_price).toFixed(2)}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <button
            className="track-btn"
            onClick={() => handleTrackOrder(order.id)}
          >
            Track Order
          </button>

          {orderDetails.mealFinished && orderDetails.sessionId && (
            <button onClick={() => window.open(`http://localhost:8000/api/sessions/${orderDetails.sessionId}/invoice/download`)} className="download-btn">
              📄 Download Bill
            </button>
          )}
        </div>
      ))}

      <button className="new-order-btn" onClick={handleNewOrder}>
        + New Order
      </button>
    </div>
  );
};

export default OrderPlacedPage;
