import { Alert, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import theme from "../../theme/theme";
import { useCadastrarConteudo } from "../../context/CadastrarConteudoContext";
import CadastrarHeader from "../CadastrarConteudo/CadastrarHeader";
import StatusProgressBar from "../CadastrarConteudo/StatusProgressBar";
import Step1BasicInfo from "../CadastrarConteudo/Step1BasicInfo";
import Step2Conteudo from "../Step2Components/Step2Conteudo";
import Step3ExtrasUpload from "../CadastrarConteudo/Step3ExtrasUpload";
import Step4Success from "../CadastrarConteudo/Step4Success";
import CadastrarFooter from "../CadastrarConteudo/CadastrarFooter";

const EditContent = () => {
  const navigate = useNavigate();
  const {
    step,
    status,
    loading,
    uploadProgress,
    extraUploadProgress,
    extrasUploading,
    introUploading,
    step1Valid,
    step2Valid,
    step3Valid,
    handleBack,
    handleNext,
    handleSubmitFinal,
    loadingInitialData,
    loadError,
  } = useCadastrarConteudo();

  if (loadingInitialData) {
    return (
      <Box
        sx={{
          bgcolor: theme.palette.secondary.light,
          maxWidth: "900px",
          mx: "auto",
          borderRadius: "6px",
          border: `1px solid ${theme.palette.divider}`,
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Alert
        severity="error"
        sx={{
          maxWidth: "900px",
          mx: "auto",
        }}
      >
        {loadError}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: theme.palette.secondary.light,
        maxWidth: "900px",
        mx: "auto",
        borderRadius: "6px",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CadastrarHeader step={step} title="Editar conteúdo" />

      <StatusProgressBar
        status={status}
        loading={loading}
        uploadProgress={uploadProgress}
        extraUploadProgress={extraUploadProgress}
        extrasUploading={extrasUploading}
        introUploading={introUploading}
      />

      {step === 1 && <Step1BasicInfo />}
      {step === 2 && <Step2Conteudo />}
      {step === 3 && <Step3ExtrasUpload />}
      {step === 4 && (
        <Step4Success
          message="Conteúdo atualizado com sucesso!"
          onGoList={() => navigate("/conteudos")}
        />
      )}

      {step <= 3 && (
        <CadastrarFooter
          step={step}
          loading={loading}
          step1Valid={step1Valid}
          step2Valid={step2Valid}
          step3Valid={step3Valid}
          onBack={handleBack}
          onNext={handleNext}
          onCancel={() => navigate("/conteudos")}
          onSubmit={handleSubmitFinal}
          submitLabel="Salvar alterações"
        />
      )}
    </Box>
  );
};

export default EditContent;
