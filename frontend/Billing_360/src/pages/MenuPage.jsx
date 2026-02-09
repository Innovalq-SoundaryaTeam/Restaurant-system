import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant_id") || "REST001";
  const tableFromUrl = searchParams.get("table");

  // =========================
  // STANDARDIZE TABLE NUMBER HANDLING
  // =========================
  useEffect(() => {
    // Store table number from URL to localStorage (single source of truth)
    if (tableFromUrl && !localStorage.getItem('tableNumber')) {
      localStorage.setItem('tableNumber', tableFromUrl);
    }
    
    // Ensure restaurantId is also stored
    if (!localStorage.getItem('restaurantId')) {
      localStorage.setItem('restaurantId', restaurantId);
    }
  }, [tableFromUrl, restaurantId]);

  // Get table number from localStorage (primary source)
  const tableNumber = localStorage.getItem('tableNumber') || 'Not specified';

  // --- 1. FETCH DATA FROM FASTAPI --- 
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/menu");
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        } else {
          console.error("Failed to fetch menu");
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // --- 2. CART HANDLERS ---
  const addToCart = (item) => {
    setCartItems(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Please add items to your cart before proceeding.');
      return;
    }
    
    // Store cart in localStorage for checkout page
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/400x300/1a1a1a/white?text=Tasty+Food"; 
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000/${imagePath}`;
  };

  if (loading) return <div style={{ color: "white", padding: 20 }}>Loading...</div>;

  return (
    <div className="menu-container">
      <div className="static-header-wrapper">
        <header className="menu-header">
          <h1>Menu Items</h1>
          <p>Table: {tableNumber} | Premium selection, served fast.</p>
        </header>
      </div>

      <div className="scrollable-menu-area">
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-card">
              <div className="card-image-container">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="card-image"
                />
                <span className="card-category">
                  {item.category || "Special"}
                </span>
              </div>

              <div className="card-content">
                <h2 className="card-title">{item.name}</h2>
                <p className="card-description">
                  {item.description ||
                    "A delicious choice from our kitchen."}
                </p>

                <div className="card-footer">
                  <span className="card-price">₹{item.price}</span>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="quantity-btn"
                      disabled={getItemQuantity(item.id) === 0}
                    >
                      -
                    </button>
                    <span className="quantity-display">
                      {getItemQuantity(item.id)}
                    </span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Summary */}
      {cartItems.length > 0 && (
        <div className="floating-cart">
          <div className="cart-summary">
            <span>🛒 Cart ({getTotalItems()} items) - ₹{getTotalPrice().toFixed(2)}</span>
            <button 
              onClick={handleProceedToCheckout}
              className="checkout-btn"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
