// src/pages/Conteudos.jsx
import {
  AddRounded,
  DeleteOutline,
  EditOutlined,
  StarBorder,
  TimerOutlined,
} from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import theme from "../theme/theme";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Skeleton,
  Snackbar,
  Typography,
  alpha,
  useMediaQuery,
} from "@mui/material";
import SearchBarComponent from "../components/contentComponents/SearchBarComponente";
import api from "../api/axiosInstance";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Conteudos = () => {
  const [allConteudos, setAllConteudos] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const skeletonCount = isLg ? 8 : isMd ? 4 : isSm ? 4 : 3;

  const [search, setSearch] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuConteudo, setMenuConteudo] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conteudoToDelete, setConteudoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const totalGeral = allConteudos.length;
  const navigate = useNavigate();

  const listAllContent = () => {
    setLoading(true);
    api
      .get("/conteudos", {
        params: {
          page: 1,
          limit: 1000,
        },
      })
      .then((response) => {
        const data = response.data?.data || [];
        setAllConteudos(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    listAllContent();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "0 min";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}min`;
    return `${mins} min`;
  };

  const filteredConteudos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allConteudos;

    return allConteudos.filter((c) => {
      const titulo = (c.titulo || "").toLowerCase();
      const descricao = (c.descricao || "").toLowerCase();
      const tipo = (c.tipo || "").toLowerCase();
      const level = (c.level || "").toLowerCase();

      const instrutores = (c.instrutores || [])
        .map((i) => i?.instrutor?.nome || "")
        .join(", ")
        .toLowerCase();

      return (
        titulo.includes(term) ||
        descricao.includes(term) ||
        instrutores.includes(term) ||
        tipo.includes(term) ||
        level.includes(term)
      );
    });
  }, [search, allConteudos]);

  const totalFiltrado = filteredConteudos.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltrado / limit));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const conteudosPaginados = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredConteudos.slice(start, start + limit);
  }, [filteredConteudos, page, limit]);

  const isMenuOpen = Boolean(menuAnchor);

  const handleOpenMenu = (event, conteudo) => {
    setMenuAnchor(event.currentTarget);
    setMenuConteudo(conteudo);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuConteudo(null);
  };

  const handleEditConteudo = () => {
    if (!menuConteudo) return;
    const conteudoId = menuConteudo.id ?? menuConteudo._id;
    if (!conteudoId) {
      console.error("ID do conteúdo não encontrado para edição:", menuConteudo);
      handleCloseMenu();
      return;
    }
    navigate(`/conteudos/editar/${conteudoId}`, { state: { conteudo: menuConteudo } });
    handleCloseMenu();
  };

  const handleOpenDeleteDialog = () => {
    if (!menuConteudo) return;
    const conteudoId = menuConteudo.id ?? menuConteudo._id;
    if (!conteudoId) {
      console.error("ID do conteúdo não encontrado para exclusão:", menuConteudo);
      handleCloseMenu();
      return;
    }

    setConteudoToDelete(menuConteudo);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setConteudoToDelete(null);
  };

  const handleDeleteConteudo = async () => {
    if (!conteudoToDelete) return;
    const conteudoId = conteudoToDelete.id ?? conteudoToDelete._id;
    if (!conteudoId) return;

    try {
      setDeleting(true);
      await api.delete(`/conteudos/${conteudoId}`);
      setAllConteudos((prev) =>
        prev.filter((c) => String(c.id ?? c._id) !== String(conteudoId))
      );
      setSnackbar({
        open: true,
        message: "Conteúdo deletado com sucesso.",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao deletar conteúdo:", error?.response?.data || error);
      setSnackbar({
        open: true,
        message: "Não foi possível deletar o conteúdo.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setConteudoToDelete(null);
    }
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: theme.palette.secondary.light,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "6px",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "grid",
            gap: 2,
            alignItems: "center",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 320px auto",
            },
          }}
        >
          <Box>
            {loading ? (
              <>
                <Skeleton animation="wave" variant="text" width={220} height={26} />
                <Skeleton animation="wave" variant="text" width={140} height={20} />
              </>
            ) : (
              <>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, md: 18 } }}>
                  Conteúdos - ({totalFiltrado}) resultados
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: { xs: 13, md: 14 } }}>
                  Total no sistema: {totalGeral}
                </Typography>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Box sx={{ width: "100%", maxWidth: 360 }}>
              <SearchBarComponent
                placeholder="Buscar conteúdos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </Box>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddRounded />}
              sx={{
                fontWeight: 700,
                textTransform: "capitalize",
                width: { xs: "100%", md: "auto" },
              }}
              onClick={() => navigate("/cadastrarconteudo")}
            >
              Novo Conteúdo
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {loading &&
            Array.from({ length: skeletonCount }).map((_, idx) => (
              <Box
                key={`sk-${idx}`}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "6px",
                  overflow: "hidden",
                  p: 2,
                  display: "grid",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Skeleton animation="wave" variant="circular" width={34} height={34} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton animation="wave" variant="text" width="60%" />
                    <Skeleton animation="wave" variant="text" width="40%" />
                  </Box>
                </Box>
                <Skeleton animation="wave" variant="rectangular" height={140} />
                <Skeleton animation="wave" variant="text" width="80%" />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Skeleton animation="wave" variant="rounded" width={60} height={22} />
                  <Skeleton animation="wave" variant="rounded" width={60} height={22} />
                  <Skeleton animation="wave" variant="rounded" width={80} height={22} />
                </Box>
              </Box>
            ))}

          {!loading &&
            conteudosPaginados.map((conteudo) => {
              const instrutorNomes =
                conteudo.instrutores?.length > 0
                  ? conteudo.instrutores.map((i) => i?.instrutor?.nome).filter(Boolean)
                  : [];

              const instrutores =
                instrutorNomes.length > 0
                  ? instrutorNomes.join(", ")
                  : "Instrutor não informado";

              const instrutorInicial =
                instrutorNomes.length > 0
                  ? instrutorNomes[0].trim().charAt(0).toUpperCase()
                  : "?";

              return (
                <Box
                  key={conteudo.id ?? conteudo._id}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      width: "100%",
                      mt: 2,
                      px: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                      <IconButton
                        disableRipple
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          bgcolor: "error.main",
                          color: "common.white",
                          fontWeight: 700,
                          fontSize: 13,
                          "&:hover": { bgcolor: "error.main" },
                        }}
                      >
                        {instrutorInicial}
                      </IconButton>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.primary",
                            lineHeight: 1.2,
                            fontWeight: 600,
                            mb: "3px",
                          }}
                          noWrap
                        >
                          {instrutores}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            lineHeight: 1.2,
                          }}
                          noWrap
                        >
                          {formatDate(conteudo.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(event) => handleOpenMenu(event, conteudo)}
                      aria-controls={isMenuOpen ? "conteudo-actions-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen ? "true" : undefined}
                      sx={{
                        color: "text.secondary",
                        "&:hover": { bgcolor: alpha(theme.palette.secondary.dark, 0.08) },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      width: "100%",
                      aspectRatio: "16 / 9",
                      overflow: "hidden",
                      bgcolor: alpha(theme.palette.secondary.dark, 0.15),
                    }}
                  >
                    <Box
                      component="img"
                      src={"https://api.digitaleduca.com.vc/public/" + conteudo.thumbnailDesktop}
                      alt={conteudo.titulo}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: "14px" }}>{conteudo.titulo}</Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 2,
                      pb: 2,
                      display: "flex",
                      justifyContent: "start",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        bgcolor: "#EDF4FB",
                        border: "1px solid #1976D2",
                        color: "#1976D2",
                        fontWeight: 600,
                        width: "fit-content",
                        px: 1,
                        borderRadius: "10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conteudo.tipo}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "12px",
                        bgcolor: "#FFEECF",
                        border: "1px solid #F3A005",
                        color: "#F3A005",
                        fontWeight: 600,
                        width: "fit-content",
                        px: 1,
                        borderRadius: "10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conteudo.level}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F3A005",
                        fontWeight: 700,
                        gap: 0.25,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <StarBorder sx={{ fontSize: 18, color: "#F3A005" }} />
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#F3A005", pt: "1px" }}>
                        {conteudo.rating}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                        color: "#F3A005",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <TimerOutlined sx={{ fontSize: 18, color: "#F3A005" }} />
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#ffffff",
                          lineHeight: 1,
                        }}
                      >
                        {formatDuration(conteudo.duracao)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
        </Box>

        <Menu
          elevation={0}
          id="conteudo-actions-menu"
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
          <MenuItem onClick={handleEditConteudo}>
            <EditOutlined fontSize="small" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem disabled={deleting} onClick={handleOpenDeleteDialog} sx={{ color: "error.main" }}>
            <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
            Apagar
          </MenuItem>
        </Menu>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              bgcolor: theme.palette.secondary.dark,
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Excluir conteúdo</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "text.secondary" }}>
              Tem certeza que deseja excluir <strong>{conteudoToDelete?.titulo || "este conteúdo"}</strong>? Essa ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDeleteDialog} disabled={deleting} variant="outlined" sx={{ color: "#fff" }}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteConteudo} disabled={deleting} color="error" variant="contained">
              {deleting ? "Apagando..." : "Excluir"}
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
    </>
  );
};

export default Conteudos;
