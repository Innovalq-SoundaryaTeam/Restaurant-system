import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const token = localStorage.getItem("adminToken");

  // If no token → go to login
  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
