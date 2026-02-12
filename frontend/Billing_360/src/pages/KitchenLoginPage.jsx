import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function KitchenLogin() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/kitchen/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem("kitchenToken", data.access_token);
        localStorage.setItem("kitchenUser", JSON.stringify(data.user));

        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          navigate("/KitchenDashboard");
        }, 1000);

      } else {
        setMessage(data.detail || "Invalid username or password");
      }

    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kitchen-login-container" style={{justifyContent:"center", minHeight:"100vh", display:"flex", justifyContent:"center", alignItems:"center"}}>
      <div className="login-card" style={{width:"1500px"}}>

        <header className="login-header">
          <h1>Kitchen Login</h1>
          <p>Restaurant Management System</p>
        </header>

        <form onSubmit={handleLogin} className="login-form">

          {message && (
            <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
              style={{color:"black",backgroundColor:"#e7eaeb"}}
            />
          </div>

          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
               style={{color:"black",backgroundColor:"#e7eaeb"}}
            />
          </div>

          
          <button type="submit" className="login-btn" disabled={loading} onClick={() => navigate("/Kitchen")}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
             <div className="login-footer">
  <p>
    I don't have an account?{" "}
    <span
      style={{ cursor: "pointer", color: "blue", fontWeight: "600" }}
      onClick={() => navigate("/KitchenSignup")}
    >
      Create an account
    </span>
  </p>
</div>

        </form>

      </div>
    </div>
  );
}