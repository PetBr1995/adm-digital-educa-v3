import { Box, Divider, Typography } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Check } from "@mui/icons-material";
import { useState } from "react";
import theme from "../theme/theme";
import FormPlano from "../components/planos/FormPlano";

const CadastrarPlano = () => {
  const [isCompleted, setIsCompleted] = useState(false);

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
          Dados do novo plano
        </Typography>
        <Box sx={{ p: 2, width: "210px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ListAltIcon sx={{ bgcolor: isCompleted ? "#0BBE76" : "#F3A005", borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
          <Box sx={{ position: "relative", "&::after": { content: "''", position: "absolute", width: "85px", height: "5px", borderRadius: "4px", top: -2, left: -42, bgcolor: isCompleted ? "#0BBE76" : theme.palette.secondary.dark } }} />
          <Check sx={{ bgcolor: isCompleted ? "#0BBE76" : theme.palette.secondary.dark, borderRadius: "100%", p: 1, width: "45px", height: "45px" }} />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <FormPlano onSuccess={() => setIsCompleted(true)} />
      </Box>
    </Box>
  );
};

export default CadastrarPlano;
