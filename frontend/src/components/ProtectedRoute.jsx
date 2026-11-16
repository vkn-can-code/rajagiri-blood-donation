import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// We need to check useAuth or localStorage directly
// Using localStorage is safer here to prevent hook loops if AuthContext isn't ready

export default function ProtectedRoute({ allowedRoles, children }) {
  // 1. Get user from storage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 2. If NOT logged in, kick them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If restricted to certain roles (e.g. only 'admin')
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. THE FIX: Render children (DashboardLayout) if they exist.
  // Otherwise, render the Outlet (standard nested routes).
  return children ? children : <Outlet />;
}