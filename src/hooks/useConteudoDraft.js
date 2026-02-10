import { useEffect, useMemo, useState } from "react";

const sanitizeVideoItem = (v) => ({
  id: v?.id ?? Date.now(),
  titulo: v?.titulo ?? "",
  duracao: v?.duracao ?? 0,
  progress: 0,
  status: "pending",
  file: null,
  fileName: v?.file?.name ?? v?.fileName ?? "",
  fileSize: v?.file?.size ?? v?.fileSize ?? 0,
  fileType: v?.file?.type ?? v?.fileType ?? "",
});

const sanitizeModuloItem = (m) => ({
  id: m?.id ?? Date.now(),
  titulo: m?.titulo ?? "",
  subtitulo: m?.subtitulo ?? "",
  descricao: m?.descricao ?? "",
  video: m?.video ? sanitizeVideoItem(m.video) : null,
});

export default function useConteudoDraft(storageKey, defaultFormData) {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultFormData;
    } catch {
      return defaultFormData;
    }
  });

  const [step, setStep] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return 1;
      const parsed = JSON.parse(saved);
      const s = parsed?.__step ? parsed.__step : 1;
      return s > 3 ? 1 : s;
    } catch {
      return 1;
    }
  });

  const [abaAtiva, setAbaAtiva] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return "MODULOS";
      const parsed = JSON.parse(saved);
      return parsed?.__aba ? parsed.__aba : "MODULOS";
    } catch {
      return "MODULOS";
    }
  });

  const [modulos, setModulos] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed?.modulos)
        ? parsed.modulos.map(sanitizeModuloItem)
        : [];
    } catch {
      return [];
    }
  });

  const [videosLivres, setVideosLivres] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed?.videosLivres)
        ? parsed.videosLivres.map(sanitizeVideoItem)
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (step >= 4) return;
    const toSave = {
      ...formData,
      __step: step > 3 ? 3 : step,
      __aba: abaAtiva,
      modulos: (modulos || []).map(sanitizeModuloItem),
      videosLivres: (videosLivres || []).map(sanitizeVideoItem),
    };
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  }, [formData, step, abaAtiva, modulos, videosLivres, storageKey]);

  const resetDraftData = useMemo(() => {
    return () => {
      localStorage.removeItem(storageKey);
      setFormData(defaultFormData);
      setStep(1);
      setAbaAtiva("MODULOS");
      setModulos([]);
      setVideosLivres([]);
    };
  }, [storageKey, defaultFormData]);

  return {
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
  };
}
