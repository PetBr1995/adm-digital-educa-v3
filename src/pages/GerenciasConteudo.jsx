import { Box, Typography } from "@mui/material"
import theme from "../theme/theme"
import { BorderAllRounded } from "@mui/icons-material"

const GerenciarConteudo = () => {
    return (
        <>
            <Box sx={{ maxWidth: "1200px", m: "auto", bgcolor: theme.palette.secondary.light, border: `1px solid ${theme.palette.divider}`, borderRadius: "6px" }}>
                <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{p:2}}>
                        <Typography variant="h6">Gerenciar conteúdo</Typography>
                    </Box>
                </Box>
                <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ p: 2 }}>
                        <Typography>Teste</Typography>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default GerenciarConteudo