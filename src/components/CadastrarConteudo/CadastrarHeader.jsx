import React from "react";
import { Box, Typography } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CheckIcon from "@mui/icons-material/Check";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import theme from "../../theme/theme";

const CadastrarHeader = ({ step, title = "Dados do novo conteúdo" }) => {
  return (
    <Box
      sx={{
        pb: 2,
        px: 2,
        my: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h5">{title}</Typography>

      <Box
        sx={{
          width: "300px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            bgcolor:
              step >= 4
                ? "#0BBE76"
                : step > 1
                ? "#0BBE76"
                : step === 1
                ? theme.palette.primary.light
                : theme.palette.secondary.dark,
            borderRadius: "50%",
            width: 45,
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: step >= 1 ? "#ffffff" : theme.palette.secondary.light,
            "&::after": {
              content: '""',
              position: "absolute",
              borderRadius: "2px",
              top: 20,
              right: -78,
              width: "74px",
              height: "4px",
              bgcolor: step >= 4 ? "#0BBE76" : step > 1 ? "#0BBE76" : theme.palette.secondary.dark,
              zIndex: 5,
            },
          }}
        >
          <ListAltIcon />
        </Box>

        <Box
          sx={{
            position: "relative",
            borderRadius: "50%",
            width: 45,
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              step >= 4
                ? "#0BBE76"
                : step > 2
                ? "#0BBE76"
                : step === 2
                ? theme.palette.primary.light
                : theme.palette.secondary.dark,
            color: step >= 2 ? "#ffffff" : theme.palette.primary.light,
            "&::after": {
              content: '""',
              position: "absolute",
              borderRadius: "2px",
              top: 20,
              right: -79,
              width: "74px",
              height: "4px",
              bgcolor: step >= 4 ? "#0BBE76" : step > 2 ? "#0BBE76" : theme.palette.secondary.dark,
            },
          }}
        >
          <SlideshowIcon />
        </Box>

        <Box
          sx={{
            borderRadius: "50%",
            width: 45,
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              step >= 4
                ? "#0BBE76"
                : step === 3
                ? theme.palette.primary.light
                : step > 3
                ? "green"
                : theme.palette.secondary.dark,
            color: step >= 3 ? "#ffffff" : theme.palette.primary.light,
          }}
        >
          <CheckIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default CadastrarHeader;
