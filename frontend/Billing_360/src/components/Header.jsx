import { NavLink } from "react-router-dom";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";

export default function Header({ onToggle, onDarkToggle, dark }) {
  return (
    <header className="header">
      <div className="header-left">
        <FaBars className="hamburger" onClick={onToggle} />

  
      </div>

      <div className="profile">
        <button className="dark-btn" onClick={onDarkToggle}>
          {dark ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </header>
  );
}
