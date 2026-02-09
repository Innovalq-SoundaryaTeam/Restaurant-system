import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminLogin.css';

export default function AdminLogin() {
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        
        localStorage.setItem("adminToken", data.access_token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));

        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          navigate("/admin/menu"); 
        }, 1000);

      } else {
        setMessage(data.detail || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <header className="login-header">
          <h1>Admin Login</h1>
          <p>Restaurant Management System</p>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-group"> 
            <label htmlFor="phone" className="login-labels">Phone Number</label>
            <input
              id="phone"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="Enter registered phone"
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="login-labels">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Submit"}
          </button>
        </form>

        <div className="login-footer">
          <p>Default credentials:</p>
          <p>Phone: 9999999999</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}
