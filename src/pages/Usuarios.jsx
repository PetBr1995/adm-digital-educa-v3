import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import theme from "../theme/theme";
import UsersListTable from "../components/users/UsersListTable";

const Usuarios = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor:theme.palette.secondary.light }}>
      <UsersListTable onCreateUser={() => navigate("/cadastrarusuario")} />
    </Box>
  );
};

export default Usuarios;
