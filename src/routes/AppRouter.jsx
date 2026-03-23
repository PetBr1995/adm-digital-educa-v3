// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedAdminRoute from "../auth/ProtectedRouter";
import RouteAnalyticsTracker from "../components/analytics/RouteAnalyticsTracker";

const Login = lazy(() => import("../features/auth/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Home = lazy(() => import("../layout/Home"));
const Conteudos = lazy(() => import("../pages/Conteudos"));
const ConteudoPlayer = lazy(() => import("../pages/ConteudoPlayer"));
const CadastrarConteudo = lazy(() => import("../pages/CadastrarConteudo"));
const EditarConteudo = lazy(() => import("../pages/EditarConteudo"));
const Instrutores = lazy(() => import("../pages/Instrutores"));
const CadastrarInstrutor = lazy(() => import("../components/CadastrarInstrutor"));
const EditarInstrutor = lazy(() => import("../pages/EditarInstrutor"));
const Usuarios = lazy(() => import("../pages/Usuarios"));
const CadastrarUsuario = lazy(() => import("../pages/CadastrarUsuario"));
const Planos = lazy(() => import("../pages/Planos"));
const CadastrarPlano = lazy(() => import("../pages/CadastrarPlano"));
const EditarPlano = lazy(() => import("../pages/EditarPlano"));
const Categorias = lazy(() => import("../pages/Categorias"));

const RouteLoader = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#9ca3af",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      background: "#0f172a",
    }}
  >
    Carregando...
  </div>
);

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouteAnalyticsTracker />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Login público */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas com layout Home + Drawer */}
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <Home />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="conteudos" element={<Conteudos />} />
            <Route path="conteudos/:id/player" element={<ConteudoPlayer />} />
            <Route path="cadastrarconteudo" element={<CadastrarConteudo />} />
            <Route path="conteudos/editar/:id" element={<EditarConteudo />} />
            <Route path="instrutores" element={<Instrutores />} />
            <Route path="cadastrarinstrutor" element={<CadastrarInstrutor />} />
            <Route path="instrutores/editar/:id" element={<EditarInstrutor />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="cadastrarusuario" element={<CadastrarUsuario />} />
            <Route path="planos" element={<Planos />} />
            <Route path="planos/cadastrar" element={<CadastrarPlano />} />
            <Route path="planos/editar/:id" element={<EditarPlano />} />
            <Route path="categorias" element={<Categorias />} />
            {/* aqui você adiciona /cursos, /instrutores, etc */}
          </Route>

          {/* fallback: se rota não existe, manda pro login ou dashboard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
