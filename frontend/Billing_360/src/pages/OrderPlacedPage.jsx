import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocket';
import '../styles/OrderPlacedPage.css';

const OrderPlacedPage = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get order details from localStorage or URL params
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      const orderData = JSON.parse(savedOrder);
      setOrderDetails(orderData);
      
      // Connect to WebSocket for real-time status updates
      websocketService.connect();
      
      // Listen for order status updates
      websocketService.on('orderStatusUpdate', ({ order_id, status }) => {
        if (orderData.orderId === order_id) {
          setOrderDetails(prev => ({
            ...prev,
            status: status
          }));
        }
      });
      
      // Cleanup on unmount
      return () => {
        websocketService.disconnect();
      };
    } else {
      // If no order details, redirect to menu
      navigate('/menu');
    }
  }, [navigate]);

  const handleDownloadBill = () => {
    if (orderDetails?.billUrl) {
      // Create a temporary link to download the bill
      const link = document.createElement('a');
      link.href = `http://localhost:8000${orderDetails.billUrl}`;
      link.download = orderDetails.billFilename || 'bill.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleTrackOrder = () => {
    // Navigate to kitchen panel with order ID
    if (orderDetails?.orderId) {
      navigate(`/kitchen?order_id=${orderDetails.orderId}`);
    }
  };

  const handleNewOrder = () => {
    // Clear cart and start new order
    localStorage.removeItem('cart');
    localStorage.removeItem('lastOrder');
    navigate('/menu');
  };

  const handleFinishMeal = () => {
    // Mark meal as finished and show thank you message
    if (orderDetails) {
      setOrderDetails(prev => ({
        ...prev,
        mealFinished: true
      }));
    }
  };

  if (!orderDetails) {
    return (
      <div className="order-placed-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="order-placed-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>
          {orderDetails.mealFinished ? 'Thank You for Your Meal!' : 'Order Placed Successfully!'}
        </h1>
        
        <div className="order-summary">
          <div className="summary-item">
            <span>Order Number:</span>
            <span className="order-number">{orderDetails.orderNumber}</span>
          </div>
          <div className="summary-item">
            <span>Table:</span>
            <span>{orderDetails.tableNumber}</span>
          </div>
          <div className="summary-item">
            <span>Total Amount:</span>
            <span className="total-amount">₹{orderDetails.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="summary-item">
            <span>Email:</span>
            <span>{orderDetails.customerEmail}</span>
          </div>
        </div>

        <div className="success-message">
          <p>📧 Your bill has been sent to your email address</p>
          <p>🍽️ Your order is being prepared in the kitchen</p>
          {orderDetails.mealFinished && <p>🎉 Enjoy your meal!</p>}
        </div>

        <div className="action-buttons">
          <button onClick={handleDownloadBill} className="download-btn">
            📄 Download Bill
          </button>
          <button onClick={handleTrackOrder} className="track-btn">
            📍 Track Order
          </button>
          <button onClick={handleNewOrder} className="new-order-btn">
            🍴️ New Order
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
