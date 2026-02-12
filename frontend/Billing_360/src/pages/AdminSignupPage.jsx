import React from "react";
import "../styles/AdminSignup.css";

export default function AdminSignup() {
  return (
    <div className="bg" style={{backgroundColor:"black"}}>
      <div className="signup-card">
        <h2>Admin Signup</h2>
        <p className="subtitle">Restaurant Management System</p>

        <label>Username</label>
        <input type="text" placeholder="admin" />

        <label>Phone Number</label>
        <input type="tel" placeholder="Enter phone number" />

        <label>Password</label>
        <input type="password" placeholder="Enter password" />

        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm password" />

        <button className="signup-btn">Sign Up</button>

        <p className="login-text">
          Already have an account? <span>Login</span>
        </p>
      </div>
    </div>
  );
}