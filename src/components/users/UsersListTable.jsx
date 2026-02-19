import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Add, DeleteOutline, EditOutlined } from "@mui/icons-material";
import theme from "../../theme/theme";
import api from "../../api/axiosInstance";
import SearchBarComponent from "../contentComponents/SearchBarComponente";

const formatCreatedAt = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const toTimestamp = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const normalizeUsuarios = (data) => {
  const raw =
    data?.data?.usuarios ??
    data?.data?.users ??
    data?.usuarios ??
    data?.users ??
    data?.data ??
    data;

  if (!Array.isArray(raw)) return [];

  return raw.map((u, index) => ({
    id: String(u?.id ?? u?._id ?? index),
    nome: String(u?.nome ?? u?.name ?? "Sem nome"),
    email: String(u?.email ?? "-"),
    role: String(u?.role ?? u?.perfil ?? "-"),
    celular: String(u?.celular ?? u?.telefone ?? u?.phone ?? "-"),
    createdAt: u?.createdAt ?? u?.created_at ?? u?.dataCriacao ?? null,
  }));
};

const UsersListTable = ({ onCreateUser }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const [allUsuarios, setAllUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("recentes");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuUsuario, setMenuUsuario] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    let mounted = true;

    const carregarUsuarios = async () => {
      setLoading(true);
      try {
        const endpoints = [
          "/usuario/admin/usuarios",
          "/usuarios",
          "/usuarios/list",
          "/user",
          "/users",
        ];

        let usuarios = [];

        for (const endpoint of endpoints) {
          try {
            const response = await api.get(endpoint, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              params: { page: 1, limit: 1000 },
            });
            console.log(`[UsersListTable] resposta de ${endpoint}:`, response.data);
            usuarios = normalizeUsuarios(response.data);
            if (usuarios.length > 0) break;
          } catch {
            // tenta o próximo endpoint
          }
        }

        if (mounted) setAllUsuarios(usuarios);
      } catch (error) {
        console.log(error);
        if (mounted) setAllUsuarios([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregarUsuarios();

    return () => {
      mounted = false;
    };
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allUsuarios;

    return allUsuarios.filter((u) => {
      const nome = (u.nome || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      const celular = (u.celular || "").toLowerCase();
      const createdAt = formatCreatedAt(u.createdAt).toLowerCase();
      return (
        nome.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        celular.includes(term) ||
        createdAt.includes(term)
      );
    });
  }, [allUsuarios, search]);

  const usuariosOrdenados = useMemo(() => {
    const lista = [...usuariosFiltrados];
    lista.sort((a, b) => {
      const aTs = toTimestamp(a.createdAt);
      const bTs = toTimestamp(b.createdAt);
      return sortOrder === "antigos" ? aTs - bTs : bTs - aTs;
    });
    return lista;
  }, [usuariosFiltrados, sortOrder]);

  const totalFiltrado = usuariosOrdenados.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltrado / limit));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const usuariosPaginados = useMemo(() => {
    const start = (page - 1) * limit;
    return usuariosOrdenados.slice(start, start + limit);
  }, [usuariosOrdenados, page, limit]);

  const isMenuOpen = Boolean(menuAnchor);

  const handleOpenMenu = (event, usuario) => {
    setMenuAnchor(event.currentTarget);
    setMenuUsuario(usuario);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuUsuario(null);
  };

  const handleEditUsuario = () => {
    if (!menuUsuario) return;
    // TODO: ligar fluxo de edição de usuário
    console.log("Editar usuário:", menuUsuario);
    handleCloseMenu();
  };

  const handleDeleteUsuario = () => {
    if (!menuUsuario) return;
    if (String(menuUsuario.role).toUpperCase() === "SUPERADMIN") {
      console.log("SUPERADMIN não pode ser excluído:", menuUsuario);
      handleCloseMenu();
      return;
    }

    setUsuarioToDelete(menuUsuario);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setUsuarioToDelete(null);
  };

  const handleConfirmDeleteUsuario = async () => {
    if (!usuarioToDelete) return;
    const usuarioId = usuarioToDelete.id;
    if (!usuarioId) return;

    try {
      setDeleting(true);
      await api.delete(`/usuario/admin/usuarios/${usuarioId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setAllUsuarios((prev) =>
        prev.filter((usuario) => String(usuario.id) !== String(usuarioId))
      );

      setSnackbar({
        open: true,
        message: "Usuário excluído com sucesso.",
        severity: "success",
      });
    } catch (error) {
      console.log("Erro ao excluir usuário:", error?.response?.data || error);
      setSnackbar({
        open: true,
        message: "Não foi possível excluir o usuário.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setUsuarioToDelete(null);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "grid",
          gap: 2,
          alignItems: "center",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1fr 320px 200px auto",
          },
        }}
      >
        <Box>
          {loading ? (
            <>
              <Skeleton animation="wave" variant="text" width={220} height={26} />
              <Skeleton animation="wave" variant="text" width={160} height={20} />
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, md: 18 } }}>
                Usuários - ({totalFiltrado}) resultados
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: { xs: 13, md: 14 } }}>
                Total no sistema: {allUsuarios.length}
              </Typography>
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            gridColumn: { xs: "auto", md: "1 / -1", lg: "auto" },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 360 }}>
            <SearchBarComponent
              placeholder="Buscar usuários..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Box>
        </Box>

        <Box sx={{ width: "100%", gridColumn: { xs: "auto", md: "1 / -1", lg: "auto" } }}>
          <TextField
            select
            size="small"
            fullWidth
            label="Ordenar por"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="recentes">Mais recentes</MenuItem>
            <MenuItem value="antigos">Mais antigos</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ width: { xs: "100%", lg: "auto" }, gridColumn: { xs: "auto", md: "1 / -1", lg: "auto" } }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Add />}
            sx={{ textTransform: "capitalize", fontWeight: 700, width: { xs: "100%", lg: "auto" } }}
            onClick={onCreateUser}
          >
            Novo Usuário
          </Button>
        </Box>
      </Box>

      {isMobile ? (
        <Box sx={{ p: 1.5, display: "grid", gap: 1.5 }}>
          {loading &&
            Array.from({ length: 6 }).map((_, idx) => (
              <Paper
                key={`sk-card-user-${idx}`}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: theme.palette.secondary.light,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Skeleton animation="wave" variant="text" width="55%" />
                <Skeleton animation="wave" variant="text" width="80%" />
                <Skeleton animation="wave" variant="text" width="40%" />
              </Paper>
            ))}

          {!loading &&
            usuariosPaginados.map((usuario) => (
              <Paper
                key={usuario.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: theme.palette.secondary.light,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }} noWrap>
                      {usuario.nome}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }} noWrap>
                      {usuario.email}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    sx={{ color: "text.secondary", flexShrink: 0 }}
                    onClick={(event) => handleOpenMenu(event, usuario)}
                    aria-controls={isMenuOpen ? "usuario-actions-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen ? "true" : undefined}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 1.2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={usuario.role}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color:
                        String(usuario.role).toUpperCase() === "SUPERADMIN"
                          ? "#0b1020"
                          : "#ffffff",
                      bgcolor:
                        String(usuario.role).toUpperCase() === "SUPERADMIN"
                          ? "#FBBA41"
                          : alpha(theme.palette.primary.main, 0.25),
                      border:
                        String(usuario.role).toUpperCase() === "SUPERADMIN"
                          ? "1px solid #FBBA41"
                          : `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {formatCreatedAt(usuario.createdAt)}
                  </Typography>
                </Box>
              </Paper>
            ))}

          {!loading && usuariosFiltrados.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.secondary.light,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                Nenhum usuário encontrado
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
      <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.secondary.light }}>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              {!isTablet && <TableCell>Celular</TableCell>}
              {!isTablet && <TableCell>Criado em</TableCell>}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              bgcolor: theme.palette.secondary.light,
              "& .MuiTableCell-root": {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            {loading &&
              Array.from({ length: 8 }).map((_, idx) => (
                <TableRow key={`sk-user-${idx}`}>
                  <TableCell>
                    <Skeleton animation="wave" variant="text" width="70%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="text" width="80%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton animation="wave" variant="text" width="40%" />
                  </TableCell>
                  {!isTablet && (
                    <TableCell>
                      <Skeleton animation="wave" variant="text" width="30%" />
                    </TableCell>
                  )}
                  {!isTablet && (
                    <TableCell>
                      <Skeleton animation="wave" variant="text" width="50%" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Skeleton animation="wave" variant="circular" width={24} height={24} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading &&
              usuariosPaginados.map((usuario) => (
                <TableRow key={usuario.id} hover>
                  <TableCell>{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={usuario.role}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        color:
                          String(usuario.role).toUpperCase() === "SUPERADMIN"
                            ? "#0b1020"
                            : "#ffffff",
                        bgcolor:
                          String(usuario.role).toUpperCase() === "SUPERADMIN"
                            ? "#FBBA41"
                            : alpha(theme.palette.primary.main, 0.25),
                        border:
                          String(usuario.role).toUpperCase() === "SUPERADMIN"
                            ? "1px solid #FBBA41"
                            : `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
                      }}
                    />
                  </TableCell>
                  {!isTablet && <TableCell>{usuario.celular}</TableCell>}
                  {!isTablet && <TableCell>{formatCreatedAt(usuario.createdAt)}</TableCell>}
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      sx={{ color: "text.secondary" }}
                      onClick={(event) => handleOpenMenu(event, usuario)}
                      aria-controls={isMenuOpen ? "usuario-actions-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen ? "true" : undefined}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

            {!loading && usuariosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={isTablet ? 4 : 6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum usuário encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      <Menu
        elevation={0}
        id="usuario-actions-menu"
        anchorEl={menuAnchor}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.secondary.light,
            color: "#fff",
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <MenuItem onClick={handleEditUsuario}>
          <EditOutlined fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          disabled={
            deleting || String(menuUsuario?.role).toUpperCase() === "SUPERADMIN"
          }
          onClick={handleDeleteUsuario}
          sx={{ color: "error.main" }}
        >
          <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
          {deleting
            ? "Excluindo..."
            : String(menuUsuario?.role).toUpperCase() === "SUPERADMIN"
            ? "Superadmin não pode ser excluído"
            : "Excluir"}
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.secondary.light,
            color: "#fff",
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir usuário</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Tem certeza que deseja excluir <strong>{usuarioToDelete?.nome || "este usuário"}</strong>? Essa ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting} variant="outlined" sx={{ color: "#fff" }}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDeleteUsuario} disabled={deleting} color="error" variant="contained">
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {!loading && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: 2,
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                color: "#ffffff",
              },
              "& .Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              },
              "& .MuiPaginationItem-root:hover": {
                backgroundColor: alpha(theme.palette.primary.dark, 0.3),
              },
              "& .MuiPaginationItem-ellipsis": {
                border: "none",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default UsersListTable;
