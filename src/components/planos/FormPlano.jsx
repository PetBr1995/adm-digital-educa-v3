import { Box, Button, Dialog, DialogContent, Fade, TextField, Typography, alpha } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../../assets/success-tick.json";
import api from "../../api/axiosInstance";
import theme from "../../theme/theme";

const FormPlano = ({
  mode = "create",
  planoId = null,
  initialData = null,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
  });

  useEffect(() => {
    setFormData({
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      preco:
        initialData?.preco !== undefined && initialData?.preco !== null
          ? String(initialData.preco)
          : "",
    });
  }, [initialData]);

  const updateField = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const parsePreco = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return NaN;

    // Aceita "1234.56", "1234,56" e "1.234,56"
    const hasComma = raw.includes(",");
    const hasDot = raw.includes(".");
    let normalized = raw.replace(/\s/g, "");

    if (hasComma && hasDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else if (hasComma) {
      normalized = normalized.replace(",", ".");
    }

    return Number(normalized);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const precoParsed = parsePreco(formData.preco);
      if (Number.isNaN(precoParsed)) {
        throw new Error("Preço inválido.");
      }

      const payload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco: precoParsed,
      };

      if (isEdit) {
        if (!planoId) throw new Error("ID do plano não informado.");
        await api.put(`/planos/update/${planoId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await api.post("/planos/create", payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      setSuccessDialogOpen(true);
      if (onSuccess) onSuccess();

      if (!isEdit) {
        setFormData({ nome: "", descricao: "", preco: "" });
      }

      setTimeout(() => {
        navigate("/planos");
      }, 1300);
    } catch (error) {
      console.log(
        `Erro ao ${isEdit ? "atualizar" : "cadastrar"} plano:`,
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            fullWidth
            label="Nome do plano"
            placeholder="Ex.: Plano Premium"
            value={formData.nome}
            onChange={updateField("nome")}
            required
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Descrição"
            placeholder="Descreva os benefícios do plano..."
            value={formData.descricao}
            onChange={updateField("descricao")}
            required
          />

          <TextField
            fullWidth
            type="text"
            inputMode="decimal"
            label="Preço (R$)"
            placeholder="Ex.: 49.90"
            value={formData.preco}
            onChange={updateField("preco")}
            helperText="Aceita formatos como 49.90 ou 49,90"
            required
          />
        </Box>

        <Box sx={{ p: 2, px: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
            <Button
              onClick={() => navigate("/planos")}
              variant="outlined"
              sx={{ textTransform: "capitalize", color: "#ffffff", border: `1px solid ${theme.palette.divider}` }}
            >
              Cancelar
            </Button>
            <Button
              disabled={loading}
              type="submit"
              variant="contained"
              sx={{ textTransform: "capitalize", color: "#ffffff", fontWeight: 600 }}
            >
              {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar"}
            </Button>
          </Box>
        </Box>
      </form>

      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: theme.palette.secondary.light,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Fade in={successDialogOpen} timeout={300}>
            <Box
              sx={{
                bgcolor: alpha("#020617", 1),
                minHeight: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
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
                {isEdit ? "Plano atualizado com sucesso!" : "Plano cadastrado com sucesso!"}
              </Typography>
            </Box>
          </Fade>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormPlano;
