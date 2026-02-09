import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import './App.css';
import Dashboard from "./components/Dashboard";
import { Toaster } from "react-hot-toast";
import FoodItems from "./components/FoodItems";


// Pages
import ScanQRPage from './pages/ScanQRPage';
import TableEntryPage from './pages/TableEntryPage';
import CustomerPage from './pages/CustomerPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPlacedPage from './pages/OrderPlacedPage';
import KitchenPanel from './pages/KitchenPanel';
import AdminLogin from './pages/AdminLogin';
import AdminMenu from './pages/AdminMenu';
import AppLayout from './layout/Applayout';

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
          <Route element={<AppLayout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/food-items" element={<FoodItems />} />
          <Route path="/menu" element={<MenuPage />} />
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
