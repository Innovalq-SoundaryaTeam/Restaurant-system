import { NavLink } from "react-router-dom";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";

export default function Header({ onToggle, onDarkToggle, dark }) {
  return (
    <header className="header">
      <div className="header-left">
        <FaBars className="hamburger" onClick={onToggle} />

        <div className="links">
          <NavLink to="/Dashboard">Dashboard</NavLink>
          <NavLink to="/transaction">Transaction</NavLink>
          <NavLink to="/booking">Booking</NavLink>
          <NavLink to="/order-status">Order Status</NavLink>
        </div>
      </div>

      <div className="profile">
        <img src="https://i.pravatar.cc/40" alt="user" />
        <button className="dark-btn" onClick={onDarkToggle}>
          {dark ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </header>
  );
}
