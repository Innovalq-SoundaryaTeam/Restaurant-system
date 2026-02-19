import { useState } from "react";
import { NavLink } from "react-router-dom";
// Corrected: split the imports for Font Awesome and Bootstrap Icons
import { FaHome, FaChevronDown, FaBox, FaUsers, FaCalendarAlt, FaCog, FaUtensils } from "react-icons/fa";
import { BsFillMenuButtonWideFill } from "react-icons/bs"; 
import "../styles/sidebar.css"; 
import Applogo from "../assets/logo360.jpeg";

export default function Sidebar({ collapsed, mobileOpen, closeMobile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {/* LOGO */}
      <div className="logo">
        <div className="logo-icon">
          <img src={Applogo} alt="Logo" style={{ width: "35px", height: "35px", borderRadius: "5px" }} />
        </div>
        {!collapsed && <span className="logo-text">Billing 360</span>}
      </div>

      <nav className="nav-list">
        {/* DASHBOARD */}
        <NavLink to="/Dashboard" end onClick={closeMobile} className="nav-item">
          <FaHome className="nav-icon" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* MENU with Submenu Logic */}
        <div className={`menu-block ${menuOpen ? "open" : ""}`}>
          <div className="submenu-title nav-item" onClick={() => setMenuOpen(!menuOpen)}>
            {/* Now correctly imported from 'react-icons/bs' */}
            <BsFillMenuButtonWideFill className="nav-icon" />
            {!collapsed && <span>Menu Management</span>}
            {!collapsed && <FaChevronDown className={`arrow ${menuOpen ? "open" : ""}`} />}
          </div>

          {menuOpen && (
            <div className={`submenu ${collapsed ? "floating" : ""}`}>
              <NavLink to="/food-items" onClick={closeMobile}>Food Items</NavLink>
              <NavLink to="/api/menu" onClick={() => { closeMobile()}}>Menu List</NavLink>
            </div>
          )}
        </div>

        {/* OTHER ITEMS */}
        {/* OTHER ITEMS (To match your screenshot) */}
        <NavLink to="/orders" className="nav-item" onClick={closeMobile}>
          <FaBox className="nav-icon" />
          {!collapsed && <span>Orders</span>}
        </NavLink>

        <NavLink to="/staff" className="nav-item" onClick={closeMobile}>
          <FaUsers className="nav-icon" />
          {!collapsed && <span>Staff</span>}
        </NavLink>

        <NavLink to="/attendance" className="nav-item" onClick={closeMobile}>
          <FaCalendarAlt className="nav-icon" />
          {!collapsed && <span>Attendance</span>}
        </NavLink>

        <NavLink to="/settings" className="nav-item" onClick={closeMobile}>
          <FaCog className="nav-icon" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <NavLink to="/kitchen" className="nav-item" onClick={closeMobile}>
          <FaUtensils className="nav-icon" />
          {!collapsed && <span>Kitchen</span>}
        </NavLink>
      </nav>
    </aside>
  );
}