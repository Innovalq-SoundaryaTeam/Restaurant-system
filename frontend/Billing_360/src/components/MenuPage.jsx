import React, { useState, useEffect } from "react";


export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA FROM FASTAPI --- 
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/menu");
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
  // const addToCart = (product) => {
  //   setCartItems((prevItems) => {
  //     const existingItem = prevItems.find((item) => item.id === product.id);
  //     if (existingItem) {
  //       return prevItems.map((item) =>
  //         item.id === product.id
  //           ? { ...item, quantity: item.quantity + 1 }
  //           : item
  //       );
  //     } else {
  //       return [...prevItems, { ...product, quantity: 1 }];
  //     }
  //   });
  // };

  // const removeFromCart = (productId) => {
  //   setCartItems((prevItems) => {
  //     const existingItem = prevItems.find((item) => item.id === productId);
  //     if (existingItem.quantity === 1) {
  //       return prevItems.filter((item) => item.id !== productId);
  //     } else {
  //       return prevItems.map((item) =>
  //         item.id === productId
  //           ? { ...item, quantity: item.quantity - 1 }
  //           : item
  //       );
  //     }
  //   });
  // };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // const placeOrder = () => {
  //   alert(`Order placed! Total: $${totalPrice.toFixed(2)}`);
  //   setCartItems([]);
  // };

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
          <p>Premium selection, served fast.</p>
        </header>

        {/* {cartItems.length > 0 && (
          <div className="cart-summary">
            <div className="cart-header-mini">
              <span>Your Orders</span>
              <span className="total-highlight">${totalPrice.toFixed(2)}</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-row">
                  <div className="cart-row-left">
                    <button 
                      className="remove-btn" 
                      onClick={() => removeFromCart(item.id)}
                    >
                      -
                    </button>
                    <span className="cart-qty">{item.quantity}x</span>
                    <span className="cart-item-name">{item.name}</span>
                  </div>
                  <span className="cart-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>

      
      <div className="scrollable-menu-area">
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-card">
              <div className="card-image-container">
                <img
                  src={item.image}
                  alt={item.name}
                  className="card-image"
                />
                <span className="card-category">{item.category || "Special"}</span>
              </div>

              <div className="card-content">
                <h2 className="card-title">{item.name}</h2>
                <p className="card-description">
                  {item.description || "A delicious choice from our kitchen."}
                </p>

                <div className="card-footer">
                  <span className="card-price">${item.price}</span>
                  {/* <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item)}
                  >
                    ADD +
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      {/* {cartItems.length > 0 && (
        <button className="place-order-btn" onClick={placeOrder}>
          Checkout • ${totalPrice.toFixed(2)}
        </button>
      )} */}
    </div>
  );
}