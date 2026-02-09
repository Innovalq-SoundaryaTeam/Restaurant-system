import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUtensils, FaChevronDown } from "react-icons/fa";

export default function Sidebar({ collapsed, mobileOpen, closeMobile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      {/* LOGO */}
      <div className="logo">
        {collapsed ? (
          <img
            src="https://png.pngtree.com/png-vector/20250910/ourmid/pngtree-restaurant-logo-with-chef-hat-and-fork-spoon-symbol-png-image_17398231.webp"
            alt="logo"
          />
        ) : (
          "Billing360"
        )}
      </div>

      <nav>
        {/* DASHBOARD */}
        <NavLink to="/Dashboard" end onClick={closeMobile} className="nav-item">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* MENU */}
        <div
          className={`menu-block ${menuOpen ? "open" : ""}`}
          onMouseEnter={() => collapsed && setMenuOpen(true)}
          onMouseLeave={() => collapsed && setMenuOpen(false)}
        >
          <div
            className="submenu-title"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaUtensils />
            {!collapsed && <span>Menu</span>}
            {!collapsed && (
              <FaChevronDown className={`arrow ${menuOpen ? "open" : ""}`} />
            )}
          </div>

          {/* SUBMENU */}
          {menuOpen && (
            <div className={`submenu ${collapsed ? "floating" : ""}`}>
              <NavLink to="/food-items" onClick={closeMobile}>
                Food Items
              </NavLink>
              <NavLink to="/menu" onClick={closeMobile}>
                Menu List
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
