import React, { useState, useEffect } from "react";
import MenuItem from "../components/MenuItem"; 

export default function MenuPage() {

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH API SAFE
  useEffect(() => {

    const fetchMenu = async () => {
      try {
        
        const response = await fetch("http://localhost:8000/api/menu");

        if (!response.ok) {
          throw new Error("Failed to fetch menu");
        }

        const data = await response.json();

        // 🔥 DOUBLE SAFETY
        setMenuItems(Array.isArray(data) ? data : []);

      } catch (error) {

        console.error("Backend connection failed:", error);
        setMenuItems([]);

      } finally {
        setLoading(false);
      }
    };

    fetchMenu();

  }, []);

  // ✅ LOADING UX
  if (loading) {
    return (
      <div className="menu-container">
        <h2 style={{color:"white", textAlign: "center", marginTop: "50px"}}>Loading menu...</h2>
      </div>
    );
  }

  return (
    <div className="menu-container">

      <div className="static-header-wrapper">
        <header className="menu-header">
          <h1>Menu Items</h1>
          <p>Premium selection, served fast.</p>
        </header>
      </div>

      <div className="scrollable-menu-area">
        <div className="menu-grid">

          {/* ✅ SAFE RENDER */}
          {menuItems.length === 0 ? (

            <h2 style={{color:"white", textAlign: "center", width: "100%"}}>
              No menu items available
            </h2>

          ) : (

            menuItems.map((item) => (
              <MenuItem
                key={item.id || item.name}
                item={item}
              />
            ))

          )}

        </div>
      </div>

    </div>
  );
}