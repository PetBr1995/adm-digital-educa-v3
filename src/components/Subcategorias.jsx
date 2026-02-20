import { useEffect, useState } from "react"
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Snackbar, TextField, Typography } from "@mui/material"
import { Delete } from "@mui/icons-material"
import api from "../api/axiosInstance"
import theme from "../theme/theme"

const Subcategorias = () => {
    const [subcategorias, setSubcategorias] = useState([])
    const [categorias, setCategorias] = useState([])
    const [nome, setNome] = useState("")
    const [categoriaId, setCategoriaId] = useState("")
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [subcategoriaToDelete, setSubcategoriaToDelete] = useState(null)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    })

    const listarSubcategorias = () => {
        api.get("/subcategorias/list", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setSubcategorias(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    const listarCategorias = () => {
        api.get("/categorias/list", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setCategorias(response.data || [])
        }).catch(function (error) {
            console.log(error)
        })
    }

    const cadastrarSubcategoria = (event) => {
        event.preventDefault()
        const nomeLimpo = nome.trim()

        if (!nomeLimpo || !categoriaId) return
        setLoading(true)

        api.post("/subcategorias/create", {
            nome: nomeLimpo,
            categoriaId: String(categoriaId)
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setNome("")
            setCategoriaId("")
            listarSubcategorias()
            setSnackbar({
                open: true,
                message: response?.data?.message || "Subcategoria cadastrada com sucesso!",
                severity: "success",
            })
        }).catch(function (error) {
            console.log(error)
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Não foi possível cadastrar a subcategoria.",
                severity: "error",
            })
        }).finally(function () {
            setLoading(false)
        })
    }

    const handleOpenDeleteConfirm = (subcategoria) => {
        setSubcategoriaToDelete(subcategoria)
    }

    const handleCloseDeleteConfirm = () => {
        if (deleting) return
        setSubcategoriaToDelete(null)
    }

    const deletarSubcategoria = () => {
        const id = subcategoriaToDelete?.id ?? subcategoriaToDelete?._id
        if (!id) {
            setSnackbar({
                open: true,
                message: "ID da subcategoria não encontrado.",
                severity: "error",
            })
            return
        }

        setDeleting(true)
        api.delete(`/subcategorias/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setSubcategorias((prev) =>
                prev.filter((subcategoria) => String(subcategoria.id ?? subcategoria._id) !== String(id))
            )
            setSnackbar({
                open: true,
                message: response?.data?.message || "Subcategoria excluída com sucesso!",
                severity: "success",
            })
            setSubcategoriaToDelete(null)
        }).catch(function (error) {
            console.log(error)
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Não foi possível excluir a subcategoria.",
                severity: "error",
            })
        }).finally(function () {
            setDeleting(false)
        })
    }

    useEffect(() => {
        listarSubcategorias()
        listarCategorias()
    }, [])

    return(
        <>
            <Box sx={{ maxWidth: "1200px", mt: 2, m: "auto", px: { xs: 1, sm: 0 }, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.secondary.light, borderRadius: "6px" }}>
                <Box sx={{ p: 0 }}>
                    <Box>
                        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 2 }}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6">Subcategorias - ({subcategorias.length}) subcategorias cadastradas</Typography>
                                <Typography variant="body2">Gerencie todas as Subcategorias</Typography>
                            </Box>
                        </Box>
                        <Box
                            component="form"
                            onSubmit={cadastrarSubcategoria}
                            sx={{ px: 2, pb: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
                        >
                            <TextField
                                label="Nome da subcategoria"
                                placeholder="Digite o nome..."
                                value={nome}
                                onChange={(event) => setNome(event.target.value)}
                                size="small"
                                sx={{ minWidth: { xs: "100%", sm: 280 }, flex: 1 }}
                                required
                            />
                            <TextField
                                select
                                label="Categoria"
                                value={categoriaId}
                                onChange={(event) => setCategoriaId(event.target.value)}
                                size="small"
                                sx={{ minWidth: { xs: "100%", sm: 260 } }}
                                required
                            >
                                <MenuItem value="">Selecione uma categoria...</MenuItem>
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.id || categoria._id || categoria.nome} value={categoria.id || categoria._id}>
                                        {categoria.nome}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ fontWeight: "bold", textTransform: "capitalize", width: { xs: "100%", sm: "auto" } }}
                                disabled={loading || !nome.trim() || !categoriaId}
                            >
                                {loading ? "Salvando..." : "Cadastrar"}
                            </Button>
                        </Box>
                        <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 2 }}>
                            {subcategorias.map((subcategoria) => (
                                <Box
                                    key={subcategoria.id || subcategoria._id || subcategoria.nome}
                                    sx={{ bgcolor: theme.palette.secondary.light, position: "relative", border: `1px solid ${theme.palette.divider}`, px: 2, py: 1, borderRadius: "6px" }}
                                >
                                    <Typography sx={{ position: "relative" }}>{subcategoria.nome}</Typography>
                                    <IconButton
                                        onClick={() => handleOpenDeleteConfirm(subcategoria)}
                                        sx={{ '&:hover': { bgcolor: theme.palette.primary.dark }, bgcolor: theme.palette.primary.light, position: "absolute", width: "25px", height: "25px", top: 8, right: 5, border: `1px solid ${theme.palette.divider}` }}
                                    >
                                        <Delete
                                            sx={{
                                                '&:hover': {
                                                    color: "white",
                                                },
                                                width: "20px",
                                                height: "20px",
                                                color: theme.palette.secondary.dark
                                            }}
                                        />
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
                open={Boolean(subcategoriaToDelete)}
                onClose={handleCloseDeleteConfirm}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Tem certeza que deseja excluir a subcategoria <strong>{subcategoriaToDelete?.nome || "selecionada"}</strong>?
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
                        onClick={deletarSubcategoria}
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

export default Subcategorias
