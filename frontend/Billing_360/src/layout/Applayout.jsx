import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={styles.appContainer}>
      {/* 1. Sidebar (Fixed to the Left) */}
      <div style={styles.sidebarSection}>
        <Sidebar 
          collapsed={collapsed} 
          mobileOpen={mobileOpen} 
          closeMobile={() => setMobileOpen(false)} 
        />
      </div>

      {/* 2. Main Wrapper (Header + Page Content) */}
      <div style={styles.mainWrapper}>
        {/* Header stays pinned to the top */}
        <Header 
          onToggle={() => setCollapsed(!collapsed)} 
        />
        
        {/* Only this part scrolls */}
        <main style={styles.contentArea}>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

// --- INTERNAL STYLES TO FIX THE LAYOUT ---
const styles = {
  appContainer: {
    display: "flex",          // This forces Sidebar & Content to be side-by-side
    height: "100vh",          // Full viewport height
    width: "100vw",           // Full viewport width
    overflow: "hidden",       // Prevents double scrollbars
    backgroundColor: "#121212" // Dark Theme Background
  },
  sidebarSection: {
    flex: "0 0 auto",         // Sidebar keeps its natural width, won't shrink
    height: "100%",
    overflowY: "auto",        // Allows sidebar to scroll independently if needed
    zIndex: 100               // Keeps sidebar above content if they overlap
  },
  mainWrapper: {
    flex: 1,                  // Takes up all remaining space
    display: "flex",
    flexDirection: "column",  // Stacks Header on top of Content
    height: "100%",
    overflow: "hidden",       // Prevents the wrapper itself from scrolling
    position: "relative"
  },
  contentArea: {
    flex: 1,                  // Takes up all space below the Header
    overflowY: "auto",        // Enables scrolling ONLY for the page content
    padding: "20px",          // Adds some breathing room
    backgroundColor: "#121212" // Matches the dark theme
  }
};
