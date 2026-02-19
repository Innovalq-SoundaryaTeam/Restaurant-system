import React from 'react';
import './MenuItem.css';

const MenuItem = ({ item }) => {

  // 🔥 HARD SAFETY — prevents ALL undefined errors
  if (!item) return null;

  const getImageUrl = (path) => {
    if (!path) {
      return 'https://placehold.co/400x400/7a63f1/white?text=Tasty+Food';
    }

    if (path.startsWith('http')) return path;

    const cleanPath = path.replace(/^\//, '');
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  return (
    <div className="menu-card">

      <div className="card-image-container">
        <img
          src={getImageUrl(item.image)}
          alt={item.name || "food"}
          className="card-image"
          onError={(e)=>{
            e.target.src="https://placehold.co/400x400/1a1a1a/white?text=No+Image"
          }}
        />

        <span className="card-category">
          {item.category || "Special"}
        </span>
      </div>

      <div className="card-content">

        <h2 className="card-title">
          {item.name || "Untitled"}
        </h2>

        <p className="card-description">
          {item.description || "A delicious choice from our kitchen."}
        </p>

        <div className="card-footer">
          <span className="card-price">
            ₹{Number(item.price ?? 0).toFixed(2)}
          </span>
        </div>

      </div>
    </div>
  );
};

export default MenuItem;
