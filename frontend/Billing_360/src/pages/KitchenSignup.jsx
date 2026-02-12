import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminLogin.css'; 

export default function KitchenSignup() {

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Password validation
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/kitchen/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          phone_number: phoneNumber,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Signup successful! Redirecting to login...");

        setTimeout(() => {
          navigate("/KitchenLogin");
        }, 1000);

      } else {
        setMessage(data.detail || "Signup failed");
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
          <h1>Kitchen Signup</h1>
          <p>Restaurant Management System</p>
        </header>

        <form onSubmit={handleSignup} className="login-form">

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

        
          <div className="form-group">
            <label className="login-labels">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
              className="login-input"
              style={{ backgroundColor: "#e7eaeb" }}
            />
          </div>

          
          <div className="form-group">
            <label className="login-labels">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="Enter phone number"
              className="login-input"
              style={{ backgroundColor: "#e7eaeb" }}
            />
          </div>

          <div className="form-group">
            <label className="login-labels">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              style={{ backgroundColor: "#e7eaeb" }}
            />
          </div>

         
          <div className="form-group">
            <label className="login-labels">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="login-input"
              style={{ backgroundColor: "#e7eaeb" }}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="login-footer">
  <p>
    Already have an account?{" "}
    <span
      style={{ cursor: "pointer", color: "blue", fontWeight: "600" }}
      onClick={() => navigate("/KitchenLogin")}
    >
      Login
    </span>
  </p>
</div>

      </div>
    </div>
  );
}