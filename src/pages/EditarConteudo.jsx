import { useMemo } from "react";
import { Alert } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { CadastrarConteudoProvider } from "../context/CadastrarConteudoContext";
import EditContent from "../components/contentComponents/EditContent";

const EditarConteudo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const initialConteudoData = location.state?.conteudo ?? null;

  const draftKey = useMemo(
    () => `editar_conteudo_draft_${String(id || "")}`,
    [id]
  );

  if (!id || id === "undefined" || id === "null") {
    return <Alert severity="error">ID do conteúdo inválido.</Alert>;
  }

  return (
    <CadastrarConteudoProvider
      api={api}
      navigate={navigate}
      mode="edit"
      conteudoId={id}
      storageKey={draftKey}
      initialConteudoData={initialConteudoData}
    >
      <EditContent />
    </CadastrarConteudoProvider>
  );
};

export default EditarConteudo;
