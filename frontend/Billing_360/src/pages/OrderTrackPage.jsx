import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaUtensils, FaBoxOpen, FaClipboardCheck, FaArrowLeft, FaFileInvoiceDollar } from "react-icons/fa";
import "../styles/OrderTrackPage.css";

const OrderTrackPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const steps = [
    { id: "PENDING", label: "Confirmed", icon: <FaClipboardCheck /> },
    { id: "KITCHEN", label: "Preparing", icon: <FaUtensils /> },
    { id: "READY", label: "Ready", icon: <FaBoxOpen /> },
    { id: "COMPLETED", label: "Served", icon: <FaCheckCircle /> }
  ];

  // Wrapped in useCallback to prevent unnecessary re-renders
  const fetchOrder = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Order not found");
      
      const data = await response.json();
      
      // Only update state if the status has actually changed to prevent flicker
      setOrderDetails((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(data)) {
          return data;
        }
        return prev;
      });
      
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      // Don't show full error UI on background refresh to keep it smooth
      if (isInitial) setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // Initial Fetch
    fetchOrder(true);

    // Automatic polling every 3 seconds for near-instant updates
    const interval = setInterval(() => {
      fetchOrder(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) return <div className="loader-view-dark"><div className="spinner"></div><h2 className="gopron-font">TRACKING...</h2></div>;
  if (error) return <div className="error-view-dark"><h2>❌ {error}</h2><button onClick={() => navigate("/")}>Home</button></div>;
  if (!orderDetails) return null;

  const currentStatus = orderDetails.status?.toUpperCase();
  const currentStepIndex = steps.findIndex(s => s.id === currentStatus);
  const isServed = currentStatus === "SERVED" || currentStatus === "COMPLETED";

  return (
    <div className="order-track-page dark-theme">
      <div className="track-container">
        <div className="track-top">
          <button className="back-btn-dark" onClick={() => navigate(-1)}><FaArrowLeft /></button>
          <div className="brand-label">
            <span className="gopron-font blue-text">BILLING 360</span>
          </div>
        </div>

        <div className="status-hero">
          <h1 className="gopron-font">Order #{orderDetails.order_number.slice(-4)}</h1>
          <p className="status-subtitle">{isServed ? "Enjoy your meal!" : "We're updating your status live..."}</p>
        </div>

        <div className="delivery-timeline-vertical">
          {steps.map((step, index) => {
            // Logic: 
            // - Done: if the current index in DB is further than this step
            // - Active: if the current index in DB matches this step
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            
            return (
              <div key={step.id} className={`v-step-item ${isCompleted ? 'done' : ''} ${isActive ? 'current' : ''}`}>
                <div className="v-step-left">
                  <div className="v-icon-box">{step.icon}</div>
                  {index < steps.length - 1 && <div className="v-step-line"></div>}
                </div>
                <div className="v-step-right">
                  <span className="v-step-label">{step.label}</span>
                  <span className="v-step-desc">
                    {isActive ? "Currently here" : isCompleted ? "Finished" : "Waiting..."}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="info-glass-card">
          <div className="info-item">
            <span className="info-label">TABLE</span>
            <span className="info-value gopron-font">{orderDetails.table_number || "TA"}</span>
          </div>
          <div className="info-divider"></div>
          <div className="info-item">
            <span className="info-label">TOTAL</span>
            <span className="info-value gopron-font green-text">₹{Number(orderDetails.total_price).toFixed(2)}</span>
          </div>
        </div>

        <div className="action-area">
          {isServed ? (
            <button className="bill-btn-glow gopron-font" onClick={() => navigate(`/checkout/${orderDetails.session_id}`)}>
              <FaFileInvoiceDollar /> GENERATE BILL
            </button>
          ) : (
            <button className="add-more-btn gopron-font" onClick={() => navigate("/usermenu")}>
              + ADD MORE ITEMS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackPage;
