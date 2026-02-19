import "../styles/Appearance.css";
import useLocalStorage from "../hooks/useLocalStorage";
import {  useEffect } from "react";
export default function Appearance(){

  const [theme, setTheme] = useLocalStorage("theme", "dark");
  const [primaryColor, setPrimaryColor] = useLocalStorage("primaryColor", "#00c853");

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", primaryColor);
    document.body.setAttribute("data-theme", theme);
  }, [theme, primaryColor]);

  return (
    <div className="form-grid">

      <div className="premium-field">
        <label>Theme</label>
        <select
          value={theme}
          onChange={(e)=>setTheme(e.target.value)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div className="premium-field">
        <label>Primary Color</label>
        <input
          type="color"
          value={primaryColor}
          onChange={(e)=>setPrimaryColor(e.target.value)}
        />
      </div>

      <button className="save-btn">
        Saved Automatically 😄
      </button>

    </div>
  );
}

function Toggle({label}){
  return(
    <div className="toggle-row">
      <span>{label}</span>

      <label className="switch">
        <input type="checkbox"/>
        <span className="slider"/>
      </label>
    </div>
  )
}
