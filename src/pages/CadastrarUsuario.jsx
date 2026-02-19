import { Box, Divider, Typography } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Check } from "@mui/icons-material";
import theme from "../theme/theme";
import CadastrarUsuarioForm from "../components/users/CadastrarUsuario";

const CadastrarUsuario = () => {
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "6px",
        bgcolor: theme.palette.secondary.light,
        maxWidth: "900px",
        mx: "auto",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Dados do novo usuário
        </Typography>
        <Box sx={{ p: 2, width: "210px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ListAltIcon sx={{ bgcolor: "#F3A005", borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
          <Box sx={{ position: "relative", "&::after": { content: "''", position: "absolute", width: "85px", height: "5px", borderRadius: "4px", top: -2, left: -42, bgcolor: theme.palette.secondary.dark } }} />
          <Check sx={{ bgcolor: theme.palette.secondary.dark, borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <CadastrarUsuarioForm />
      </Box>
    </Box>
  );
};

export default CadastrarUsuario;
