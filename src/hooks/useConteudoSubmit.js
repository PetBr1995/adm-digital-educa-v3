import { useCallback, useMemo, useState } from "react";
import * as tus from "tus-js-client";

export default function useConteudoSubmit({
  api,
  mode = "create",
  conteudoId = null,
  formData,
  videoFile,
  thumbnailDesktop,
  thumbnailMobile,
  thumbnailDestaque,
  modulos,
  videosLivres,
  deletedVideoIds,
  navigate,
  setStep,
  uploadVideoToVimeo,
  storageKey,
  step1Valid,
  step3Valid,
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0); // vídeo introdutório
  const [extraUploadProgress, setExtraUploadProgress] = useState(0); // módulos + vídeos livres
  const [extrasUploading, setExtrasUploading] = useState(false);
  const [introUploading, setIntroUploading] = useState(false);

  const tipoGratuito = useMemo(
    () => (formData.gratuitoTipo || "NENHUM").toUpperCase(),
    [formData.gratuitoTipo]
  );

  const gratuitoAte = useMemo(
    () =>
      tipoGratuito === "TEMPORARIO" && formData.gratuitoDataFim
        ? formData.gratuitoDataFim
        : null,
    [tipoGratuito, formData.gratuitoDataFim]
  );

  const getApiErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === "string") return first;
      if (typeof first?.message === "string") return first.message;
    }
    return fallback;
  };

  const uploadExtrasForConteudo = useCallback(
    async ({ conteudoIdValue, token }) => {
      const moduloItems = (modulos || []).filter((m) => m?.video?.file);
      const livreItems = (videosLivres || []).filter((v) => v?.file);
      const totalExtras = moduloItems.length + livreItems.length;

      if (totalExtras <= 0) return;

      setExtraUploadProgress(0);
      setExtrasUploading(true);

      if (moduloItems.length > 0) {
        setStatus("Criando módulos e enviando vídeos...");
        for (let i = 0; i < moduloItems.length; i++) {
          const m = moduloItems[i];
          const moduloRes = await api.post(
            "/modulo-conteudo/create",
            {
              titulo: m.titulo?.trim(),
              subtitulo: m.subtitulo?.trim(),
              descricao: m.descricao?.trim(),
              conteudoId: conteudoIdValue,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const moduloId =
            moduloRes.data?.modulo?.id ??
            moduloRes.data?.id ??
            moduloRes.data?.moduloId;

          if (!moduloId) {
            throw new Error("ID do módulo não retornado pelo backend");
          }

          await uploadVideoToVimeo({
            file: m.video.file,
            titulo: m.video.titulo,
            duracao: m.video.duracao,
            conteudoId: conteudoIdValue,
            moduloId,
            onProgress: (percent) => {
              const overall = ((i + percent / 100) / totalExtras) * 100;
              setExtraUploadProgress(Math.round(overall));
            },
          });

          const overall = ((i + 1) / totalExtras) * 100;
          setExtraUploadProgress(Math.round(overall));
        }
      }

      if (livreItems.length > 0) {
        setStatus("Enviando vídeos livres...");
        for (let j = 0; j < livreItems.length; j++) {
          const v = livreItems[j];
          const index = moduloItems.length + j;
          await uploadVideoToVimeo({
            file: v.file,
            titulo: v.titulo,
            duracao: v.duracao,
            conteudoId: conteudoIdValue,
            moduloId: null,
            onProgress: (percent) => {
              const overall = ((index + percent / 100) / totalExtras) * 100;
              setExtraUploadProgress(Math.round(overall));
            },
          });

          const overall = ((index + 1) / totalExtras) * 100;
          setExtraUploadProgress(Math.round(overall));
        }
      }

      setExtrasUploading(false);
    },
    [api, modulos, videosLivres, uploadVideoToVimeo]
  );

  const syncExistingVideos = useCallback(
    async ({ token }) => {
      if (mode !== "edit") return { failedDeletes: 0, failedRenames: 0 };

      const deletedSet = new Set((deletedVideoIds || []).map((id) => String(id)));
      const existingVideos = [
        ...(modulos || []).map((m) => m?.video).filter(Boolean),
        ...(videosLivres || []),
      ]
        .filter((v) => v?.isExisting && v?.videoId)
        .map((v) => ({
          videoId: String(v.videoId),
          titulo: String(v.titulo ?? "").trim(),
          originalTitulo: String(v.originalTitulo ?? "").trim(),
        }))
        .filter((v) => !deletedSet.has(v.videoId));

      const renameTargets = [];
      const seen = new Set();
      existingVideos.forEach((v) => {
        if (!v.videoId || seen.has(v.videoId)) return;
        seen.add(v.videoId);
        if (v.titulo && v.titulo !== v.originalTitulo) {
          renameTargets.push(v);
        }
      });

      let failedDeletes = 0;
      let failedRenames = 0;

      for (const videoId of deletedSet) {
        try {
          await api.delete(`/video/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.error(`Erro ao excluir vídeo ${videoId}:`, err);
          failedDeletes += 1;
        }
      }

      for (const item of renameTargets) {
        try {
          await api.patch(
            `/video/${item.videoId}`,
            { titulo: item.titulo },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          try {
            await api.post(
              `/vimeo-client/video/${item.videoId}/update-metadata`,
              { name: item.titulo, description: "" },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (metadataErr) {
            console.error(`Falha ao atualizar metadata do vídeo ${item.videoId}:`, metadataErr);
          }
        } catch (err) {
          console.error(`Erro ao renomear vídeo ${item.videoId}:`, err);
          failedRenames += 1;
        }
      }

      return { failedDeletes, failedRenames };
    },
    [api, mode, modulos, videosLivres, deletedVideoIds]
  );

  const handleSubmitFinal = useCallback(async () => {
    if (!step1Valid) return;
    if (mode === "create" && !step3Valid) {
      setStatus("Selecione um vídeo introdutório!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Token não encontrado.");
      return;
    }

    setLoading(true);
    setStatus(mode === "edit" ? "Atualizando conteúdo..." : "Criando conteúdo...");
    setUploadProgress(0);

    const conteudoData = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipoConteudo,
      level: formData.nivel,
      aprendizagem: formData.aprendizagem,
      requisitos: formData.prerequisitos,
      categoriaId: String(formData.categoriaId),
      ...(formData.subcategoriaId
        ? { subcategoriaId: String(formData.subcategoriaId) }
        : {}),
      destaque: !!formData.destaque,
      gratuitoTipo: tipoGratuito,
      ...(gratuitoAte ? { gratuitoAte } : {}),
      ...(videoFile ? { fileSize: videoFile.size } : {}),
    };

    if (mode !== "edit") {
      conteudoData.dataCriacao = formData.dataCriacao;
    }

    const fd = new FormData();
    Object.entries(conteudoData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, v);
    });

    (formData.instrutorIds || []).forEach((id) =>
      fd.append("instrutorIds[]", String(id))
    );
    (formData.tagIds || []).forEach((id) => fd.append("tags[]", String(id)));

    if (thumbnailDesktop) fd.append("thumbnailDesktop", thumbnailDesktop);
    if (thumbnailMobile) fd.append("thumbnailMobile", thumbnailMobile);
    if (thumbnailDestaque) fd.append("thumbnailDestaque", thumbnailDestaque);

    if (mode === "edit") {
      if (!conteudoId) {
        setStatus("ID do conteúdo não informado.");
        setLoading(false);
        return;
      }

      try {
        const hasMediaFiles =
          !!videoFile ||
          !!thumbnailDesktop ||
          !!thumbnailMobile ||
          !!thumbnailDestaque;

        if (hasMediaFiles) {
          if (videoFile) fd.append("video", videoFile);
          await api.put(`/conteudos/${conteudoId}`, fd, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        } else {
          const updateData = {
            ...conteudoData,
            instrutorIds: (formData.instrutorIds || []).map((id) => String(id)),
            tags: (formData.tagIds || []).map((id) => String(id)),
          };
          delete updateData.fileSize;

          await api.put(`/conteudos/${conteudoId}`, updateData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        const introVideoTitle = String(
          formData.introVideoTitulo || formData.titulo || ""
        ).trim();

        if (introVideoTitle) {
          try {
            await api.post(
              `/vimeo-client/update-metadata/${conteudoId}`,
              {
                name: introVideoTitle,
                description: formData.descricao || "",
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (metadataErr) {
            console.error(
              "Falha ao atualizar título do vídeo introdutório:",
              metadataErr
            );
          }
        }

        try {
          setStatus("Sincronizando vídeos existentes...");
          const { failedDeletes, failedRenames } = await syncExistingVideos({ token });

          await uploadExtrasForConteudo({
            conteudoIdValue: conteudoId,
            token,
          });

          if (failedDeletes > 0 || failedRenames > 0) {
            const warnings = [];
            if (failedDeletes > 0) warnings.push(`${failedDeletes} exclusão(ões)`);
            if (failedRenames > 0) warnings.push(`${failedRenames} renomeação(ões)`);
            setStatus(
              `Conteúdo atualizado, mas houve falha em ${warnings.join(" e ")} de vídeos existentes.`
            );
            setLoading(false);
            setExtrasUploading(false);
            return;
          }
        } catch (extrasErr) {
          console.error("Erro ao enviar conteúdos extras:", extrasErr);
          setStatus("Conteúdo atualizado, mas falhou ao enviar novos vídeos.");
          setLoading(false);
          setExtrasUploading(false);
          return;
        }

        setStatus("Conteúdo atualizado com sucesso!");
        localStorage.removeItem(storageKey);
        setLoading(false);

        if (typeof setStep === "function") {
          setStep(4);
        } else if (typeof navigate === "function") {
          navigate("/conteudos");
        }
      } catch (err) {
        console.error("Erro ao atualizar conteúdo:", err.response?.data || err);
        setStatus(getApiErrorMessage(err, "Erro ao atualizar conteúdo."));
        setLoading(false);
      }
      return;
    }

    try {
      const res = await api.post("/conteudos/create", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { vimeoUploadLink, conteudo } = res.data;

      const finish = async (metadataOk = true) => {
        try {
          await uploadExtrasForConteudo({
            conteudoIdValue: conteudo.id,
            token,
          });
        } catch (err) {
          console.error("Erro ao enviar conteúdos extras:", err);
          setStatus("Conteúdo criado, mas falhou ao enviar novos vídeos.");
          setLoading(false);
          setExtrasUploading(false);
          return;
        }

        setStatus(
          metadataOk
            ? "Conteúdo criado com sucesso!"
            : "Conteúdo criado, mas falhou ao atualizar metadata."
        );
        localStorage.removeItem(storageKey);

        setLoading(false);
        if (typeof setStep === "function") {
          setStep(4);
        } else if (typeof navigate === "function") {
          navigate("/conteudos");
        }
      };

      if (!videoFile) {
        await finish(true);
        return;
      }

      if (!vimeoUploadLink) {
        setStatus("Erro: link de upload do Vimeo não retornado.");
        setLoading(false);
        return;
      }

      setStatus("Enviando vídeo para o Vimeo...");
      setUploadProgress(0);
      setIntroUploading(true);

      const upload = new tus.Upload(videoFile, {
        uploadUrl: vimeoUploadLink,
        metadata: {
          filename: videoFile.name,
          filetype: videoFile.type,
        },
        onError: (err) => {
          console.error("Erro no upload:", err);
          setStatus("Erro ao enviar vídeo.");
          setLoading(false);
          setIntroUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percent = Math.round((bytesUploaded / bytesTotal) * 100);
          setUploadProgress(percent);
          setStatus(`Enviando vídeo... ${percent}%`);
        },
        onSuccess: async () => {
          let metadataOk = true;
          try {
            await api.post(
              `/vimeo-client/update-metadata/${conteudo.id}`,
              {
                name: conteudo.titulo,
                description: conteudo.descricao || "",
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error("Erro ao atualizar metadata:", err);
            metadataOk = false;
          }

          setIntroUploading(false);
          await finish(metadataOk);
        },
      });

      upload.start();
    } catch (err) {
      console.error("Erro ao criar conteúdo:", err.response?.data || err);
      setStatus("Erro ao criar conteúdo.");
      setLoading(false);
    }
  }, [
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
    deletedVideoIds,
    navigate,
    uploadVideoToVimeo,
    uploadExtrasForConteudo,
    syncExistingVideos,
    storageKey,
    step1Valid,
    step3Valid,
    tipoGratuito,
    gratuitoAte,
  ]);

  return {
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
  };
}
