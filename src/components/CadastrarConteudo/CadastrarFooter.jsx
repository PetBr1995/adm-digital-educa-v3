import React from "react";
import { Box, Button } from "@mui/material";
import theme from "../../theme/theme";

const CadastrarFooter = ({
  step,
  loading,
  step1Valid,
  step2Valid,
  step3Valid,
  onBack,
  onNext,
  onCancel,
  onSubmit,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        justifyContent: "end",
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Button
        onClick={onCancel}
        variant="outlined"
        sx={{ borderColor: theme.palette.divider, color: "#ffffff" }}
        disabled={loading}
      >
        Cancelar
      </Button>

      {step > 1 && (
        <Button variant="outlined" onClick={onBack} sx={{ color: "#fff" }} disabled={loading}>
          Voltar
        </Button>
      )}

      {step < 3 ? (
        <Button
          variant="contained"
          onClick={onNext}
          disabled={loading || (step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
          sx={{ bgcolor: theme.palette.primary.light, fontWeight: 600 }}
        >
          Próximo
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !step3Valid}
          sx={{ bgcolor: theme.palette.primary.light, fontWeight: 600 }}
        >
          Cadastrar
        </Button>
      )}
    </Box>
  );
};

export default CadastrarFooter;
