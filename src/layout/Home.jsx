// src/layout/Home.jsx
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { alpha, styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  CssBaseline,
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  useMediaQuery,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import { CoPresent, DonutLarge, GroupOutlined, VideoLibrary } from "@mui/icons-material";

import { useAuth } from "../auth/AuthContext";

const drawerWidth = 240;

// estilos do drawer aberto
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: theme.palette.secondary.dark,
});

// estilos do drawer fechado (mini)
const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: theme.palette.secondary.dark,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      borderRight: `1px solid ${alpha(theme.palette.secondary.light, 0.5)}`,
      boxShadow: "none",
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      borderRight: `1px solid ${alpha(theme.palette.secondary.light, 0.5)}`,
      boxShadow: "none",
    },
  }),
}));

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const isCadastrarInstrutorPage = location.pathname === "/cadastrarinstrutor";
  const isCadastrarUsuarioPage = location.pathname === "/cadastrarusuario";
  const userEmail = user?.email || "email@nao-informado";
  const userName =
    user?.nome ||
    user?.name ||
    (userEmail.includes("@") ? userEmail.split("@")[0] : "Usuário");
  const userInitial = (userName || "?").trim().charAt(0).toUpperCase();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleMobileDrawerOpen = () => setMobileOpen(true);
  const handleMobileDrawerClose = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const handleRequestLogout = () => setOpenLogoutDialog(true);
  const handleCloseLogoutDialog = () => setOpenLogoutDialog(false);
  const handleConfirmLogout = () => {
    setOpenLogoutDialog(false);
    handleLogout();
  };

  // ====== MENU DO ACCOUNT (HEADER) ======
  const [anchorElAccount, setAnchorElAccount] = useState(null);
  const openAccountMenu = Boolean(anchorElAccount);

  const handleOpenAccountMenu = (event) => {
    setAnchorElAccount(event.currentTarget);
  };

  const handleCloseAccountMenu = () => {
    setAnchorElAccount(null);
  };

  const menuItems = [
    { label: "Dashboard", icon: <DonutLarge />, path: "/dashboard" },
    { label: "Conteúdos", icon: <VideoLibrary />, path: "/conteudos" },
    { label: "Instrutores", icon: <CoPresent />, path: "/instrutores" },
    { label: "Usuários", icon: <GroupOutlined />, path: "/usuarios" },
    // adicione mais páginas aqui depois
  ];

  return (
    <Box
      sx={{
        display: "flex",
        background: `radial-gradient(
          circle at top right,
          ${theme.palette.secondary.light} 0%,
          ${theme.palette.secondary.main} 70%
        )`,
        height: isCadastrarInstrutorPage || isCadastrarUsuarioPage ? "100vh" : "100%",
      }}
    >
      <CssBaseline />

      {/* HEADER */}
      <AppBar position="fixed" open={!isMobile && open} sx={{ zIndex: 10 }}>
        <Toolbar
          sx={{
            borderBottom: `1px solid ${alpha(
              theme.palette.secondary.light,
              0.5
            )}`,
            bgcolor: theme.palette.secondary.dark,
          }}
        >
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="abrir menu"
              edge="start"
              onClick={handleMobileDrawerOpen}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              ml: "auto",
            }}
          >
            <Tooltip title="Notificações">
              <IconButton aria-label="Notificações">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Conta">
              <IconButton
                aria-label="Conta"
                onClick={handleOpenAccountMenu}
                aria-controls={openAccountMenu ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openAccountMenu ? "true" : undefined}
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>

            {/* MENU DO ACCOUNT */}
            <Menu
              id="account-menu"
              anchorEl={anchorElAccount}
              open={openAccountMenu}
              onClose={handleCloseAccountMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 180,
                  bgcolor: theme.palette.secondary.light
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    color: "common.white",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {userInitial}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }} noWrap>
                    {userName}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }} noWrap>
                    {userEmail}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleCloseAccountMenu();
                  handleRequestLogout();
                }}
                sx={{ color: "#e63946", fontWeight: 600, m: 1, borderRadius: 2 }}
              >
                <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* DRAWER MOBILE */}
      {isMobile && (
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerClose}
          ModalProps={{ keepMounted: true }}
          elevation={0}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: theme.palette.secondary.dark,
              borderRight: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            },
          }}
        >
          <DrawerHeader sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton
              onClick={handleMobileDrawerClose}
              disableRipple
              disableFocusRipple
              sx={{
                borderRadius: "12px",
                backgroundColor: "transparent !important",
                "&:hover": { backgroundColor: "transparent !important" },
                "&:active": { backgroundColor: "transparent !important" },
                "&:focus": { backgroundColor: "transparent !important" },
              }}
            >
              <img
                src="/logo.png"
                alt="logo"
                style={{
                  width: 170,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </IconButton>
          </DrawerHeader>

          <Divider sx={{ mx: 2 }} />

          <List sx={{ mt: 3 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.label} disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      handleMobileDrawerClose();
                    }}
                    selected={isActive}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      mx: 1,
                      borderRadius: 2,
                      transition: "background-color .2s ease, transform .05s ease",
                      color: theme.palette.secondary.contrastText,
                      "& .MuiListItemIcon-root": {
                        minWidth: 0,
                        mr: 3,
                        justifyContent: "center",
                        color: alpha(theme.palette.secondary.contrastText, 0.8),
                        transition: "color .2s ease",
                      },
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                      "&:active": {
                        bgcolor: alpha(theme.palette.primary.main, 0.25),
                        transform: "scale(0.99)",
                      },
                      "&.Mui-selected": {
                        bgcolor: alpha(theme.palette.primary.light, 1),
                        color: theme.palette.secondary.dark,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.light, 1),
                          color: theme.palette.secondary.dark,
                        },
                        "& .MuiListItemIcon-root": {
                          color: theme.palette.secondary.dark,
                        },
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontWeight: isActive ? 700 : 500,
                          fontSize: 16,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </MuiDrawer>
      )}

      {/* DRAWER DESKTOP */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open={open}
          sx={{ position: "relative", zIndex: 20, display: { xs: "none", md: "block" } }}
        >
        <DrawerHeader sx={{ display: "flex", justifyContent: "center" }}>
          {/* Quando o drawer estiver ABERTO → logo grande */}
          {open && (
            <IconButton
              onClick={handleDrawerClose}
              disableRipple
              disableFocusRipple
              sx={{
                borderRadius: "12px",
                backgroundColor: "transparent !important",
                "&:hover": { backgroundColor: "transparent !important" },
                "&:active": { backgroundColor: "transparent !important" },
                "&:focus": { backgroundColor: "transparent !important" },
              }}
            >
              <img
                src="/logo.png"
                alt="logo"
                style={{
                  width: 180,
                  height: "auto",
                  objectFit: "contain",
                  transition: "all 0.25s ease",
                }}
              />
            </IconButton>
          )}

          {/* Quando o drawer estiver FECHADO → logo pequena */}
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              disableRipple
              disableFocusRipple
              sx={{
                margin: "auto",
                backgroundColor: "transparent !important",
                "&:hover": { backgroundColor: "transparent !important" },
                "&:active": { backgroundColor: "transparent !important" },
                "&:focus": { backgroundColor: "transparent !important" },
              }}
            >
              <img
                src="/logo-sm-digital-educa.png"
                alt="logo"
                style={{
                  width: 28,
                  height: "auto",
                  objectFit: "contain",
                  transition: "all 0.25s ease",
                }}
              />
            </IconButton>
          )}
        </DrawerHeader>

        <Divider sx={{ mx: 2 }} />

        {/* ITENS DO MENU PRINCIPAL */}
        <List sx={{ mt: 3 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.label} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    mx: 1,
                    borderRadius: 2,
                    transition: "background-color .2s ease, transform .05s ease",

                    // cor padrão do texto/ícone
                    color: theme.palette.secondary.contrastText,

                    // ícone (default)
                    "& .MuiListItemIcon-root": {
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: alpha(theme.palette.secondary.contrastText, 0.8),
                      transition: "color .2s ease",
                    },

                    // HOVER (sempre)
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      "& .MuiListItemIcon-root": {
                      },
                    },

                    // ACTIVE (mousedown)
                    "&:active": {
                      bgcolor: alpha(theme.palette.primary.main, 0.25),
                      transform: "scale(0.99)",
                    },

                    // SELECTED (rota atual)
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.light, 1),
                      color: theme.palette.secondary.dark,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.light, 1),
                        color: theme.palette.secondary.dark
                      },
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.secondary.dark
                      },
                    },
                  }}
                >
                  <ListItemIcon
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} sx={{
                    opacity: open ? 1 : 0, "& .MuiListItemText-primary": {
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 16,
                      transition: "font-weight .2s ease",
                    },
                  }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/*
        <Divider sx={{ mt: "auto" }} />
        */}

        {/* BOTÃO DE LOGOUT NO FINAL DO DRAWER */}
        {/*
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color: "#e63946",
                }}
              >
                <LogoutRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                sx={{
                  opacity: open ? 1 : 0,
                  color: "#e63946",
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
                  */}
        </Drawer>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.25, sm: 2, md: 3 },
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {/* empurra o conteúdo para baixo do AppBar */}
        <DrawerHeader />

        {/* Aqui entram suas páginas internas */}
        <Outlet />
      </Box>

      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.secondary.light,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar logout</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.8) }}>
            Deseja realmente sair da sua conta?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseLogoutDialog}
            sx={{ color: "#fff", borderColor: alpha(theme.palette.common.white, 0.25) }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmLogout}
          >
            Sair
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
