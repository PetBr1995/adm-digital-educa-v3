import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const normalizeMultiIds = (items, nestedKey) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (nestedKey && item?.[nestedKey]) {
        return String(item[nestedKey]?._id ?? item[nestedKey]?.id ?? "");
      }
      return String(item?._id ?? item?.id ?? "");
    })
    .filter(Boolean);
};

export const CadastrarConteudoProvider = ({
  api,
  navigate,
  children,
  mode = "create",
  conteudoId = null,
  storageKey = STORAGE_KEY,
  initialConteudoData = null,
}) => {
  const isEditMode = mode === "edit";
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
  } = useConteudoDraft(storageKey, DEFAULT_FORM_DATA);

  const { categorias, subcategorias, instrutores, tags } = useConteudoLists(api);

  const [showFormModulo, setShowFormModulo] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");

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
    if (isEditMode) return true;
    return !!videoFile;
  }, [isEditMode, videoFile]);

  const hydrateConteudoData = useCallback((raw) => {
    if (!raw) return;

    const instrutorIds = normalizeMultiIds(raw.instrutores, "instrutor");
    const tagIds = normalizeMultiIds(raw.tags, "tag");

    const categoriaId = String(
      raw.categoriaId ??
        raw.categoria?._id ??
        raw.categoria?.id ??
        ""
    );
    const subcategoriaId = String(
      raw.subcategoriaId ??
        raw.subcategoria?._id ??
        raw.subcategoria?.id ??
        ""
    );

    setFormData((prev) => ({
      ...prev,
      titulo: String(raw.titulo ?? ""),
      descricao: String(raw.descricao ?? ""),
      aprendizagem: String(raw.aprendizagem ?? ""),
      prerequisitos: String(raw.requisitos ?? raw.prerequisitos ?? ""),
      tipoConteudo: String(raw.tipo ?? ""),
      categoriaId,
      subcategoriaId,
      nivel: String(raw.level ?? raw.nivel ?? ""),
      dataCriacao: toLocalDateTimeInput(raw.dataCriacao ?? raw.createdAt),
      destaque: Boolean(raw.destaque),
      gratuitoTipo: String(raw.gratuitoTipo ?? "NENHUM"),
      gratuitoDataFim: String(raw.gratuitoAte ?? raw.gratuitoDataFim ?? ""),
      instrutorIds,
      tagIds,
    }));

    setModulos([]);
    setVideosLivres([]);
    setVideoFile(null);
    setThumbnailDesktop(null);
    setThumbnailMobile(null);
    setThumbnailDestaque(null);
    setStep(1);
  }, [setFormData, setModulos, setStep, setVideosLivres]);

  useEffect(() => {
    if (!isEditMode) return;

    let mounted = true;

    const loadConteudo = async () => {
      if (initialConteudoData) {
        hydrateConteudoData(initialConteudoData);
        if (mounted) setLoadingInitialData(false);
        return;
      }

      if (!conteudoId) {
        if (mounted) {
          setLoadError("ID do conteúdo não informado.");
          setLoadingInitialData(false);
        }
        return;
      }

      setLoadingInitialData(true);
      setLoadError("");

      try {
        const response = await api.get(`/conteudos/${conteudoId}`);
        const raw = response.data?.data ?? response.data?.conteudo ?? response.data ?? {};

        if (!mounted) return;
        hydrateConteudoData(raw);
      } catch (err) {
        console.error("Erro ao carregar conteúdo para edição:", err);
        if (mounted) {
          setLoadError("Não foi possível carregar os dados do conteúdo.");
        }
      } finally {
        if (mounted) setLoadingInitialData(false);
      }
    };

    loadConteudo();

    return () => {
      mounted = false;
    };
  }, [
    api,
    conteudoId,
    hydrateConteudoData,
    initialConteudoData,
    isEditMode,
  ]);

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
    mode,
    conteudoId,
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
    storageKey,
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
    loadingInitialData,
    loadError,
    isEditMode,
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
