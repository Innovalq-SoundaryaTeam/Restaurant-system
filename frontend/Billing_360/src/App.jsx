import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// Icons & Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fontsource/cinzel/700.css'; 
import '@fontsource/poppins/400.css'; 
import '@fontsource/poppins/600.css';
import './styles/dashboard.css';
import './styles/global.css'; 

// Components & Pages
import Dashboard from "./components/Dashboard";
import FoodItems from "./components/FoodItems";
import AppLayout from './layout/Applayout';
import Attendance from './components/Attendance.jsx';

// Customer Pages
import ScanQRPage from './pages/ScanQRPage';
import TableEntryPage from './pages/TableEntryPage';
import CustomerPage from './pages/CustomerPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPlacedPage from './pages/OrderPlacedPage';

// Admin/Staff Pages
import KitchenPanel from './pages/KitchenPanel';
import AdminLogin from './pages/AdminLogin';
import AdminMenu from './pages/AdminMenu';

function App() {
  return (
    <Router>
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          
          {/* Kitchen Route */}
          <Route path="/kitchen" element={<KitchenPanel />} />
          
          {/* Protected Admin Dashboard Layout - WITH SIDEBAR */}
          <Route element={<AppLayout />}>
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/food-items" element={<FoodItems />} />
            <Route path="/menu" element={<AdminMenu />} />
            <Route path="/pos" element={<div>POS Page</div>} />
            <Route path="/transaction" element={<div>Transaction Page</div>} />
            <Route path="/booking" element={<div>Booking Page</div>} />
            <Route path="/order-status" element={<div>Order Status Page</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;