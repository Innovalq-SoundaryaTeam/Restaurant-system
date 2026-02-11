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
      console.error('Error fetching orders:', err);
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
        alert(`Failed to update status.`);
      }
    } catch (err) {
      console.error("An error occurred while updating the order status:", err);
      alert("Network error. Could not update status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#f39c12'; // Orange
      case 'CONFIRMED': return '#3498db'; // Blue
      case 'PREPARING': return '#9b59b6'; // Purple
      case 'ALMOST_DONE': return '#e67e22'; // Dark Orange
      case 'READY': return '#2ecc71'; // Green
      default: return '#7f8c8d'; // Grey
    }
  };

  if (loading && orders.length === 0) {
    return <div className="loading-screen">Loading Kitchen Feed...</div>;
  }

  return (
    <div className="kitchen-container">
      <header className="kitchen-header">
        <div>
          <h1>Kitchen Display System (KDS)</h1>
          <p className="subtitle">{orders.length} Active Tickets</p>
        </div>
        <button onClick={() => fetchOrders(true)} className="refresh-btn">
          ↻ Refresh
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="header-left">
                <span className="order-id">Order status{order.order_number}</span>
                <span className="order-time">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(order.status),color: 'white' }}
              >
                {order.status}
              </span>
            </div>

            <div className="table-info">
              <strong>Table {order.table_number || 'Takeout'}</strong> • {order.customer_name}
            </div>

            <div className="order-items">
              {order.items?.map((item, idx) => (
                <div key={idx} className="order-item">
                  <span className="qty-badge">{item.quantity}</span>
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
        <div className="empty-state">
          <h3>All Caught Up!</h3>
          <p>No active orders in the kitchen.</p>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ order, onUpdate }) => {
  const status = order.status?.toUpperCase();

  switch (status) {
    case 'PENDING':
      return <button className="action-btn btn-confirm" onClick={() => onUpdate(order.id, 'CONFIRMED')}>Confirm</button>;
    case 'CONFIRMED':
      return <button className="action-btn btn-prepare" onClick={() => onUpdate(order.id, 'PREPARING')}>Start Cooking</button>;
    case 'PREPARING':
      return <button className="action-btn btn-almost" onClick={() => onUpdate(order.id, 'ALMOST_DONE')}>Almost Done</button>;
    case 'ALMOST_DONE':
      return <button className="action-btn btn-ready" onClick={() => onUpdate(order.id, 'READY')}>Mark Ready</button>;
    case 'READY':
      return <button className="action-btn btn-serve" onClick={() => onUpdate(order.id, 'SERVED')}>Served</button>;
    default:
      return null;
  }
};

export default KitchenPanel;