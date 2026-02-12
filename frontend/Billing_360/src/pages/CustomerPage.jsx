import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/CustomerPage.css';

const CustomerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tableNumber, setTableNumber] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone_number: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  const tableFromUrl = searchParams.get('table');
  const restaurantId = searchParams.get('restaurant_id') || 'REST001';
  const isTableFromUrl = !!tableFromUrl;

  // Get table number from URL params if available
  useEffect(() => {
    const table = tableFromUrl;
    if (table) {
      setTableNumber(table);
    }
  }, [tableFromUrl]);

  const validateForm = () => {
    const newErrors = {};

    if (!tableNumber.trim()) {
      newErrors.tableNumber = 'Table number is required';
    }

    if (!customerData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!customerData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (customerData.phone_number.length < 10) {
      newErrors.phone_number = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTableChange = (e) => {
    const value = e.target.value;
    setTableNumber(value);
    
    if (errors.tableNumber) {
      setErrors(prev => ({ ...prev, tableNumber: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Store customer data in localStorage for checkout
    localStorage.setItem('customerData', JSON.stringify(customerData));
    localStorage.setItem('tableNumber', tableNumber);
    localStorage.setItem('restaurantId', restaurantId);
    
    // Navigate to menu page with table and restaurant info
    navigate(`/usermenu?restaurant_id=${restaurantId}&table=${tableNumber}`);
  };

  return (
    <div className="customer-container">
      <div className="customer-card">
        <header className="customer-header">
          <h1>Welcome</h1>
          <p>Please enter your details to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="customer-form">

          {/* Table Number */}
          <div className="form-group">
            <label style={{color:"white"}}>Table Number *</label>
            <input
              type="text"
              value={tableNumber}
              onChange={handleTableChange}
              placeholder="Enter table number"
              className={errors.tableNumber ? 'error' : ''}
              style={{color:'white'}}
              readOnly={isTableFromUrl}
              
            />
            {errors.tableNumber && (
              <span className="error-message">{errors.tableNumber}</span>
            )}
            {isTableFromUrl && (
              <small className="table-info">Table number from QR code</small>
            )}
          </div>

          {/* Name */}
          <div className="form-group">
            <label style={{color:"white"}}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={customerData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className={errors.name ? 'error' : ''}
              style={{color:'white'}}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label style={{color:"white"}}>Phone Number *</label>
            <input
              type="tel"
              name="phone_number"
              value={customerData.phone_number}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className={errors.phone_number ? 'error' : ''}
              style={{color:'white'}}
            />
            {errors.phone_number && (
              <span className="error-message">{errors.phone_number}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label >Email</label>
            <input
              type="email"
              name="email"
              value={customerData.email}
              onChange={handleInputChange}
              placeholder="Enter email (optional)"
              className={errors.email ? 'error' : ''}
              style={{color:'white'}}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <button type="submit" className="submit-btn">
            Continue to Menu
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerPage;
