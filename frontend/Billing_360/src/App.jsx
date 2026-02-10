import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// Styles
import './styles/global.css';
import './App.css';

// Components & Pages
import Dashboard from "./components/Dashboard";
import FoodItems from "./components/FoodItems";
import AppLayout from './layout/Applayout';


// Pages
import MenuPage from './pages/MenuPage';
import AdminMenu from './pages/AdminMenu';

function App() {
  return (
    <Router>
      <Toaster position="bottom-center" />
      <div className="App">
        <Routes>
          {/* Customer Flow */}
          <Route path="/usermenu" element={<MenuPage />} />
          
          {/* Protected Admin Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/food-items" element={<FoodItems />} />
            
            {/* Full Menu Management Page */}
            <Route path="/menu" element={<AdminMenu />} /> 
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;