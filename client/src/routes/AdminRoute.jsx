import { Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { isAdmin, isAuthenticated } from "../services/authService.js";

export default function AdminRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // AdminLayout must render <Outlet /> inside it
  return <AdminLayout />;
}
