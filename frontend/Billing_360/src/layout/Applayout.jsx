import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar stays fixed to the left */}
      <Sidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        closeMobile={() => setMobileOpen(false)} 
      />

      <div className="main-wrapper">
        {/* Header stays pinned to the top */}
        <Header 
          onToggle={() => setCollapsed(!collapsed)} 
        />
        {/* Only the content area is scrollable */}
        <main className="content-area">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}