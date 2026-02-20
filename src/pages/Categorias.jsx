import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, TextField, Typography } from "@mui/material"
import theme from "../theme/theme"
import api
    from "../api/axiosInstance"
import { useEffect, useState } from "react"
import Subcategorias from "../components/Subcategorias"
import { Delete } from "@mui/icons-material";
const Categorias = () => {

    const [categorias, setCategorias] = useState([])
    const [nome, setNome] = useState("")
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [categoriaToDelete, setCategoriaToDelete] = useState(null)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    })

    const listarCategorias = () => {
        api.get("/categorias/list", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setCategorias(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    const cadastrarCategoria = (event) => {
        event.preventDefault()
        const nomeLimpo = nome.trim()

        if (!nomeLimpo) return
        setLoading(true)

        api.post("/categorias/create", {
            nome: nomeLimpo
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setNome("")
            listarCategorias()
            setSnackbar({
                open: true,
                message: response?.data?.message || "Categoria cadastrada com sucesso!",
                severity: "success",
            })
        }).catch(function (error) {
            console.log(error)
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Não foi possível cadastrar a categoria.",
                severity: "error",
            })
        }).finally(function () {
            setLoading(false)
        })
    }

    const handleOpenDeleteConfirm = (categoria) => {
        setCategoriaToDelete(categoria)
    }

    const handleCloseDeleteConfirm = () => {
        if (deleting) return
        setCategoriaToDelete(null)
    }

    const deletarCategoria = () => {
        const id = categoriaToDelete?.id ?? categoriaToDelete?._id
        if (!id) {
            setSnackbar({
                open: true,
                message: "ID da categoria não encontrado.",
                severity: "error",
            })
            return
        }

        setDeleting(true)
        api.delete(`/categorias/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setCategorias((prev) =>
                prev.filter((categoria) => String(categoria.id ?? categoria._id) !== String(id))
            )
            setSnackbar({
                open: true,
                message: response?.data?.message || "Categoria excluída com sucesso!",
                severity: "success",
            })
            setCategoriaToDelete(null)
        }).catch(function (error) {
            console.log(error)
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Não foi possível excluir a categoria.",
                severity: "error",
            })
        }).finally(function () {
            setDeleting(false)
        })
    }

    useEffect(() => {
        listarCategorias();
    }, [])

    return (
        <>
            <Box sx={{ maxWidth: "1200px", m: "auto", px: { xs: 1, sm: 0 }, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.secondary.light, borderRadius: "6px" }}>
                <Box sx={{ p: 0 }}>
                    <Box>
                        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 2 }}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6">Categorias - ({categorias.length}) categorias cadastrados</Typography>
                                <Typography variant="body2">Gerencie todas as Categorias</Typography>
                            </Box>
                        </Box>
                        <Box
                            component="form"
                            onSubmit={cadastrarCategoria}
                            sx={{ px: 2, pb: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
                        >
                            <TextField
                                label="Nome da categoria"
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
                            {categorias.map((categoria) => (
                                <Box key={categoria.id || categoria._id || categoria.nome} sx={{ bgcolor: theme.palette.secondary.light, position: "relative", border: `1px solid ${theme.palette.divider}`, px: 2, py: 1, borderRadius: "6px" }}>
                                    <Typography sx={{ position: "relative" }}>{categoria.nome}</Typography>
                                    <IconButton
                                        onClick={() => handleOpenDeleteConfirm(categoria)}
                                        sx={{ '&:hover':{bgcolor:theme.palette.primary.dark},bgcolor: theme.palette.primary.light, position: "absolute", width: "25px", height: "25px", top: 8, right: 5, border: `1px solid ${theme.palette.divider}` }}
                                    >
                                        <Delete sx={{
                                            '&:hover': {
                                                color: 'white',
                                            }, width: "20px", height: "20px", color: theme.palette.secondary.dark
                                        }} />
                                    </IconButton>
                                </Box>
                            ))}
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
                open={Boolean(categoriaToDelete)}
                onClose={handleCloseDeleteConfirm}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Tem certeza que deseja excluir a categoria <strong>{categoriaToDelete?.nome || "selecionada"}</strong>?
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
                        onClick={deletarCategoria}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        sx={{ textTransform: "capitalize" }}
                    >
                        {deleting ? "Excluindo..." : "Excluir"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Box sx={{ mt: 2 }}>
                <Subcategorias />
            </Box>
        </>
    )
}

export default Categorias
