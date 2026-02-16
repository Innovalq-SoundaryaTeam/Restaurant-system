import React, { useState, useEffect, useCallback } from 'react';
import { FaSync, FaClock, FaTrashAlt } from 'react-icons/fa';
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
    const interval = setInterval(() => fetchOrders(false), 5000); // 5s for faster sync
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/kitchen/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      if (response.ok) fetchOrders(false);
    } catch (err) {
      alert("Network error. Could not update status.");
    }
  };

  if (loading && orders.length === 0) {
    return <div className="kds-loader"><h2 className="gopron-font">INITIALIZING KDS...</h2></div>;
  }

  return (
    <div className="kds-container">
      <header className="kds-header">
        <div className="kds-title-section">
          <h1 className="gopron-font">Kitchen Terminal</h1>
          <div className="kds-stats">
            <span className="stat-pill blue-glow">{orders.length} ACTIVE TICKETS</span>
          </div>
        </div>
        <button onClick={() => fetchOrders(true)} className="kds-refresh-btn">
          <FaSync /> REFRESH
        </button>
      </header>

      <div className="kds-grid">
        {orders.map(order => (
          <div key={order.id} className={`kds-card ${order.status.toLowerCase()}`}>
            <div className="kds-card-header">
              <div className="order-meta">
                <span className="order-no gopron-font">ORD-{order.order_number.slice(-4)}</span>
                <span className="order-time"><FaClock /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="kds-delete-icon">
                <FaTrashAlt />
              </button>
            </div>

            <div className="kds-table-bar">
              <span className="gopron-font">TABLE {order.table_number || 'N/A'}</span>
              <span className="customer-name">{order.customer_name}</span>
            </div>

            <div className="kds-items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="kds-item-row">
                  <span className="kds-qty">x{item.quantity}</span>
                  <span className="kds-item-name">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="kds-actions">
              <ActionButton order={order} onUpdate={updateOrderStatus} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActionButton = ({ order, onUpdate }) => {
  const status = order.status?.toUpperCase();
  const btnMap = {
    'PENDING': { label: 'CONFIRM ORDER', class: 'btn-blue', next: 'KITCHEN' },
    'KITCHEN': { label: 'MARK AS READY', class: 'btn-orange', next: 'READY' },
    'READY': { label: 'MARK AS SERVED', class: 'btn-green', next: 'COMPLETED' },
    'COMPLETED': { label: 'ARCHIVE', class: 'btn-white', next: 'ARCHIVED' }
  };

  const current = btnMap[status];
  if (!current) return null;

  return (
    <button className={`kds-action-btn gopron-font ${current.class}`} onClick={() => onUpdate(order.id, current.next)}>
      {current.label}
    </button>
  );
};

export default KitchenPanel;