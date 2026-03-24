import { Box, Button, Dialog, DialogContent, Fade, IconButton, InputAdornment, MenuItem, TextField, Typography, alpha } from "@mui/material";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../../assets/success-tick.json";
import api from "../../api/axiosInstance";
import AppSnackbar from "../feedback/AppSnackbar";
import { getApiErrorMessage } from "../../lib/apiError";
import theme from "../../theme/theme";

const toDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const CadastrarUsuario = ({ onSuccess, mode = "create", userId = null, initialData = null }) => {
    const navigate = useNavigate();
    const isEditMode = mode === "edit";
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [errorAlert, setErrorAlert] = useState({
        open: false,
        message: "",
    });

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        celular: "",
        role: "USER",
        dataInicio: "",
        dataFim: "",
    });

  const successTitle = useMemo(
    () => (isEditMode ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!"),
    [isEditMode]
  );

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

  useEffect(() => {
    if (!initialData) return;

    setFormData((prev) => ({
      ...prev,
      nome: String(initialData?.nome ?? initialData?.name ?? ""),
      email: String(initialData?.email ?? ""),
      senha: "",
      celular: formatPhone(initialData?.celular ?? initialData?.telefone ?? initialData?.phone ?? ""),
      role: String(initialData?.role ?? initialData?.perfil ?? "USER").toUpperCase(),
      dataInicio: toDateTimeLocal(initialData?.dataInicio ?? initialData?.inicio ?? initialData?.startDate),
      dataFim: toDateTimeLocal(initialData?.dataFim ?? initialData?.fim ?? initialData?.endDate),
    }));
  }, [initialData]);

    const handlePhoneChange = (event) => {
    const masked = formatPhone(event.target.value);
    setFormData((prev) => ({ ...prev, celular: masked }));
  };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const toIsoOrNull = (value) => {
        if (!value) return null;
        const dt = new Date(value);
        return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isEditMode && !userId) {
            setErrorAlert({
                open: true,
                message: "ID do usuário não informado para edição.",
            });
            return;
        }

        if (isEditMode && (formData.dataInicio || formData.dataFim) && (!formData.dataInicio || !formData.dataFim)) {
            setErrorAlert({
                open: true,
                message: "Para atualizar o período, preencha data de início e data de fim.",
            });
            return;
        }

        setLoading(true);

        try {
            const isoInicio = toIsoOrNull(formData.dataInicio);
            const isoFim = toIsoOrNull(formData.dataFim);
            const basePayload = {
                nome: formData.nome.trim(),
                email: formData.email.trim(),
                celular: formData.celular.replace(/\D/g, ""),
            };
            const payload = isEditMode
                ? { ...basePayload }
                : {
                      ...basePayload,
                      role: formData.role,
                      ...(isoInicio ? { dataInicio: isoInicio } : {}),
                      ...(isoFim ? { dataFim: isoFim } : {}),
                  };
            if (formData.senha) payload.senha = formData.senha;
            console.log(`[CadastrarUsuario] payload ${isEditMode ? "edição" : "cadastro"}:`, payload);

            if (isEditMode) {
                await api.put(`/usuario/admin/usuarios/${userId}`, payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (isoInicio && isoFim) {
                    const periodoPayload = { dataInicio: isoInicio, dataFim: isoFim };
                    console.log("[CadastrarUsuario] payload período assinatura:", periodoPayload);
                    await api.put(`/assinatura/admin/periodo/${userId}`, periodoPayload, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                }
            } else {
                await api.post("/usuario/admin/create", payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            }

            setSuccessDialogOpen(true);
            if (onSuccess) onSuccess();

            if (!isEditMode) {
                setFormData({
                    nome: "",
                    email: "",
                    senha: "",
                    celular: "",
                    role: "USER",
                    dataInicio: "",
                    dataFim: "",
                });
            }

            setTimeout(() => {
                navigate("/usuarios");
            }, 1300);
        } catch (error) {
            const apiError = error?.response?.data;
            const statusCode = error?.response?.status ?? apiError?.statusCode;
            const apiMessage = apiError?.message;
            let message = getApiErrorMessage(
                error,
                isEditMode ? "Não foi possível atualizar o usuário." : "Não foi possível cadastrar o usuário."
            );
            if (statusCode === 409) {
                message = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage || "Já existe um usuário cadastrado com esse celular!";
            }
            console.log(`Erro ao ${isEditMode ? "atualizar" : "cadastrar"} usuário:`, apiError || error);

            setErrorAlert({
                open: true,
                message,
            });
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
                        type={showPassword ? "text" : "password"}
                        placeholder={isEditMode ? "Nova senha (opcional)..." : "Senha..."}
                        value={formData.senha}
                        onChange={updateField("senha")}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                        disabled={loading}
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
                        required={!isEditMode}
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
                        disabled={isEditMode}
                        helperText={isEditMode ? "Role não pode ser alterada nesta tela no backend atual." : ""}
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
                            required={!isEditMode}
                        />
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Data de fim"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dataFim}
                            onChange={updateField("dataFim")}
                            required={!isEditMode}
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
                            {loading ? "Salvando..." : isEditMode ? "Salvar alterações" : "Salvar"}
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
                                {successTitle}
                            </Typography>
                        </Box>
                    </Fade>
                </DialogContent>
            </Dialog>

            <AppSnackbar
                open={errorAlert.open}
                message={errorAlert.message}
                severity="error"
                autoHideDuration={5000}
                onClose={() => setErrorAlert((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </>
    );
};

export default CadastrarUsuario;
