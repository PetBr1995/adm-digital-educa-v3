import {
    Box,
    Button,
    TableContainer,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Skeleton,
    useMediaQuery,
    Pagination,
    IconButton,
    alpha
  } from "@mui/material";
  import { Add, MoreVert } from "@mui/icons-material";
  import { useEffect, useMemo, useState } from "react";
  
  import theme from "../theme/theme";
  import api from "../api/axiosInstance";
  import SearchBarComponent from "../components/contentComponents/SearchBarComponente"; // ✅ igual no Conteudos
  
  const Instrutores = () => {
    const [allInstrutores, setAllInstrutores] = useState([]); // lista completa
    const [loading, setLoading] = useState(true);
  
    // search no front
    const [search, setSearch] = useState("");

    // (opcional) se quiser paginação depois
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
  
    const listarInstrutores = () => {
      setLoading(true);
      api
        .get("/instrutor", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          setAllInstrutores(response.data || []);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => setLoading(false));
    };
  
    useEffect(() => {
      listarInstrutores();
    }, []);
  
    // ✅ filtro no front (igual ao Conteudos)
    const instrutoresFiltrados = useMemo(() => {
      const term = search.trim().toLowerCase();
      if (!term) return allInstrutores;
  
      return allInstrutores.filter((i) => {
        const nome = (i.nome || "").toLowerCase();
        const email = (i.email || "").toLowerCase();
        return nome.includes(term) || email.includes(term);
      });
    }, [search, allInstrutores]);
  
    const totalGeral = allInstrutores.length;
    const totalFiltrado = instrutoresFiltrados.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltrado / limit));

    useEffect(() => {
      if (page > totalPages) setPage(1);
    }, [page, totalPages]);

    const instrutoresPaginados = useMemo(() => {
      const start = (page - 1) * limit;
      return instrutoresFiltrados.slice(start, start + limit);
    }, [instrutoresFiltrados, page, limit]);
  
    const isLg = useMediaQuery(theme.breakpoints.up("lg"));
    const isMd = useMediaQuery(theme.breakpoints.up("md"));
    const isSm = useMediaQuery(theme.breakpoints.up("sm"));
    const skeletonCount = isLg ? 8 : isMd ? 6 : isSm ? 5 : 4;
  
    return (
      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        {/* HEADER (mesmo grid do Conteudos) */}
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
          {/* Título */}
          <Box>
            {loading ? (
              <>
                <Skeleton animation="wave" variant="text" width={220} height={26} />
                <Skeleton animation="wave" variant="text" width={160} height={20} />
              </>
            ) : (
              <>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, md: 18 } }}>
                  Instrutores — ({totalFiltrado}) resultados
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: { xs: 13, md: 14 } }}>
                  Total no sistema: {totalGeral}
                </Typography>
              </>
            )}
          </Box>
  
          {/* Search (igual no Conteudos) */}
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Box sx={{ width: "100%", maxWidth: 360 }}>
              <SearchBarComponent
                placeholder="Buscar instrutores..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </Box>
          </Box>
  
          {/* Botão */}
          <Box sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              sx={{
                fontWeight: 700,
                textTransform: "capitalize",
                width: { xs: "100%", md: "auto" },
              }}
            >
              Novo Instrutor
            </Button>
          </Box>
        </Box>
  
        {/* TABELA */}
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.secondary.light }}>
              <TableRow>
                <TableCell>Nome</TableCell>
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
                Array.from({ length: skeletonCount }).map((_, idx) => (
                  <TableRow key={`sk-${idx}`}>
                    <TableCell>
                      <Skeleton animation="wave" variant="text" width="70%" />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton animation="wave" variant="circular" width={24} height={24} />
                    </TableCell>
                  </TableRow>
                ))}
  
              {!loading &&
                instrutoresPaginados.map((instrutor) => (
                  <TableRow key={instrutor.id ?? instrutor.email} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            bgcolor: "error.main",
                            color: "common.white",
                            flexShrink: 0,
                          }}
                        >
                          {(instrutor.nome || "?").trim().charAt(0).toUpperCase()}
                        </Typography>
                        {instrutor.nome}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" sx={{ color: "text.secondary" }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
  
              {!loading && instrutoresFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum instrutor encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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
  
  export default Instrutores;
  
