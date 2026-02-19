import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import './styles/dashboard.css';
import './styles/global.css';

import Dashboard from "./components/Dashboard";
import FoodItems from "./components/FoodItems";
import AppLayout from './layout/Applayout';
import ProtectedRoute from "./auth/ProtectedRoute";

import Attendance from './components/Attendance.jsx';
import MenuItem from './components/MenuItem';

import ScanQRPage from './pages/ScanQRPage';
import TableEntryPage from './pages/TableEntryPage';
import CustomerPage from './pages/CustomerPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPlacedPage from './pages/OrderPlacedPage';
import OrderTrackPage from './pages/OrderTrackPage';

import KitchenPanel from './pages/KitchenPanel';
import AdminLogin from './pages/AdminLogin';
import AdminMenu from './pages/AdminMenu';
import KitchenLoginPage from './pages/KitchenLoginPage';
import KitchenSignup from './pages/KitchenSignup';
import AdminSignup from './pages/AdminSignupPage';
import Settings from './components/Settings.jsx';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="App">
        <Routes>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Customer Flow */}
          <Route path="/scan" element={<ScanQRPage />} />
          <Route path="/table-entry" element={<TableEntryPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/usermenu" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-placed" element={<OrderPlacedPage />} />
          <Route path="/track-order/:orderId" element={<OrderTrackPage />} />

          {/* Admin Login (NOT inside layout) */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected Layout */}
          <Route element={<AppLayout />}>

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={<Attendance />} />
            <Route path="/food-items" element={<FoodItems />} />
            <Route path="/api/menu" element={<MenuItem />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/admin/menu" element={
              <ProtectedRoute>
                <AdminMenu />
              </ProtectedRoute>
            } />

            <Route path="/admin/signup" element={<AdminSignup />} />

            <Route path="/kitchen" element={<KitchenPanel />} />
            <Route path="/KitchenLogin" element={<KitchenLoginPage />} />
            <Route path="/KitchenSignup" element={<KitchenSignup />} />

            <Route path="/pos" element={<div>POS Page</div>} />
            <Route path="/transaction" element={<div>Transaction Page</div>} />
            <Route path="/booking" element={<div>Booking Page</div>} />
            <Route path="/order-status" element={<div>Order Status Page</div>} />

          </Route>

          {/* Catch all unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
