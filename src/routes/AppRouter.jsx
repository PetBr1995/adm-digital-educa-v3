// src/routes/AppRouter.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedAdminRoute from "../auth/ProtectedRouter";
import Home from "../layout/Home";
import Conteudos from "../pages/Conteudos";
import CadastrarConteudo from "../pages/CadastrarConteudo";
import Instrutores from "../pages/Instrutores";
import CadastrarInstrutor from "../components/CadastrarInstrutor";

export default function AppRouter() {
  return (
    <BrowserRouter>
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
          <Route path="cadastrarconteudo" element={<CadastrarConteudo />} />
          <Route path="instrutores" element={<Instrutores/>}/>
          <Route path="cadastrarinstrutor" element={<CadastrarInstrutor/>}/>
          {/* aqui você adiciona /cursos, /instrutores, etc */}
        </Route>

        {/* fallback: se rota não existe, manda pro login ou dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
