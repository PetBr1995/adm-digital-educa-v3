import React from "react";
import { Box, Button, Typography, alpha } from "@mui/material";
import Lottie from "lottie-react";
import successAnimation from "../../assets/success-tick.json";
import theme from "../../theme/theme";

const Step4Success = ({
  onGoList,
  message = "Conteúdo cadastrado com sucesso!",
}) => {
  return (
    <Box
      sx={{
        minHeight: 360,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 2,
      }}
    >
      <Box sx={{ width: 120 }}>
        <Lottie animationData={successAnimation} loop={false} />
      </Box>

      <Typography
        sx={{
          color: "#e5e7eb",
          fontSize: "1.8rem",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {message}
      </Typography>

      <Button
        variant="contained"
        onClick={onGoList}
        sx={{
          mt: 1,
          px: 4,
          py: 1.2,
          borderRadius: 2,
          fontWeight: 600,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          "&:hover": {
            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          },
        }}
      >
        Ir para conteúdos
      </Button>
    </Box>
  );
};

export default Step4Success;
