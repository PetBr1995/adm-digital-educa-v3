// src/components/contentComponents/SearchBarComponente.jsx
import { alpha } from "@mui/material/styles";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import theme from "../../theme/theme";

const SearchBarComponent = ({
  placeholder = "Buscar...",
  fullWidth = true,
  value = "",
  onChange,
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth={fullWidth}
        size="small"
        placeholder={placeholder}
        variant="outlined"
        value={value}
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 1,
            "& fieldset": { border: "none" },
            "&:hover fieldset": { border: "none" },
            "&.Mui-focused fieldset": { border: "none" },
          },
        }}
      />
    </Box>
  );
};

export default SearchBarComponent;
