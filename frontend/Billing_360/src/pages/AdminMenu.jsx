import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminMenu.css';

const AdminMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Starters',
    image_url: '',
    is_available: true,
    spicy_level: 'none',
    dietary_info: 'non-veg',
    preparation_time: 15
  });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      setError('Name and price are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingItem 
        ? `http://localhost:8000/api/admin/menu/${editingItem.id}`
        : 'http://localhost:8000/api/admin/menu';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time)
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchMenuItems(); // Refresh list
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to save menu item');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || 'Starters',
      image_url: item.image_url || '',
      is_available: item.is_available,
      spicy_level: item.spicy_level || 'none',
      dietary_info: item.dietary_info || 'non-veg',
      preparation_time: item.preparation_time || 15
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/admin/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchMenuItems(); // Refresh list
      } else {
        setError('Failed to delete menu item');
      }
    } catch (err) {
      setError('Error deleting menu item: ' + err.message);
    }
  };

  const toggleAvailability = async (itemId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const item = menuItems.find(item => item.id === itemId);
      const newStatus = !item.is_available;
      
      const response = await fetch(`http://localhost:8000/api/admin/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: newStatus }),
      });

      if (response.ok) {
        await fetchMenuItems(); // Refresh list
      } else {
        setError('Failed to update availability');
      }
    } catch (err) {
      setError('Error updating availability: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Starters',
      image_url: '',
      is_available: true,
      spicy_level: 'none',
      dietary_info: 'non-veg',
      preparation_time: 15
    });
    setEditingItem(null);
    setShowAddForm(false);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <div className="admin-menu-container">
      <div className="admin-header">
        <h1>Menu Management</h1>
        <div className="header-actions">
          <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
            {showAddForm ? 'View Menu' : '+ Add Item'}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading menu items...</div>
      ) : showAddForm ? (
        <div className="add-form-container">
          <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <form onSubmit={handleSubmit} className="menu-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Item name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Burgers">Burgers</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Salads">Salads</option>
                  <option value="Sides">Sides</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Italian">Italian</option>
                </select>
              </div>
              <div className="form-group">
                <label>Dietary Info</label>
                <select name="dietary_info" value={formData.dietary_info} onChange={handleInputChange}>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Spicy Level</label>
                <select name="spicy_level" value={formData.spicy_level} onChange={handleInputChange}>
                  <option value="none">None</option>
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="hot">Hot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preparation Time (minutes)</label>
                <input
                  type="number"
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={handleInputChange}
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the item..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                />
                Available
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item-card">
              <div className="item-header">
                <h3>{item.name}</h3>
                <span className={`availability-badge ${item.is_available ? 'available' : 'unavailable'}`}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <div className="item-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <div className="placeholder-image">🍽️</div>
                )}
              </div>

              <div className="item-details">
                <p className="price">${parseFloat(item.price).toFixed(2)}</p>
                <p className="category">{item.category}</p>
                <p className="dietary">{item.dietary_info}</p>
                <p className="spicy">{item.spicy_level}</p>
                <p className="prep-time">⏱️ {item.preparation_time}min</p>
                <p className="description">{item.description}</p>
              </div>

              <div className="item-actions">
                <button onClick={() => handleEdit(item)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => toggleAvailability(item.id)} className="toggle-btn">
                  {item.is_available ? '🔴 Hide' : '🟢 Show'}
                </button>
                <button onClick={() => handleDelete(item.id)} className="delete-btn">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
