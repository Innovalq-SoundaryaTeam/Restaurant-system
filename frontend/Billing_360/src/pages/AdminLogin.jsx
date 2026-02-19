import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminLogin.css';
import API from "../api/axios";

export default function AdminLogin() {
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem("adminToken");

  // if (token) {
  //   navigate("/dashboard");
  // }
},[]);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const response = await API.post("/api/admin/login", {
      phone_number: phoneNumber,
      password: password,
    });

    localStorage.setItem("adminToken", response.data.access_token);
    localStorage.setItem("adminUser", JSON.stringify(response.data.user));

    setMessage("Login successful! Redirecting...");

    setTimeout(() => {
      navigate("/Dashboard");
    }, 800);

  } catch (error) {

    setMessage(
      error.response?.data?.detail || "Login failed"
    );

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
              style={{backgroundColor:"#e7eaeb"}}
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
                style={{backgroundColor:"#e7eaeb"}}
              
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
