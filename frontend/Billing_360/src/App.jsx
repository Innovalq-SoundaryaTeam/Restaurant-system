import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/global.css';
import './App.css';

// Layout & Admin/Staff Components
import AppLayout from './layout/Applayout';
import Dashboard from "./components/Dashboard";
import FoodItems from "./components/FoodItems";
import Attendance from './components/Attendance';
import MyMenuItem from './components/MenuItem'; 

// Customer Pages
import ScanQRPage from './pages/ScanQRPage';
import TableEntryPage from './pages/TableEntryPage';
import CustomerPage from './pages/CustomerPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPlacedPage from './pages/OrderPlacedPage';
import OrderTrackPage from './pages/OrderTrackPage';
import BillPage from './pages/BillPage';
import OrdersPage from './pages/OrdersPage';

// Admin & Kitchen Pages
import KitchenPanel from './pages/KitchenPanel';
import AdminLogin from './pages/AdminLogin';
import AdminMenu from './pages/AdminMenu';
import KitchenLoginPage from './pages/KitchenLoginPage';
import KitchenSignup from './pages/KitchenSignup';  
import AdminSignup from './pages/AdminSignupPage';
import StaffManagement from "./components/staffManagement";


function App() {
  return (
    <Router> {/* Fixed: Using Router as defined in imports */}
      <Toaster position="bottom-center" />
      <div className="App">
        <Routes>
          {/* Default redirect to scan */}
          <Route path="/" element={<Navigate to="/scan" replace />} />
          
          {/* Customer Flow */}
          <Route path="/scan" element={<ScanQRPage />} />
          <Route path="/table-entry" element={<TableEntryPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/usermenu" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-placed" element={<OrderPlacedPage />} />
          <Route path="/track-order/:orderId" element={<OrderTrackPage />} />
          <Route path="/checkout/:sessionId" element={<BillPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          
          {/* Kitchen Route */}
          <Route path="/kitchen" element={<KitchenPanel />} />
          <Route path='/KitchenLogin' element={<KitchenLoginPage />} />
          <Route path='/KitchenSignup' element={<KitchenSignup />} />
          
          {/* Protected Admin Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/food-items" element={<FoodItems />} />
            <Route path="/menu" element={<AdminMenu />} />
            <Route path="/pos" element={<div>POS Page</div>} />
            <Route path="/transaction" element={<div>Transaction Page</div>} />
            <Route path="/booking" element={<div>Booking Page</div>} />
            <Route path="/order-status" element={<div>Order Status Page</div>} />

            {/* Soundarya's Routes */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/bill/:orderId" element={<BillPage />} />
            <Route path="/staff" element={<StaffManagement />} />

          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;