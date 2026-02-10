import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // 🔑 APPLY DARK MODE TO BODY
  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <div className="main-wrapper">
        <Header
          dark={dark}
          onDarkToggle={() => setDark((prev) => !prev)}
          onToggle={() => {
            if (window.innerWidth <= 768) {
              setMobileOpen(true);
            } else {
              setCollapsed((prev) => !prev);
            }
          }}
        />

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
