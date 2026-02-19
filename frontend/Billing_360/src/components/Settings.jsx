import { useState } from "react";
import "../styles/Settings.css";
import Security from "./Security";
import RestaurantProfile from "./RestaurantProfile";

const menuItems = [
  "Restaurant Profile",
  "Security",
];

export default function SettingsLayout() {

  const [active, setActive] = useState("Restaurant Profile");

  return (
    <div className="settings-container">

      {/* HEADER */}
      <h1 className="settings-title">Settings</h1>


      {/* HORIZONTAL GRID MENU */}
      <div className="settings-menu-grid">

        {menuItems.map(item => (
          <button
            key={item}
            className={`menu-btn ${active === item ? "active" : ""}`}
            onClick={() => setActive(item)}
          >
            {item}
          </button>
        ))}

      </div>


      {/* CONTENT PANEL */}
      <div className="settings-content">

        {active === "Restaurant Profile" && <RestaurantProfile />}
        {active === "Billing & Tax" && <BillingTax />}
        {active === "Notifications" && <Notifications />}
        {active === "Security" && <Security />}
        {/* {active === "Appearance" && <Appearance />} */}
      </div>

    </div>
  );
}


/* ---------------- COMPONENT ---------------- */

// function RestaurantProfile() {
//   return (
//     <div className="form-grid">

//       <input placeholder="Restaurant Name"/>
//       <input placeholder="Phone Number"/>

//       <input placeholder="Email Address"/>
//       <input placeholder="GST / Tax ID"/>

//       <input placeholder="Currency (₹)"/>
//       <input placeholder="Timezone"/>

//       <textarea placeholder="Full Address"/>

//       <button className="save-btn">
//         Save Changes
//       </button>

//     </div>
//   );
// }
