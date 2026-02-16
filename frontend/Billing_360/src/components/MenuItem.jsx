import React from 'react';
import './MenuItem.css';

const MenuItem = ({ item }) => {
  // 1. Image Resolver: Handles backend paths or placeholders
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400/7a63f1/white?text=Tasty+Food';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, ''); 
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  // 2. Safeguard: Return null if item data is missing
  if (!item) return null;

  return (
    <div className={`menu-item-card ${!item.is_available ? 'unavailable' : ''}`}>
      <div className="item-image-box">
        <img 
          src={getImageUrl(item.image_url)} 
          alt={item.name}
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x400/7a63f1/white?text=No+Image';
          }}
        />
        {!item.is_available && (
          <div className="unavailable-overlay">
            <span>Sold Out</span>
          </div>
        )}
      </div>
      
      <div className="item-details-box">
        <h3 className="item-name">{item.name || 'Untitled Item'}</h3>
        <p className="item-description">{item.description || 'No description available.'}</p>
        
        <div className="item-footer-row">
          {/* Formats price to 2 decimal places */}
          <span className="item-price">₹{parseFloat(item.price || 0).toFixed(2)}</span>
          
          <div className="item-status-area">
            {item.is_available === false && (
              <span className="out-of-stock">Currently Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;