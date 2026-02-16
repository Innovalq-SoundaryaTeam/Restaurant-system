import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import "../styles/OrdersPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/api/orders')
      setOrders(response.data || [])
      setError('')
    } catch (err) {
      setError('Failed to fetch orders.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateBill = async (orderId) => {
    try {
      setError('')
      setSuccessMessage('')

      const response = await axios.post(
        `http://localhost:8000/api/generate-bill/${orderId}`
      )

      if (response.data.status === 'success') {
        setSuccessMessage(`Bill sent for Order #${orderId}`)
        fetchOrders()
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate bill')
    }
  }

  const safeNumber = (value) => {
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  const getStatusColor = (status) => {
    const s = status?.toLowerCase()

    switch (s) {
      case 'completed':
        return '#28a745'
      case 'pending':
        return '#ffc107'
      case 'cancelled':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  if (loading) {
    return <div className="orders-page">Loading...</div>
  }

  return (
    <div className="orders-page">
      <h2>📋 Orders Management</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card" style={{ color: "black" }}>
            <div className="order-header">
              <h3>Order #{order.id}</h3>
              <span
                className="status-badge"
                style={{
                  backgroundColor: getStatusColor(order.status),
                  padding: '4px 8px',
                  borderRadius: '6px',
                  color: 'black',
                  fontSize: '12px'
                }}
              >
                {order.status}
              </span>
            </div>

            <p>👤 {order.customer_name}</p>
            <p>📱 {order.customer_phone}</p>
            <p>
              📅 {order.order_date} {order.order_time}
            </p>

            <ul>
              {(order.items || []).map((item, index) => (
                <li key={index}>
                  {item.item_name} x{item.quantity} - $
                  {safeNumber(item.price).toFixed(2)}
                </li>
              ))}
            </ul>

            <strong>
              Total: $
              {safeNumber(order.total_price).toFixed(2)}
            </strong>

            <div style={{ marginTop: '10px' }}>
              {/* <Link to={`/bill/${order.id}`}>View Bill</Link> */}

              {order.status?.toLowerCase() === 'pending' && (
                <button
                  onClick={() => generateBill(order.id)}
                  style={{
                    marginLeft: '10px',
                    padding: '6px 12px',
                    cursor: 'pointer'
                  }}
                >
                  📱 Generate Bill
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default OrdersPage
