import { Navigate } from "react-router-dom";

// Helper to decode JWT and check expiry
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // No token or user → redirect to login
  if (!token || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // Role mismatch → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      candidate: "/candidate-dashboard",
      employer: "/employer-dashboard",
      admin: "/admin-dashboard",
    };
    return <Navigate to={redirectMap[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
