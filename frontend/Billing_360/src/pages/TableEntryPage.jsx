import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomerPage.css';

const TableEntryPage = () => {
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!tableNumber.trim()) {
      newErrors.tableNumber = 'Table number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    // Store table number in localStorage (standardized storage)
    localStorage.setItem('tableNumber', tableNumber);
    localStorage.setItem('restaurantId', 'REST001');
    
    // Navigate to customer info page (standardized flow)
    navigate(`/customer?restaurant_id=REST001&table=${tableNumber}`);
  };

  const commonTables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];

  return (
    <div className="customer-container">
      <div className="customer-card">
        <header className="customer-header">
          <h1>🍽️ Enter Table Number</h1>
          <p>Please enter your table number to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="customer-form">
          {/* Quick Table Selection */}
          <div className="form-group">
            <label>Quick Select:</label>
            <div className="table-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {commonTables.map(table => (
                <button
                  key={table}
                  type="button"
                  onClick={() => setTableNumber(table)}
                  className={`quick-table-btn ${tableNumber === table ? 'selected' : ''}`}
                  style={{
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: tableNumber === table ? '#007bff' : '#f8f9fa',
                    color: tableNumber === table ? 'white' : 'black',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Table Entry */}
          <div className="form-group">
            <label>Or Enter Table Number Manually *</label>
            <input
              type="text"
              value={tableNumber}
              onChange={handleTableChange}
              placeholder="e.g., T1, T2, A1, B2..."
              className={errors.tableNumber ? 'error' : ''}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${errors.tableNumber ? '#dc3545' : '#ddd'}`,
                borderRadius: '8px',
                fontSize: '16px',
                color: 'white'
              }}
            />
            {errors.tableNumber && (
              <span className="error-message" style={{ color: '#dc3545', fontSize: '14px' }}>
                {errors.tableNumber}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Continue to Menu →
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/scan')}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            ← Back to QR Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableEntryPage;
