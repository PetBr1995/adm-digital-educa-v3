import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Check } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import theme from "../theme/theme";
import api from "../api/axiosInstance";
import FormCadastroInstrutor from "../components/FormCadastroInstrutor";

const EditarInstrutor = () => {
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [instrutor, setInstrutor] = useState(location.state?.instrutor || null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    if (location.state?.instrutor) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const carregarInstrutor = async () => {
      try {
        const response = await api.get("/instrutor", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const lista = Array.isArray(response.data) ? response.data : [];
        const encontrado =
          lista.find((item) => String(item.id ?? item._id) === String(id)) || null;

        if (mounted) setInstrutor(encontrado);
      } catch (error) {
        console.log(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregarInstrutor();

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
          Editar instrutor
        </Typography>
        <Box sx={{ p: 2, width: "210px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ListAltIcon sx={{ bgcolor: "#F3A005", borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
          <Box sx={{ position: "relative", "&::after": { content: "''", position: "absolute", width: "85px", height: "5px", borderRadius: "4px", top: -2, left: -42, bgcolor: theme.palette.secondary.dark } }} />
          <Check sx={{ bgcolor: theme.palette.secondary.dark, borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
        </Box>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <FormCadastroInstrutor mode="edit" instrutorId={id} initialData={instrutor} />
      </Box>
    </Box>
  );
};

export default EditarInstrutor;
