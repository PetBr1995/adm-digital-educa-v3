import { Alert, Box, CircularProgress, Divider, Typography } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Check } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import theme from "../theme/theme";
import api from "../api/axiosInstance";
import CadastrarUsuarioForm from "../components/users/CadastrarUsuario";

const extractPeriodo = (obj) => {
  if (!obj || typeof obj !== "object") return { dataInicio: "", dataFim: "" };

  const getStart = (item) =>
    item?.dataInicio ??
    item?.inicio ??
    item?.startDate ??
    item?.startsAt ??
    item?.data_inicio ??
    item?.inicio_assinatura ??
    item?.dataInicioAssinatura ??
    item?.vigenciaInicio ??
    "";

  const getEnd = (item) =>
    item?.dataFim ??
    item?.fim ??
    item?.endDate ??
    item?.endsAt ??
    item?.data_fim ??
    item?.fim_assinatura ??
    item?.dataFimAssinatura ??
    item?.vigenciaFim ??
    "";

  const directStart = getStart(obj);
  const directEnd = getEnd(obj);
  if (directStart || directEnd) {
    return { dataInicio: directStart || "", dataFim: directEnd || "" };
  }

  const candidates = [
    obj?.assinatura,
    obj?.assinaturas,
    obj?.subscription,
    obj?.subscriptions,
    obj?.periodo,
    obj?.periodos,
    obj?.plano,
    obj?.planos,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const s = getStart(item);
        const e = getEnd(item);
        if (s || e) return { dataInicio: s || "", dataFim: e || "" };
      }
      continue;
    }
    const s = getStart(candidate);
    const e = getEnd(candidate);
    if (s || e) return { dataInicio: s || "", dataFim: e || "" };
  }

  return { dataInicio: "", dataFim: "" };
};

const normalizeUsuario = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const data = raw?.data?.usuario ?? raw?.data?.user ?? raw?.usuario ?? raw?.user ?? raw?.data ?? raw;
  if (!data || typeof data !== "object") return null;
  const periodo = extractPeriodo(data);

  return {
    id: String(data?.id ?? data?._id ?? ""),
    nome: String(data?.nome ?? data?.name ?? ""),
    email: String(data?.email ?? ""),
    role: String(data?.role ?? data?.perfil ?? "USER"),
    celular: String(data?.celular ?? data?.telefone ?? data?.phone ?? ""),
    dataInicio: periodo.dataInicio,
    dataFim: periodo.dataFim,
  };
};

const EditarUsuario = () => {
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [usuario, setUsuario] = useState(location.state?.usuario || null);

  useEffect(() => {
    if (!id) {
      setLoadError("ID do usuário inválido.");
      setLoading(false);
      return;
    }

    const stateUsuario = normalizeUsuario(location.state?.usuario);
    if (stateUsuario) {
      console.log("[EditarUsuario] usuário carregado via state:", stateUsuario);
      setUsuario(stateUsuario);
      setLoading(false);
    }

    let mounted = true;

    const carregarUsuario = async () => {
      const authHeader = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      let resolved = null;

      try {
        console.log("[EditarUsuario] buscando usuário via lista /usuario/admin/usuarios. id:", id);
        const response = await api.get("/usuario/admin/usuarios", {
          headers: authHeader,
          params: { page: 1, limit: 1000 },
        });

        const list =
          response?.data?.data?.usuarios ??
          response?.data?.data?.users ??
          response?.data?.usuarios ??
          response?.data?.users ??
          response?.data?.data ??
          response?.data;

        const usuarios = Array.isArray(list) ? list : [];
        const found =
          usuarios.find((item) => String(item?.id ?? item?._id ?? "") === String(id)) || null;
        console.log("[EditarUsuario] item bruto encontrado na lista:", found);
        resolved = normalizeUsuario(found);
        console.log("[EditarUsuario] usuário encontrado via lista:", resolved);

        if (!mounted) return;

        if (resolved) {
          setUsuario(resolved);
          setLoadError("");
        } else if (!stateUsuario) {
          setLoadError("Não foi possível carregar os dados do usuário.");
        }
      } catch (error) {
        console.log("[EditarUsuario] erro ao carregar usuário:", error?.response?.data || error);
        if (mounted && !stateUsuario) setLoadError("Não foi possível carregar os dados do usuário.");
      } finally {
        if (mounted && !stateUsuario) setLoading(false);
      }
    };

    carregarUsuario();

    return () => {
      mounted = false;
    };
  }, [id, location.state]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "6px",
        bgcolor: theme.palette.secondary.light,
        maxWidth: "900px",
        mx: "auto",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Editar usuário
        </Typography>
        <Box sx={{ p: 2, width: "210px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ListAltIcon sx={{ bgcolor: "#F3A005", borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
          <Box sx={{ position: "relative", "&::after": { content: "''", position: "absolute", width: "85px", height: "5px", borderRadius: "4px", top: -2, left: -42, bgcolor: theme.palette.secondary.dark } }} />
          <Check sx={{ bgcolor: theme.palette.secondary.dark, borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <CadastrarUsuarioForm mode="edit" userId={id} initialData={usuario} />
      </Box>
    </Box>
  );
};

export default EditarUsuario;
