import React, { useState, useEffect, useCallback } from 'react';
import '../styles/KitchenPanel.css';

const KitchenPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://127.0.0.1:8000/api/kitchen/orders";
  const REST_ID = "REST001";

  const fetchOrders = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const response = await fetch(`${API_URL}?restaurant_id=${REST_ID}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      setError('Connection error. Retrying...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // FIX: Explicitly send Uppercase status to match MySQL ENUM
  const updateOrderStatus = async (orderId, newStatus) => {
    const uppercaseStatus = newStatus.toUpperCase();
    try {
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: uppercaseStatus }),
      });
      if (response.ok) {
        fetchOrders(false);
      } else {
        const errorData = await response.json();
        console.error("Server rejected status:", errorData);
        alert(`Failed to update to ${uppercaseStatus}. Check if status exists in DB.`);
      }
    } catch (err) {
      alert("Status update failed. Check network.");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#17a2b8';
      case 'CONFIRMED': return '#007bff';
      case 'PREPARING': return '#fd7e14';
      case 'ALMOST_DONE': return '#6f42c1';
      case 'READY': return '#28a745';
      case 'SERVED': return '#6c757d';
      default: return '#343a40';
    }
  };

  if (loading && orders.length === 0) {
    return <div className="loading">Initializing Kitchen Feed...</div>;
  }

  return (
    <div className="kitchen-container">
      <header className="kitchen-header">
        <div className="order-info">
          <h1>Kitchen Orders</h1>
          <p>{orders.length} Active Tickets</p>
        </div>
        <button onClick={() => fetchOrders(true)} className="refresh-btn">
          🔄 Manual Refresh
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.order_number}</h3>
                <p><strong>Table {order.table_number || 'Takeout'}</strong> • {order.customer_name}</p>
                <p>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="order-status">
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.items?.map((item, idx) => (
                <div key={idx} className="order-item">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="order-actions">
              <ActionButton order={order} onUpdate={updateOrderStatus} />
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className="no-orders">
          <h3>No Active Orders</h3>
          <p>Kitchen is currently clear.</p>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ order, onUpdate }) => {
  // Logic is cleaner using toUpperCase() to match DB exactly
  const status = order.status?.toUpperCase();

  switch (status) {
    case 'PENDING':
      return <button className="action-btn confirm-btn" onClick={() => onUpdate(order.id, 'CONFIRMED')}>CONFIRM ORDER</button>;
    case 'CONFIRMED':
      return <button className="action-btn prepare-btn" onClick={() => onUpdate(order.id, 'PREPARING')}>START PREPARING</button>;
    case 'PREPARING':
      return <button className="action-btn" style={{backgroundColor: '#6f42c1', color: 'white'}} onClick={() => onUpdate(order.id, 'ALMOST_DONE')}>⏲️ ALMOST DONE</button>;
    case 'ALMOST_DONE':
      return <button className="action-btn ready-btn" onClick={() => onUpdate(order.id, 'READY')}>MARK AS READY</button>;
    case 'READY':
      return <button className="action-btn serve-btn" onClick={() => onUpdate(order.id, 'SERVED')}>MARK SERVED</button>;
    default:
      return null;
  }
};

export default KitchenPanel;