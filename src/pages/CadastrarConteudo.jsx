import { Box } from "@mui/material";
import theme from "../theme/theme";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { CadastrarConteudoProvider, useCadastrarConteudo } from "../context/CadastrarConteudoContext";

import Step1BasicInfo from "../components/CadastrarConteudo/Step1BasicInfo";
import Step2Conteudo from "../components/Step2Components/Step2Conteudo";
import Step3ExtrasUpload from "../components/CadastrarConteudo/Step3ExtrasUpload";
import Step4Success from "../components/CadastrarConteudo/Step4Success";
import CadastrarHeader from "../components/CadastrarConteudo/CadastrarHeader";
import CadastrarFooter from "../components/CadastrarConteudo/CadastrarFooter";
import StatusProgressBar from "../components/CadastrarConteudo/StatusProgressBar";

const CadastrarConteudoBody = () => {
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
  } = useCadastrarConteudo();

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
      <CadastrarHeader step={step} />

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
      {step === 4 && <Step4Success onGoList={() => navigate("/conteudos")} />}

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
        />
      )}
    </Box>
  );
};

const CadastrarConteudo = () => {
  const navigate = useNavigate();
  return (
    <CadastrarConteudoProvider api={api} navigate={navigate}>
      <CadastrarConteudoBody />
    </CadastrarConteudoProvider>
  );
};

export default CadastrarConteudo;
