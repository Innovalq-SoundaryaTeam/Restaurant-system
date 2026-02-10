import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminMenu.css';

const AdminMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        headers: { 'Authorization': `Bearer ${token}` },
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

  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400/121212/00c853?text=No+Image';
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
          <button onClick={fetchMenuItems} className="refresh-btn">🔄 Refresh List</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Syncing with Kitchen...</p>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item-card view-only">
              <div className="item-image">
                <img 
                  src={getImageUrl(item.image_url)} 
                  alt={item.name} 
                  onError={(e) => { e.target.src = 'https://placehold.co/400x400/121212/00c853?text=No+Image'; }} 
                />
                <span className={`availability-badge ${item.is_available ? 'available' : 'unavailable'}`}>
                  {item.is_available ? '● Live' : '○ Hidden'}
                </span>
              </div>

              <div className="item-details">
                <div className="price-row">
                  <h3>{item.name}</h3>
                  <p className="price">₹{parseFloat(item.price).toFixed(2)}</p>
                </div>
                
                <p className="category-tag">{item.category}</p>
                <p className="description">{item.description || 'No description provided.'}</p>
                
                <div className="meta-info">
                  <span title="Dietary Info">🥗 {item.dietary_info || 'Veg'}</span>
                  <span title="Prep Time">⏱️ {item.preparation_time || '15'}m</span>
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