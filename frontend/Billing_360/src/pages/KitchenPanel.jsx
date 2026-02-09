import React, { useState, useEffect } from 'react';
import '../styles/KitchenPanel.css';

const KitchenPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
    // Poll every 10 seconds for new orders
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/kitchen/orders?restaurant_id=REST001");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/kitchen/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'preparing': return '#9c27b0';
      case 'ready': return '#4caf50';
      case 'served': return '#607d8b';
      default: return '#666';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'served': return 'Served';
      default: return status;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="kitchen-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="kitchen-container">
      <div className="kitchen-header">
        <h1>Kitchen Orders</h1>
        <button onClick={fetchOrders} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.order_number}</h3>
                <p>Table: {order.table_number || 'N/A'}</p>
                <p>Customer: {order.customer_name}</p>
                <p>Time: {formatTime(order.created_at)}</p>
              </div>
              <div className="order-status">
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusDisplay(order.status)}
                </span>
              </div>
            </div>

            <div className="order-items">
              <h4>Items:</h4>
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <strong>Total: {formatCurrency(order.total_price)}</strong>
            </div>

            <div className="order-actions">
              {order.status?.toLowerCase() === 'pending' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                  className="action-btn confirm-btn"
                >
                  ✓ Confirm Order
                </button>
              )}
              
              {order.status?.toLowerCase() === 'confirmed' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="action-btn prepare-btn"
                >
                  👨‍🍳 Start Preparing
                </button>
              )}
              
              {order.status?.toLowerCase() === 'preparing' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="action-btn ready-btn"
                >
                  ✓ Mark Ready
                </button>
              )}
              
              {order.status?.toLowerCase() === 'ready' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'served')}
                  className="action-btn serve-btn"
                >
                  ✓ Mark Served
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className="no-orders">
          <h3>No active orders</h3>
          <p>All orders have been completed</p>
        </div>
      )}
    </div>
  );
};

export default KitchenPanel;
