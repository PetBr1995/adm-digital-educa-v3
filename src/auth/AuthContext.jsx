// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // ex: { role, email, ... }
  const [loading, setLoading] = useState(true); // carregando validação inicial

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // valida exp
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setLoading(false);
          return;
        }

        // valida role
        if (!decoded.role || decoded.role !== "SUPERADMIN") {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setLoading(false);
          return;
        }

        // valida com backend (opcional, como no seu PrivateRoute)
        await api.get("/auth/check");

        // se passou por tudo, considera autenticado
        setUser({
          role: decoded.role,
          email: decoded.email,
          // ... outros campos do token, se tiver
        });
      } catch (err) {
        console.error("[AuthContext] erro ao validar token:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);

    if (!decoded.role || decoded.role !== "SUPERADMIN") {
      throw new Error("Acesso negado: não é SUPERADMIN");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", decoded.role);

    setUser({
      role: decoded.role,
      email: decoded.email,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
