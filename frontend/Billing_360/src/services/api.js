// API Service Layer for Restaurant QR Ordering System
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Menu APIs
export const menuAPI = {
  getMenu: () => api.get('/menu'),
  addMenuItem: (itemData) => api.post('/admin/menu', null, { params: itemData }),
  updateMenuItem: (id, itemData) => api.put(`/admin/menu/${id}`, null, { params: itemData }),
  deleteMenuItem: (id) => api.delete(`/admin/menu/${id}`),
};

// Order APIs
export const orderAPI = {
  placeOrder: (orderData) => api.post('/orders', orderData),
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}`),
  getOrderStatus: (orderId) => api.get(`/orders/${orderId}/status`),
  updateOrderStatus: (orderId, status) => api.put(`/kitchen/orders/${orderId}`, null, { params: { status } }),
  getKitchenOrders: () => api.get('/kitchen/orders'),
};

// Billing APIs
export const billingAPI = {
  sendBillEmail: (orderId) => api.post(`/billing/send-email/${orderId}`),
  downloadBill: (orderId) => api.get(`/billing/download/${orderId}`),
};

// Admin APIs
export const adminAPI = {
  login: (email, password) => api.post('/admin/login', null, {
    params: { 
      email: email,
      password: password 
    }
  }),
};

// Customer APIs
export const customerAPI = {
  validateQR: (qrData) => api.post('/qr/validate', { qr_data: qrData }),
};

export default api;
