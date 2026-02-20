// src/routes/AppRouter.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedAdminRoute from "../auth/ProtectedRouter";
import Home from "../layout/Home";
import Conteudos from "../pages/Conteudos";
import CadastrarConteudo from "../pages/CadastrarConteudo";
import EditarConteudo from "../pages/EditarConteudo";
import Instrutores from "../pages/Instrutores";
import CadastrarInstrutor from "../components/CadastrarInstrutor";
import EditarInstrutor from "../pages/EditarInstrutor";
import Usuarios from "../pages/Usuarios";
import CadastrarUsuario from "../pages/CadastrarUsuario";
import Planos from "../pages/Planos";
import CadastrarPlano from "../pages/CadastrarPlano";
import EditarPlano from "../pages/EditarPlano";
import Categorias from "../pages/Categorias";

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
          <Route path="conteudos/editar/:id" element={<EditarConteudo />} />
          <Route path="instrutores" element={<Instrutores/>}/>
          <Route path="cadastrarinstrutor" element={<CadastrarInstrutor/>}/>
          <Route path="instrutores/editar/:id" element={<EditarInstrutor/>}/>
          <Route path="usuarios" element={<Usuarios/>}/>
          <Route path="cadastrarusuario" element={<CadastrarUsuario/>}/>
          <Route path="planos" element={<Planos/>} />
          <Route path="planos/cadastrar" element={<CadastrarPlano/>} />
          <Route path="planos/editar/:id" element={<EditarPlano/>} />
          <Route path="categorias" element={<Categorias/>} />
          {/* aqui você adiciona /cursos, /instrutores, etc */}
        </Route>

        {/* fallback: se rota não existe, manda pro login ou dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
