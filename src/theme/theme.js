// src/theme/theme.js
import { Height } from "@mui/icons-material";
import { alpha, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FBBA41", light:"#FFD078" },
    secondary: { main: "#05182D", light:"#092C53" },
  },

  components: {
    // 🔽 Customização global do TextField via InputBase / OutlinedInput
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#728CAA", 0.4), // cor default da borda
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#F3A005", 0.6), // borda no hover
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#F3A005", 0.6), // borda quando focado
          },
        },
        input: {
          color: "#fff", // cor do texto digitado
          fontSize:".9rem"
        },
      },
    },

    // 🔽 Customização do Label do TextField
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#728CAA", // cor do label
          "&.Mui-focused": {
            color: "#728CAA",
            fontSize: "1rem"
          },
          fontSize: "0.9rem",
        },
      },
    },
  },
});

export default theme;
