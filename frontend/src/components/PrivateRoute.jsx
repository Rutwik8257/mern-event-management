import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  // Wait until AuthContext has loaded user info
  if (loading) {
    return <p>Loading...</p>; // or a spinner
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If adminOnly is true and user is not admin, redirect to dashboard
  if (adminOnly && user.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the child component
  return children;
};

export default PrivateRoute;
