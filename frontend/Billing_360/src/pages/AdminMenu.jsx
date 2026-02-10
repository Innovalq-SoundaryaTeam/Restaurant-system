import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminMenu.css';

const AdminMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchMenuItems();
  }, [navigate]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data || []);
        setError('');
      } else {
        throw new Error('Failed to fetch menu items');
      }
    } catch (err) {
      setError('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // Robust Image Resolver
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400/7a63f1/white?text=Tasty+Food';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, ''); 
    return `http://localhost:8000/${cleanPath}`;
  };

  return (
    <div className="admin-menu-container">
      <div className="admin-header">
        <div className="header-title-group">
          <h1>Menu Overview</h1>
          <p className="subtitle">{menuItems.length} items currently in catalog</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchMenuItems} className="refresh-btn">🔄 Refresh</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading live menu data...</div>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item-card view-only">
              <div className="item-header">
                <h3>{item.name}</h3>
                <span className={`availability-badge ${item.is_available ? 'available' : 'unavailable'}`}>
                  {item.is_available ? 'Live' : 'Hidden'}
                </span>
              </div>
              
              <div className="item-image">
                <img 
                  src={getImageUrl(item.image_url)} 
                  alt={item.name} 
                  onError={(e) => { e.target.src = 'https://placehold.co/400x400/7a63f1/white?text=No+Image'; }} 
                />
              </div>

              <div className="item-details">
                <div className="price-row">
                  <p className="price">₹{parseFloat(item.price).toFixed(2)}</p>
                  <p className="category-tag">{item.category}</p>
                </div>
                
                <p className="description">{item.description || 'No description provided.'}</p>
                
                <div className="meta-info">
                  <span title="Dietary Info">🥗 {item.dietary_info}</span>
                  <span title="Spicy Level">🌶️ {item.spicy_level}</span>
                  <span title="Prep Time">⏱️ {item.preparation_time}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {menuItems.length === 0 && !loading && (
        <div className="no-items">
          <p>The menu is currently empty.</p>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;