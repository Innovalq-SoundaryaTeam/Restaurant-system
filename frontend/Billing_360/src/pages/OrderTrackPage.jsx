import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaFileInvoiceDollar, FaCircle } from "react-icons/fa";
import "../styles/OrderTrackPage.css";

const OrderTrackPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSessionUpdates = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsUpdating(true);

      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.session_id) {
        const sessionRes = await fetch(`http://127.0.0.1:8000/api/sessions/${data.session_id}`);
        const sessionJson = await sessionRes.json();
        setSessionData(sessionJson);
      } else {
        setSessionData({ orders: [data], table_number: data.table_number, session_id: data.session_id });
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsUpdating(false), 800);
    }
  }, [orderId]);

  useEffect(() => {
    fetchSessionUpdates(true);
    const interval = setInterval(() => fetchSessionUpdates(false), 4000);
    return () => clearInterval(interval);
  }, [fetchSessionUpdates]);

  // NEW: Function to trigger WhatsApp bill via Backend
  const handleGenerateBill = async () => {
    try {
      setIsUpdating(true);
      const targetId = sessionData.orders[0]?.id || orderId;

      // Ensure the URL matches your backend route (main.py uses /api/generate-bill)
      const response = await fetch(`http://127.0.0.1:8000/api/generate-bill/${targetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert("Bill sent successfully to your WhatsApp! ✅");
        navigate(`/checkout/${sessionData.session_id || orderId}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Could not send bill"}`);
      }
    } catch (err) {
      console.error("Billing Error:", err);
      alert("Failed to connect to server.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !sessionData) return <div className="loader-dark">Syncing Control Panel...</div>;

  const totalSessionAmount = sessionData.orders.reduce((sum, o) => sum + Number(o.total_price), 0);

  return (
    <div className="order-track-page dark-theme">
      <div className="track-wrapper">
        <header className="premium-header">
          <div className="header-brand">
            <button className="back-glass-btn" onClick={() => navigate("/usermenu")}><FaArrowLeft /></button>
            <div className="table-badge gopron-font">TABLE {sessionData.table_number}</div>
          </div>
          <div className="header-meta">
            <div className="cumulative-card">
              <span className="label">SESSION TOTAL</span>
              <span className="value gopron-font ">₹{totalSessionAmount.toFixed(2)}</span>
            </div>
          </div>
        </header>

        <div className="horizontal-neon-strip">
          {sessionData.orders.map((order, idx) => (
            <div key={idx} className={`neon-order-card compact ${order.status?.toLowerCase()}`}>
              <div className="card-floating-id">0{idx + 1}</div>
              <header className="card-top">
                <span className="order-num gopron-font">ORD #{order.order_number?.slice(-4) || order.id}</span>
                <div className="status-indicator">
                  <FaCircle className="status-dot" />
                  <span className="status-text">{order.status}</span>
                </div>
              </header>
              <div className="card-content">
                {order.items?.map((item, i) => (
                  <div key={i} className="item-row-wire">
                    <span className="item-qty gopron-font">{item.quantity}x</span>
                    <span className="item-name">{item.item_name || item.name}</span>
                  </div>
                ))}
              </div>
              <footer className="card-footer">
                <div className="footer-label-group">
                  <span className="footer-label">AMOUNT PAYABLE</span>
                  <span className="footer-amount gopron-font">₹{order.total_price}</span>
                </div>
              </footer>
            </div>
          ))}
        </div>

        <footer className="action-dock-wire">
          <button className="dock-btn secondary gopron-font" onClick={() => navigate("/usermenu")}>
            <FaPlus /> Add more item
          </button>
          <button 
            className="dock-btn primary gopron-font" 
            onClick={handleGenerateBill}
            disabled={isUpdating}
          >
            {isUpdating ? "Sending..." : "Generate bill"} <FaFileInvoiceDollar />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OrderTrackPage;