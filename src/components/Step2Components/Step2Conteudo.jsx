import { Box, Button } from "@mui/material";
import theme from "../../theme/theme";
import Step2Modulos from "../Step2Components/Step2Modulo";
import Step2VideosLivres from "./Step2VideosLivres";
import { useCadastrarConteudo } from "../../context/CadastrarConteudoContext";

const Step2Conteudo = () => {
  const {
    abaAtiva,
    setAbaAtiva,
    showFormModulo,
    setShowFormModulo,
    modulos,
    setModulos,
    videosLivres,
    setVideosLivres,
  } = useCadastrarConteudo();
  return (
    <>
      {/* Abas */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          gap: 2,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          disableRipple
          onClick={() => setAbaAtiva("MODULOS")}
          sx={{
            borderRadius: 0,
            "&:hover": { backgroundColor: "transparent" },
            "&:active": { backgroundColor: "transparent" },
            borderBottom:
              abaAtiva === "MODULOS"
                ? `2px solid ${theme.palette.primary.light}`
                : "none",
          }}
        >
          Gerenciar Módulos
        </Button>

        <Button
          disableRipple
          onClick={() => setAbaAtiva("VIDEOS")}
          sx={{
            borderRadius: 0,
            "&:hover": { backgroundColor: "transparent" },
            "&:active": { backgroundColor: "transparent" },
            borderBottom:
              abaAtiva === "VIDEOS"
                ? `2px solid ${theme.palette.primary.light}`
                : "none",
          }}
        >
          Vídeos Livres
        </Button>
      </Box>

      {/* Conteúdo da aba */}
      <Box sx={{ px: 2, py: 2 }}>
        {abaAtiva === "MODULOS" ? <Step2Modulos /> : <Step2VideosLivres />}

      </Box>
    </>
  );
};

export default Step2Conteudo;
