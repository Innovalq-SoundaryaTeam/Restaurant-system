import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/MenuPage.css";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant_id") || "REST001";
  const tableFromUrl = searchParams.get("table");

  // Get session info from navigation state or localStorage
  const [sessionId, setSessionId] = useState(null);
  
  useEffect(() => {
    // Clear old session data when entering new table
    if (tableFromUrl) {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('lastOrder');
    }
    
    // Check if we have session info from navigation state (from New Order button)
    if (location.state?.sessionId) {
      setSessionId(location.state.sessionId);
      localStorage.setItem('sessionId', location.state.sessionId);
    } else {
      // Try to get from localStorage
      const savedSessionId = localStorage.getItem('sessionId');
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
    }
    
    if (tableFromUrl && !localStorage.getItem('tableNumber')) {
      localStorage.setItem('tableNumber', tableFromUrl);
    }
    if (!localStorage.getItem('restaurantId')) {
      localStorage.setItem('restaurantId', restaurantId);
    }
  }, [tableFromUrl, restaurantId, location.state]);

  const tableNumber = localStorage.getItem('tableNumber') || 'T4';

  const fetchMenu = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/menu");
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Robust Image Resolver
  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/400x400/7a63f1/white?text=Tasty+Food"; 
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  // Cart Logic
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing?.quantity === 1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const getItemQuantity = (itemId) => cartItems.find(i => i.id === itemId)?.quantity || 0;
  const getTotalItems = () => cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const getTotalPrice = () => cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const handleProceed = () => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  if (loading) return <div className="loading-container"><span>Loading Menu...</span></div>;

  return (
    <div className="menu-page-wrapper">
      <header className="hero-banner">
        <div className="hero-inner">
          <h1>Menu Items</h1>
          <div className="table-pill">
            <span className="pill-bold">TABLE {tableNumber}</span>
            <span className="pill-sep">|</span>
            <span>Premium selection, served fast.</span>
          </div>
        </div>
      </header>

      <main className="content-container">
        <div className="item-grid">
          {menuItems.map((item) => {
            const qty = getItemQuantity(item.id);
            return (
              <div key={item.id} className="menu-item-card">
                <div className="image-box">
                  <img 
                    src={getImageUrl(item.image_url)} 
                    alt={item.name} 
                    onError={(e) => { e.target.src = "https://placehold.co/400x400/7a63f1/white?text=Image+Not+Found"; }}
                  />
                </div>
                <div className="item-info">
                  <h2 className="item-title">{item.name}</h2>
                  <p className="item-description">{item.description || "Freshly made for you."}</p>
                  <div className="item-footer">
                    <span className="price-tag">₹{item.price}</span>
                    <div className={`control-stepper ${qty > 0 ? "active" : ""}`}>
                      {qty > 0 ? (
                        <>
                          <button onClick={() => removeFromCart(item.id)}>–</button>
                          <span className="qty-count">{qty}</span>
                          <button onClick={() => addToCart(item)}>+</button>
                        </>
                      ) : (
                        <button className="add-btn-flat" onClick={() => addToCart(item)}>ADD</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {cartItems.length > 0 && (
        <div className="sticky-cart-bar">
          <div className="bar-inner">
            <div className="bar-stats">
              <span className="stats-qty">{getTotalItems()} ITEMS</span>
              <span className="stats-total">₹{getTotalPrice().toFixed(2)}</span>
            </div>
            <button onClick={handleProceed} className="checkout-btn-purple">
              View Cart <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}