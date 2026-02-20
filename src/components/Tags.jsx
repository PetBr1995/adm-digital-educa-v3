import { useEffect, useState } from "react"
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, TextField, Typography } from "@mui/material"
import { Delete } from "@mui/icons-material"
import api from "../api/axiosInstance"
import theme from "../theme/theme"

const Tags = () => {
    const [tags, setTags] = useState([])
    const [nome, setNome] = useState("")
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [tagToDelete, setTagToDelete] = useState(null)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    })

    const listarTags = () => {
        api.get("/tags", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setTags(response.data || [])
        }).catch(function (error) {
            console.log(error)
        })
    }

    const cadastrarTag = (event) => {
        event.preventDefault()
        const nomeLimpo = nome.trim()

        if (!nomeLimpo) return
        setLoading(true)

        api.post("/tags", {
            nome: nomeLimpo
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setNome("")
            listarTags()
            setSnackbar({
                open: true,
                message: response?.data?.message || "Tag cadastrada com sucesso!",
                severity: "success",
            })
        }).catch(function (error) {
            console.log(error)
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Não foi possível cadastrar a tag.",
                severity: "error",
            })
        }).finally(function () {
            setLoading(false)
        })
    }

    const handleOpenDeleteConfirm = (tag) => {
        setTagToDelete(tag)
    }

    const handleCloseDeleteConfirm = () => {
        if (deleting) return
        setTagToDelete(null)
    }

    const deletarTag = () => {
        const id = tagToDelete?.id ?? tagToDelete?._id
        if (!id) {
            setSnackbar({
                open: true,
                message: "ID da tag não encontrado.",
                severity: "error",
            })
            return
        }

        setDeleting(true)
        api.delete(`/tags/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setTags((prev) =>
                prev.filter((tag) => String(tag.id ?? tag._id) !== String(id))
            )
            setSnackbar({
                open: true,
                message: response?.data?.message || "Tag excluída com sucesso!",
                severity: "success",
            })
            setTagToDelete(null)
        }).catch(function (error) {
            console.log(error)
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Não foi possível excluir a tag.",
                severity: "error",
            })
        }).finally(function () {
            setDeleting(false)
        })
    }

    useEffect(() => {
        listarTags()
    }, [])

    const tagsExibidas = tags.filter((tag) => {
        const nomeTag = String(tag?.nome ?? "").trim()
        return nomeTag !== "" && !/^\d+$/.test(nomeTag)
    })

    return (
        <>
            <Box sx={{ maxWidth: "1200px", mt: 2, m: "auto", px: { xs: 1, sm: 0 }, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.secondary.light, borderRadius: "6px" }}>
                <Box sx={{ p: 0 }}>
                    <Box>
                        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 2 }}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6">Tags</Typography>
                                <Typography variant="body2">Gerencie todas as Tags</Typography>
                            </Box>
                        </Box>
                        <Box
                            component="form"
                            onSubmit={cadastrarTag}
                            sx={{ px: 2, pb: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
                        >
                            <TextField
                                label="Nome da tag"
                                placeholder="Digite o nome..."
                                value={nome}
                                onChange={(event) => setNome(event.target.value)}
                                size="small"
                                sx={{ minWidth: { xs: "100%", sm: 280 }, flex: 1 }}
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ fontWeight: "bold", textTransform: "capitalize", width: { xs: "100%", sm: "auto" } }}
                                disabled={loading || !nome.trim()}
                            >
                                {loading ? "Salvando..." : "Cadastrar"}
                            </Button>
                        </Box>
                        <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 2 }}>
                            {tagsExibidas.map((tag) => (
                                <Box
                                    key={tag.id || tag._id || tag.nome}
                                    sx={{ bgcolor: theme.palette.secondary.light, position: "relative", border: `1px solid ${theme.palette.divider}`, px: 2, py: 1, borderRadius: "6px" }}
                                >
                                    <Typography sx={{ position: "relative" }}>{tag.nome}</Typography>
                                    <IconButton
                                        onClick={() => handleOpenDeleteConfirm(tag)}
                                        sx={{ '&:hover': { bgcolor: theme.palette.primary.dark }, bgcolor: theme.palette.primary.light, position: "absolute", width: "25px", height: "25px", top: 8, right: 5, border: `1px solid ${theme.palette.divider}` }}
                                    >
                                        <Delete
                                            sx={{
                                                '&:hover': { color: "white" },
                                                width: "20px",
                                                height: "20px",
                                                color: theme.palette.secondary.dark
                                            }}
                                        />
                                    </IconButton>
                                </Box>
                            ))}
                            {tagsExibidas.length === 0 && (
                                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                    Nenhuma tag de texto encontrada.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog
                open={Boolean(tagToDelete)}
                onClose={handleCloseDeleteConfirm}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Tem certeza que deseja excluir a tag <strong>{tagToDelete?.nome || "selecionada"}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseDeleteConfirm}
                        variant="outlined"
                        disabled={deleting}
                        sx={{ textTransform: "capitalize" }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={deletarTag}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        sx={{ textTransform: "capitalize" }}
                    >
                        {deleting ? "Excluindo..." : "Excluir"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default Tags
