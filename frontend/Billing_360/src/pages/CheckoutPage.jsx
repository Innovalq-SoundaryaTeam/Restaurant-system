import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/CheckoutPage.css";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  const tableNumber = localStorage.getItem('tableNumber') || 'Not specified';
  const restaurantId = localStorage.getItem('restaurantId') || 'REST001';

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedCustomer = localStorage.getItem('customerData');
    
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      navigate('/usermenu');
      return;
    }
    
    setCart(JSON.parse(savedCart));
    setCustomerData(JSON.parse(savedCustomer || '{}'));
  }, [navigate]);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!customerData.name || !customerData.phone_number) {
      setError('Please provide customer name and phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        table_number: tableNumber,
        customer_name: customerData.name,
        phone_number: customerData.phone_number,
        email: customerData.email,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          special_instructions: ""
        })),
        payment_method: "upi"
      };

      const response = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to place order');
      }

      const result = await response.json();
      setOrderDetails(result);
      setOrderPlaced(true);
      
      // Save order details to localStorage for OrderPlacedPage
      const orderDataForStorage = {
        orderId: result.id,
        orderNumber: result.order_number,
        total: result.total_price,
        status: result.status
      };
      localStorage.setItem('lastOrder', JSON.stringify(orderDataForStorage));
      
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      
      // Redirect to kitchen panel after 2 seconds
      setTimeout(() => {
        navigate('/kitchen');
      }, 2000);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMenu = () => {
    navigate('/usermenu');
  };

  const handleTrackOrder = () => {
    if (orderDetails?.id) {
      navigate(`/order-placed?order_id=${orderDetails.id}`);
    }
  };

  if (orderPlaced && orderDetails) {
    return (
      <div className="checkout-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          
          <div className="order-summary">
            <div className="summary-item">
              <span>Order Number:</span>
              <span className="order-number">{orderDetails.order_number}</span>
            </div>
            <div className="summary-item">
              <span>Table:</span>
              <span>{tableNumber}</span>
            </div>
            <div className="summary-item">
              <span>Total Amount:</span>
              <span className="total-amount">${orderDetails.total_price?.toFixed(2) || getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Email:</span>
              <span>{customerData.email}</span>
            </div>
          </div>

          <div className="success-message">
            <p>📧 Your order confirmation has been sent</p>
            <p>🍽️ Your order is being prepared in the kitchen</p>
            <p>⏭️ Redirecting to kitchen panel in 2 seconds...</p>
          </div>

          <div className="action-buttons">
            <button onClick={handleTrackOrder} className="track-btn">
              📍 Track Order
            </button>
            <button onClick={handleBackToMenu} className="new-order-btn">
              🍴 New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <header className="checkout-header">
          <h1>Checkout</h1>
          <div className="header-info">
            <span>Table: {tableNumber}</span>
            <span>Customer: {customerData.name || 'Guest'}</span>
          </div>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="order-summary">
          <h2>Order Summary</h2>
          <div className="items-list">
            {cart.map(item => (
              <div key={item.id} className="checkout-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>${item.price.toFixed(2)} × {item.quantity}</p>
                </div>
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="price-summary">
            <div className="summary-row">
              <span>Items ({getTotalItems()}):</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="customer-details">
          <h2>Customer Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span>Name:</span>
              <span>{customerData.name || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span>Phone:</span>
              <span>{customerData.phone_number || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span>Email:</span>
              <span>{customerData.email || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span>Table:</span>
              <span>{tableNumber}</span>
            </div>
          </div>
        </section>

        <section className="payment-info">
          <h2>Payment Information</h2>
          <div className="payment-method">
            <span>Payment Method:</span>
            <span>UPI (Default)</span>
          </div>
          <p className="payment-note">
            Payment will be confirmed by restaurant staff. Your order confirmation will be available.
          </p>
        </section>

        <div className="checkout-actions">
          <button 
            onClick={handleBackToMenu}
            className="back-btn"
            disabled={loading}
          >
            ← Back to Menu
          </button>
          
          <button 
            onClick={handlePlaceOrder}
            className="place-order-btn"
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Placing Order...' : `Place Order - $${getTotalPrice().toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
