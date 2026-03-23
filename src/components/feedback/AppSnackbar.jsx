import { Alert, Snackbar } from "@mui/material";

const AppSnackbar = ({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 4000,
  anchorOrigin = { vertical: "top", horizontal: "right" },
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackbar;
