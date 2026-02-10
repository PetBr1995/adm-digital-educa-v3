// src/features/auth/Login.jsx

import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Fade,
  alpha,
} from "@mui/material";
import {
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axiosInstance";
import { useAuth } from "../../auth/AuthContext";
import theme from "../../theme/theme";

// Lottie
import Lottie from "lottie-react";
import successAnimation from "../../assets/success-tick.json";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: value && !validateEmail(value) ? "Email inválido" : null,
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setSenha(value);
    setErrors((prev) => ({
      ...prev,
      senha:
        value && !validatePassword(value)
          ? "Senha deve ter pelo menos 6 caracteres"
          : null,
    }));
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email) || !validatePassword(senha)) return;

    setLoading(true);
    setLoginSuccess(false);

    try {
      const response = await api.post("/auth/login", {
        email,
        senha,
      });

      const token = response.data.access_token;
      login(token);

      setLoginSuccess(true);

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1600);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao entrar",
        text: "Email ou senha inválidos.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(circle at top, ${theme.palette.secondary.light}, ${theme.palette.secondary.dark})`,
      }}
    >
      <Fade in timeout={800}>
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            p: 5,
            borderRadius: 3,
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            background: theme.palette.secondary.dark,
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          {/* Overlay de sucesso */}
          {loginSuccess && (
            <Fade in={loginSuccess} timeout={300}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: alpha("#020617", 1),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <Box sx={{ width: 100, mb: 2 }}>
                  <Lottie animationData={successAnimation} loop={false} />
                </Box>

                <Typography
                  sx={{
                    color: "#e5e7eb",
                    fontSize: "2rem",
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  Login efetuado com sucesso!
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Header do cartão */}
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              justifyContent: "start",
            }}
          >
            <Box
              component="img"
              src="https://i.imgur.com/VJTBnRB.png"
              alt="Digital Educa Logo"
              sx={{
                height: 29,
                display: "flex",
                justifyContent: "center",
                mb: 6, // <-- CORREÇÃO AQUI (removido o mb duplicado)
              }}
            />

            <Typography
              color="text.secondary"
              variant="body1"
              sx={{
                textAlign: "center",
                opacity: 0.8,
                fontSize: "1.1rem",
                letterSpacing: "0.5px",
                color: "#EDF4FB",
                fontWeight: 300,
              }}
            >
              Acesse sua conta administrativa
            </Typography>
          </Box>

          <TextField
            label="Seu e-mail"
            type="email"
            fullWidth
            value={email}
            onChange={handleEmailChange}
            error={!!errors.email}
            helperText={errors.email}
            required
            disabled={loading || loginSuccess}
          />

          <TextField
            label="Sua senha"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={senha}
            onChange={handlePasswordChange}
            error={!!errors.senha}
            helperText={errors.senha}
            required
            disabled={loading || loginSuccess}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    disabled={loading || loginSuccess}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlined sx={{ color: "#728CAA" }} />
                    ) : (
                      <VisibilityOutlined sx={{ color: "#728CAA" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || loginSuccess}
            sx={{
              fontWeight: 500,
              textTransform: "none",
              color: "#fff",
            }}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : ""
            }
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;
