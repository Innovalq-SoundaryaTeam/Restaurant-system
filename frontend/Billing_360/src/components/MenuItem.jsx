import React from 'react';
import './MenuItem.css';

const MenuItem = ({ item, onAddToCart, cartQuantity, onRemoveFromCart }) => {
  const handleAddToCart = () => {
    onAddToCart(item);
  };

  const handleRemoveFromCart = () => {
    onRemoveFromCart(item.id);
  };

  return (
    <div className="menu-item">
      <div className="item-image">
        <img 
          src={item.image_url || '/placeholder-food.jpg'} 
          alt={item.name}
          onError={(e) => {
            e.target.src = '/placeholder-food.jpg';
          }}
        />
        {!item.is_available && (
          <div className="unavailable-overlay">
            <span>Unavailable</span>
          </div>
        )}
      </div>
      
      <div className="item-details">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
        <div className="item-footer">
          <span className="item-price">₹{item.price.toFixed(2)}</span>
          
          {item.is_available ? (
            <div className="cart-controls">
              {cartQuantity > 0 ? (
                <div className="quantity-controls">
                  <button 
                    onClick={handleRemoveFromCart}
                    className="quantity-btn minus"
                  >
                    -
                  </button>
                  <span className="quantity">{cartQuantity}</span>
                  <button 
                    onClick={handleAddToCart}
                    className="quantity-btn plus"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                >
                  Add to Cart
                </button>
              )}
            </div>
          ) : (
            <button className="add-to-cart-btn disabled" disabled>
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
