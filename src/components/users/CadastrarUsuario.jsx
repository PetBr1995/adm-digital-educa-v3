import { Box, Button, Dialog, DialogContent, Fade, MenuItem, TextField, Typography, alpha } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../../assets/success-tick.json";
import api from "../../api/axiosInstance";
import theme from "../../theme/theme";

const CadastrarUsuario = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        celular: "",
        role: "USER",
        dataInicio: "",
        dataFim: "",
    });

  const updateField = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const formatPhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
    const ddd = digits.slice(0, 2);
    const nono = digits.slice(2, 3);
    const parte1 = digits.slice(3, 7);
    const parte2 = digits.slice(7, 11);

    if (digits.length <= 2) return digits.length ? `(${ddd}` : "";
    if (digits.length <= 3) return `(${ddd}) ${nono}`;
    if (digits.length <= 7) return `(${ddd}) ${nono} ${parte1}`;
    return `(${ddd}) ${nono} ${parte1}-${parte2}`;
  };

  const handlePhoneChange = (event) => {
    const masked = formatPhone(event.target.value);
    setFormData((prev) => ({ ...prev, celular: masked }));
  };

    const toIsoOrNull = (value) => {
        if (!value) return null;
        const dt = new Date(value);
        return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const payload = {
                nome: formData.nome.trim(),
                email: formData.email.trim(),
        senha: formData.senha,
        celular: formData.celular.replace(/\D/g, ""),
        role: formData.role,
        dataInicio: toIsoOrNull(formData.dataInicio),
        dataFim: toIsoOrNull(formData.dataFim),
            };

            await api.post("/usuario/admin/create", payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setSuccessDialogOpen(true);
            setFormData({
                nome: "",
                email: "",
                senha: "",
                celular: "",
                role: "USER",
                dataInicio: "",
                dataFim: "",
            });

            setTimeout(() => {
                navigate("/usuarios");
            }, 1300);
        } catch (error) {
            console.log("Erro ao cadastrar usuário:", error?.response?.data || error);
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
                        placeholder="Nome..."
                        value={formData.nome}
                        onChange={updateField("nome")}
                        required
                    />
                    <TextField
                        fullWidth
                        type="email"
                        placeholder="Email..."
                        value={formData.email}
                        onChange={updateField("email")}
                        required
                    />
                    <TextField
                        fullWidth
                        type="password"
                        placeholder="Senha..."
                        value={formData.senha}
                        onChange={updateField("senha")}
                        required
                    />
          <TextField
            fullWidth
            placeholder="Celular..."
            value={formData.celular}
            onChange={handlePhoneChange}
            inputProps={{ maxLength: 17 }}
            required
          />
                    <TextField
                        select
                        fullWidth
                        label="Role"
                        value={formData.role}
                        onChange={updateField("role")}
                        required
                    >
                        <MenuItem value="USER">USER</MenuItem>
                        <MenuItem value="CORTESIA">CORTESIA</MenuItem>
                    </TextField>
                    <Box sx={{gap:2 ,display:"grid", gridTemplateColumns:"repeat(2,1fr)"}}> 

                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Data de início"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dataInicio}
                            onChange={updateField("dataInicio")}
                            required
                        />
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Data de fim"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dataFim}
                            onChange={updateField("dataFim")}
                            required
                        />
                    </Box>
                </Box>

                <Box sx={{ p: 2, px: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                        <Button
                            onClick={() => navigate("/usuarios")}
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
                            {loading ? "Salvando..." : "Salvar"}
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
                                Usuário cadastrado com sucesso!
                            </Typography>
                        </Box>
                    </Fade>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CadastrarUsuario;
