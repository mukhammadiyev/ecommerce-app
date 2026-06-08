import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../services/authService.js";

export default function AdminRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
