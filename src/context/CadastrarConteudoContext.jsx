import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import useConteudoDraft from "../hooks/useConteudoDraft";
import useConteudoLists from "../hooks/useConteudoLists";
import useVimeoVideoUpload from "../hooks/useVimeoVideoUpload";
import useConteudoSubmit from "../hooks/useConteudoSubmit";

const STORAGE_KEY = "cadastrar_conteudo_draft_v2";
const DEFAULT_FORM_DATA = {
  titulo: "",
  descricao: "",
  aprendizagem: "",
  prerequisitos: "",
  tipoConteudo: "",
  categoriaId: "",
  subcategoriaId: "",
  nivel: "",
  dataCriacao: "",
  destaque: false,
  gratuitoTipo: "NENHUM",
  gratuitoDataFim: "",
  instrutorIds: [],
  tagIds: [],
};

const CadastrarConteudoContext = createContext(null);

export const CadastrarConteudoProvider = ({ api, navigate, children }) => {
  const {
    formData,
    setFormData,
    step,
    setStep,
    abaAtiva,
    setAbaAtiva,
    modulos,
    setModulos,
    videosLivres,
    setVideosLivres,
    resetDraftData,
  } = useConteudoDraft(STORAGE_KEY, DEFAULT_FORM_DATA);

  const { categorias, subcategorias, instrutores, tags } = useConteudoLists(api);

  const [showFormModulo, setShowFormModulo] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailDesktop, setThumbnailDesktop] = useState(null);
  const [thumbnailMobile, setThumbnailMobile] = useState(null);
  const [thumbnailDestaque, setThumbnailDestaque] = useState(null);

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setFormData((prev) => {
      const catId = String(prev.categoriaId || "");
      const subId = String(prev.subcategoriaId || "");
      if (!catId) return { ...prev, subcategoriaId: "" };
      const ok = subcategorias.some(
        (s) => String(s.id || s._id) === subId
      );
      return ok ? prev : { ...prev, subcategoriaId: "" };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.categoriaId, subcategorias.length]);

  const step1Valid = useMemo(() => {
    return (
      formData.titulo.trim() !== "" &&
      formData.descricao.trim() !== "" &&
      formData.tipoConteudo !== "" &&
      String(formData.categoriaId || "").trim() !== "" &&
      String(formData.subcategoriaId || "").trim() !== "" &&
      formData.nivel !== ""
    );
  }, [
    formData.titulo,
    formData.descricao,
    formData.tipoConteudo,
    formData.categoriaId,
    formData.subcategoriaId,
    formData.nivel,
  ]);

  const step2Valid = true;

  const step3Valid = useMemo(() => {
    return !!videoFile;
  }, [videoFile]);

  const handleNext = () => {
    if (step === 1 && !step1Valid) return;
    if (step === 2 && !step2Valid) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const { uploadVideoToVimeo } = useVimeoVideoUpload(api);

  const {
    handleSubmitFinal,
    loading,
    status,
    uploadProgress,
    extraUploadProgress,
    extrasUploading,
    introUploading,
    setStatus,
    setUploadProgress,
    setLoading,
  } = useConteudoSubmit({
    api,
    formData,
    videoFile,
    thumbnailDesktop,
    thumbnailMobile,
    thumbnailDestaque,
    modulos,
    videosLivres,
    navigate,
    setStep,
    uploadVideoToVimeo,
    storageKey: STORAGE_KEY,
    step1Valid,
    step3Valid,
  });

  const handleClearDraft = () => {
    resetDraftData();
    setVideoFile(null);
    setThumbnailDesktop(null);
    setThumbnailMobile(null);
    setThumbnailDestaque(null);
    setStatus("");
    setUploadProgress(0);
    setLoading(false);
  };

  const value = {
    formData,
    setFormData,
    updateField,
    step,
    setStep,
    abaAtiva,
    setAbaAtiva,
    modulos,
    setModulos,
    videosLivres,
    setVideosLivres,
    showFormModulo,
    setShowFormModulo,
    categorias,
    subcategorias,
    instrutores,
    tags,
    videoFile,
    setVideoFile,
    thumbnailDesktop,
    thumbnailMobile,
    thumbnailDestaque,
    setThumbnailDesktop,
    setThumbnailMobile,
    setThumbnailDestaque,
    step1Valid,
    step2Valid,
    step3Valid,
    handleNext,
    handleBack,
    handleClearDraft,
    handleSubmitFinal,
    loading,
    status,
    uploadProgress,
    extraUploadProgress,
    extrasUploading,
    introUploading,
  };

  return (
    <CadastrarConteudoContext.Provider value={value}>
      {children}
    </CadastrarConteudoContext.Provider>
  );
};

export const useCadastrarConteudo = () => {
  const ctx = useContext(CadastrarConteudoContext);
  if (!ctx) {
    throw new Error("useCadastrarConteudo must be used within CadastrarConteudoProvider");
  }
  return ctx;
};
