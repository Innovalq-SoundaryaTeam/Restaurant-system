import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// Styles
import './styles/global.css';
import './App.css';

// Components & Pages
import Dashboard from "./components/Dashboard";
import FoodItems from "./components/FoodItems";
import AppLayout from './layout/Applayout';

// 1. Resolve Import Conflict: Use a clear name for your custom component
import MyMenuItem from './components/MenuItem'; 

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

// 2. Namespace MUI import to prevent overwriting your component


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
          
          {/* Protected Admin Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/food-items" element={<FoodItems />} />
            
            {/* 3. Render the correct component for the /menu path */}
            <Route path="/menu" element={<MyMenuItem />} />
            
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