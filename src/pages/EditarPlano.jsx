import { Alert, Box, CircularProgress, Divider, Typography } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Check } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import theme from "../theme/theme";
import api from "../api/axiosInstance";
import FormPlano from "../components/planos/FormPlano";

const EditarPlano = () => {
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [plano, setPlano] = useState(location.state?.plano || null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoadError("ID do plano inválido.");
      setLoading(false);
      return;
    }

    if (location.state?.plano) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const carregarPlano = async () => {
      try {
        const response = await api.get("/planos", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const lista = Array.isArray(response.data) ? response.data : [];
        const encontrado =
          lista.find((item) => String(item.id ?? item._id) === String(id)) || null;

        if (mounted) {
          setPlano(encontrado);
          if (!encontrado) setLoadError("Plano não encontrado.");
        }
      } catch (error) {
        if (mounted) {
          setLoadError("Não foi possível carregar os dados do plano.");
        }
        console.log(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregarPlano();

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
        bgcolor: theme.palette.secondary.light,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "6px",
        maxWidth: "900px",
        mx: "auto",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Editar plano
        </Typography>
        <Box sx={{ p: 2, width: "210px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ListAltIcon sx={{ bgcolor: "#F3A005", borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
          <Box sx={{ position: "relative", "&::after": { content: "''", position: "absolute", width: "85px", height: "5px", borderRadius: "4px", top: -2, left: -42, bgcolor: theme.palette.secondary.dark } }} />
          <Check sx={{ bgcolor: theme.palette.secondary.dark, borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
        </Box>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <FormPlano mode="edit" planoId={id} initialData={plano} />
      </Box>
    </Box>
  );
};

export default EditarPlano;
