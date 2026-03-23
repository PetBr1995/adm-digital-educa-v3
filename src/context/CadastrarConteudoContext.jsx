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
  introVideoTitulo: "",
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

const normalizeVideo = (video, fallbackId, moduloId = null) => {
  if (!video) return null;
  const videoId = String(
    video.id ?? video._id ?? video.videoId ?? fallbackId ?? ""
  ).trim();
  if (!videoId) return null;
  const titulo = String(
    video.titulo ?? video.nome ?? video.name ?? `Vídeo ${videoId}`
  );
  return {
    id: `existing-video-${videoId}`,
    videoId,
    moduloId: moduloId ? String(moduloId) : null,
    isExisting: true,
    originalTitulo: titulo,
    titulo,
    duracao: Number(video.duracao ?? video.duration ?? 0),
    progress: 0,
    status: "pending",
    file: null,
    fileName: String(video.fileName ?? video.nomeArquivo ?? titulo),
    fileSize: Number(video.fileSize ?? video.tamanho ?? 0),
    fileType: String(video.fileType ?? video.tipoArquivo ?? ""),
  };
};

const normalizeExistingContentVideos = (raw) => {
  const moduloList =
    raw?.modulos ??
    raw?.moduloConteudos ??
    raw?.modulosConteudo ??
    raw?.modules ??
    [];

  const modulos = [];
  const videoIdsInModulo = new Set();

  if (Array.isArray(moduloList)) {
    moduloList.forEach((mod, index) => {
      const moduloId = String(mod?.id ?? mod?._id ?? `mod-${index}`);
      const moduloVideos =
        mod?.videos ??
        mod?.videoConteudos ??
        mod?.videosConteudo ??
        (mod?.video ? [mod.video] : []);

      const firstVideo = Array.isArray(moduloVideos) ? moduloVideos[0] : null;
      const normalizedVideo = normalizeVideo(firstVideo, `${moduloId}-video`, moduloId);
      if (normalizedVideo?.videoId) videoIdsInModulo.add(normalizedVideo.videoId);

      modulos.push({
        id: `existing-modulo-${moduloId}`,
        moduloId,
        isExisting: true,
        titulo: String(mod?.titulo ?? mod?.nome ?? `Módulo ${index + 1}`),
        subtitulo: String(mod?.subtitulo ?? mod?.subTitulo ?? ""),
        descricao: String(mod?.descricao ?? ""),
        video: normalizedVideo,
      });
    });
  }

  const freeVideoCandidates =
    raw?.videosLivres ??
    raw?.videos ??
    raw?.videoConteudos ??
    raw?.conteudoVideos ??
    [];

  const videosLivres = [];
  if (Array.isArray(freeVideoCandidates)) {
    freeVideoCandidates.forEach((video, index) => {
      const normalized = normalizeVideo(video, `livre-${index}`, video?.moduloId ?? null);
      if (!normalized) return;
      if (normalized.moduloId) return;
      if (videoIdsInModulo.has(normalized.videoId)) return;
      videosLivres.push(normalized);
    });
  }

  return { modulos, videosLivres };
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
  const [deletedVideoIds, setDeletedVideoIds] = useState([]);

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
    const { modulos: existingModulos, videosLivres: existingVideosLivres } =
      normalizeExistingContentVideos(raw);

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
      introVideoTitulo: String(
        raw.introVideoTitulo ??
          raw.videoTitulo ??
          raw.video?.titulo ??
          raw.titulo ??
          ""
      ),
      instrutorIds,
      tagIds,
    }));

    setModulos(existingModulos);
    setVideosLivres(existingVideosLivres);
    setDeletedVideoIds([]);
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
        let response;
        try {
          response = await api.get(`/conteudos/${conteudoId}/admin`);
        } catch (adminErr) {
          response = await api.get(`/conteudos/${conteudoId}`);
          if (process.env.NODE_ENV !== "production") {
            console.warn("Fallback para /conteudos/:id (sem /admin):", adminErr);
          }
        }

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
    deletedVideoIds,
  });

  const handleClearDraft = () => {
    resetDraftData();
    setVideoFile(null);
    setThumbnailDesktop(null);
    setThumbnailMobile(null);
    setThumbnailDestaque(null);
    setDeletedVideoIds([]);
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
    deletedVideoIds,
    setDeletedVideoIds,
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
