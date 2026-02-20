import { Box, Button, Dialog, DialogContent, Fade, TextField, Typography, alpha } from "@mui/material"
import theme from "../theme/theme"
import api from "../api/axiosInstance"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Lottie from "lottie-react";
import successAnimation from "../assets/success-tick.json";

const FormCadastroInstrutor = ({
    mode = "create",
    instrutorId = null,
    initialData = null,
    onSuccess,
}) => {
    const isEdit = mode === "edit";

    const [nome, setNome] = useState(initialData?.nome || "");
    const [formacao, setFormacao] = useState(initialData?.formacao || "");
    const [sobre, setSobre] = useState(initialData?.sobre || "");
    const [loading, setLoading] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    useEffect(() => {
        setNome(initialData?.nome || "");
        setFormacao(initialData?.formacao || "");
        setSobre(initialData?.sobre || "");
    }, [initialData]);

    const salvarInstrutor = async () => {
        setLoading(true);
        try {
            const payload = {
                nome: nome,
                formacao: formacao,
                sobre: sobre
            };

            if (isEdit) {
                if (!instrutorId) {
                    throw new Error("ID do instrutor não informado.");
                }
                await api.put(`/instrutor/update/${instrutorId}`, payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
            } else {
                await api.post("/instrutor/create", payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
            }

            setSuccessDialogOpen(true);
            if (onSuccess) onSuccess();
            if (!isEdit) {
                setNome("");
                setFormacao("");
                setSobre("");
            } else {
                setTimeout(() => {
                    navigate("/instrutores");
                }, 1200);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await salvarInstrutor();
    }

    const navigate = useNavigate();

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <TextField fullWidth placeholder="Nome..." value={nome} onChange={(e) => setNome(e.target.value)} required />
                    <TextField fullWidth placeholder="Formação..." value={formacao} onChange={(e) => setFormacao(e.target.value)} required />
                    <TextField fullWidth placeholder="Sobre..." multiline rows={4} value={sobre} onChange={(e) => setSobre(e.target.value)} required />
                </Box>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                        <Button onClick={() => navigate("/instrutores")}  variant="outlined" sx={{ textTransform: "capitalize", color: "#ffffff", border: `1px solid ${theme.palette.divider} ` }}>Cancelar</Button>
                        <Button disabled={loading} type="submit" variant="contained" sx={{ textTransform: "capitalize", color: "#ffffff", fontWeight: 600 }}>
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
                                {isEdit
                                    ? "Instrutor atualizado com sucesso!"
                                    : "Instrutor cadastrado com sucesso!"}
                            </Typography>
                        </Box>
                    </Fade>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FormCadastroInstrutor
