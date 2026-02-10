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
  
  // New state for payment method selection
  const [paymentMethod, setPaymentMethod] = useState('upi'); 
  
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
        payment_method: paymentMethod // Dynamic selection sent to backend
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
      
      const orderDataForStorage = {
        orderId: result.id,
        orderNumber: result.order_number,
        total: result.total_price,
        status: result.status
      };
      localStorage.setItem('lastOrder', JSON.stringify(orderDataForStorage));
      localStorage.removeItem('cart');
      
     
      
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

  // Success UI
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
              <span>Payment Via:</span>
              <span className="method-badge">{paymentMethod.toUpperCase()}</span>
            </div>
            <div className="summary-item">
              <span>Total Amount:</span>
              <span className="total-amount">${orderDetails.total_price?.toFixed(2) || getTotalPrice().toFixed(2)}</span>
            </div>
          </div>

          <div className="success-message">
            <p>📧 Confirmation sent to {customerData.email}</p>
            <p>🍽️ Preparing your food in the kitchen...</p>
          </div>

          <div className="action-buttons">
            <button onClick={handleTrackOrder} className="track-btn">📍 Track Order</button>
            <button onClick={handleBackToMenu} className="new-order-btn">🍴 New Order</button>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form UI
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

        {error && <div className="error-message">{error}</div>}

        <section className="order-summary">
          <h2>Items Summary</h2>
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
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* --- Updated Payment Section --- */}
        <section className="payment-info">
          <h2>Payment Method</h2>
          <div className="payment-selector">
            {['upi', 'cash', 'card'].map((method) => (
              <label key={method} className={`method-card ${paymentMethod === method ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="radio-label">{method.toUpperCase()}</span>
              </label>
            ))}
          </div>
          <div className="payment-help-text">
            {paymentMethod === 'upi' && "💡 Scan the QR code at your table or counter."}
            {paymentMethod === 'cash' && "💡 Please pay at the counter before/after your meal."}
            {paymentMethod === 'card' && "💡 A staff member will bring the card terminal."}
          </div>
        </section>

        <div className="checkout-actions">
          <button onClick={handleBackToMenu} className="back-btn" disabled={loading}>
            ← Edit Order
          </button>
          
          <button 
            onClick={handlePlaceOrder}
            className="place-order-btn"
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Processing...' : `Confirm & Order - $${getTotalPrice().toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;