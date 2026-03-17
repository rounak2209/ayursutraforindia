
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * Wraps any route that should require authentication.
 * Props:
 *   - children: component to render if allowed
 *   - allowedRoles: string or array of allowed roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    // Not logged in — redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!allowed.includes(role)) {
      // Logged in but role not allowed
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
