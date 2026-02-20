import { Box, Button, Skeleton, Typography } from "@mui/material"
import theme from "../theme/theme"
import { Add, Edit, MoreVert } from "@mui/icons-material"
import api from "../api/axiosInstance"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const Planos = () => {
    const [planos, setPlanos] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    const listarPlanos = () => {
        setLoading(true)
        api.get("/planos", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            setPlanos(response.data)
        }).catch(function (error) {
            console.log(error)
        }).finally(function () {
            setLoading(false)
        })
    }

    useEffect(() => {
        listarPlanos();
    }, [])

    return (
        <>
            <Box
                sx={{
                    bgcolor: theme.palette.secondary.light,
                    m: "auto",
                    width: "100%",
                    maxWidth: "1200px",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "6px",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 1.5,
                        flexWrap: "wrap",
                    }}
                >
                    <Box>
                        {loading ? (
                            <Skeleton animation="wave" variant="text" width={280} height={32} />
                        ) : (
                            <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                                Planos de Assinatura - {planos.length} planos cadastrados
                            </Typography>
                        )}
                        <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                            Gerencie todos os seus planos de assinatura de forma intuitiva
                        </Typography>
                    </Box>
                    <Button
                        onClick={() => navigate("/planos/cadastrar")}
                        variant="contained"
                        sx={{
                            textTransform: "capitalize",
                            color: theme.palette.secondary.dark,
                            fontWeight: "bold",
                            width: { xs: "100%", sm: "auto" },
                        }}
                        startIcon={<Add sx={{ border: 1, borderRadius: "100%" }} />}
                    >
                        Novo Plano
                    </Button>
                </Box>
                <Box
                    sx={{
                        p: { xs: 1.5, sm: 2 },
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            lg: "repeat(3, minmax(0, 1fr))",
                        },
                        gap: { xs: 1.5, sm: 2 },
                    }}
                >
                    {loading &&
                        Array.from({ length: 6 }).map((_, idx) => (
                            <Box
                                key={`plano-skeleton-${idx}`}
                                sx={{
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: "6px",
                                    bgcolor: theme.palette.secondary.dark,
                                    minWidth: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                                    <Skeleton animation="wave" variant="rectangular" width={75} height={24} />
                                    <Skeleton animation="wave" variant="rounded" width={110} height={24} />
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: theme.palette.primary.light,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: { xs: "flex-start", sm: "center" },
                                        gap: 1,
                                        flexDirection: { xs: "column", sm: "row" },
                                    }}
                                >
                                    <Skeleton animation="wave" variant="text" width={120} height={30} />
                                    <Skeleton animation="wave" variant="text" width={90} height={36} />
                                </Box>
                                <Box sx={{ p: 2, flexGrow: 1 }}>
                                    <Skeleton animation="wave" variant="text" width="100%" />
                                    <Skeleton animation="wave" variant="text" width="90%" />
                                    <Skeleton animation="wave" variant="text" width="65%" />
                                </Box>
                                <Box sx={{ p: 2, pt: 0 }}>
                                    <Skeleton animation="wave" variant="rounded" width="100%" height={36} />
                                </Box>
                            </Box>
                        ))}

                    {!loading && planos.map((plano) => (
                        <Box
                            key={plano.id || plano.nome}
                            sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: "6px",
                                bgcolor: theme.palette.secondary.dark,
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                                <Box>
                                    <img src="/logo-digital-educa.png" alt="logo" style={{ width: 75 }} />
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                            fontSize: "12px",
                                            color: "#1976D2",
                                            bgcolor: "#ffffff",
                                            borderRadius: "16px",
                                            px: "10px",
                                            border: `1px solid #1976D2`,
                                            maxWidth: { xs: 120, sm: 150 },
                                        }}
                                    >
                                        {plano.nome}
                                    </Typography>
                                    <MoreVert />
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: theme.palette.primary.light,
                                    display: "flex",
                                    color: theme.palette.secondary.dark,
                                    justifyContent: "space-between",
                                    alignItems: { xs: "flex-start", sm: "center" },
                                    gap: 1,
                                    flexDirection: { xs: "column", sm: "row" },
                                }}
                            >
                                <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                                    Começar agora
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: "1.35rem", sm: "1.55rem" } }}>
                                    R$ {plano.preco}
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography sx={{ p: 2 }} variant="body2">
                                    {plano.descricao}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, pt: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Button
                                    onClick={() =>
                                        navigate(`/planos/editar/${plano.id ?? plano._id}`, {
                                            state: { plano },
                                        })
                                    }
                                    startIcon={<Edit />}
                                    variant="contained"
                                    sx={{
                                        textTransform: "capitalize",
                                        color: theme.palette.secondary.dark,
                                        fontWeight: "bold",
                                        width: "100%"
                                    }}
                                >
                                    Editar
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    )
}
export default Planos
