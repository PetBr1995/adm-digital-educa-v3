// src/auth/ProtectedAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    const token = localStorage.getItem("token");
    return token ? children : null;
  }

  // Se não estiver autenticado → redireciona sem alerta
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Se não for SUPERADMIN → também só redireciona
  if (role !== "SUPERADMIN") return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedAdminRoute;
