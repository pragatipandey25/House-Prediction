import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    const redirectMap = {
      candidate: "/candidate/dashboard",
      employer: "/employer/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={redirectMap[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
