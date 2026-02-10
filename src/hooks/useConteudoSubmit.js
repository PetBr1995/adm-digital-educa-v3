import { useCallback, useMemo, useState } from "react";
import * as tus from "tus-js-client";

export default function useConteudoSubmit({
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

  const handleSubmitFinal = useCallback(async () => {
    if (!step1Valid) return;
    if (!step3Valid) {
      setStatus("Selecione um vídeo introdutório!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Token não encontrado.");
      return;
    }

    setLoading(true);
    setStatus("Criando conteúdo...");
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
      dataCriacao: formData.dataCriacao,
      destaque: !!formData.destaque,
      gratuitoTipo: tipoGratuito,
      ...(gratuitoAte ? { gratuitoAte } : {}),
      ...(videoFile ? { fileSize: videoFile.size } : {}),
    };

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

    try {
      const res = await api.post("/conteudos/create", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { vimeoUploadLink, conteudo } = res.data;

      const finish = async (metadataOk = true) => {
        const moduloItems = (modulos || []).filter((m) => m?.video?.file);
        const livreItems = (videosLivres || []).filter((v) => v?.file);
        const totalExtras = moduloItems.length + livreItems.length;

        if (totalExtras > 0) {
          setExtraUploadProgress(0);
          setExtrasUploading(true);
        }

        if (moduloItems.length > 0) {
          try {
            setStatus("Criando módulos e enviando vídeos...");
            for (let i = 0; i < moduloItems.length; i++) {
              const m = moduloItems[i];
              const moduloRes = await api.post(
                "/modulo-conteudo/create",
                {
                  titulo: m.titulo?.trim(),
                  subtitulo: m.subtitulo?.trim(),
                  descricao: m.descricao?.trim(),
                  conteudoId: conteudo.id,
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
                conteudoId: conteudo.id,
                moduloId,
                onProgress: (percent) => {
                  if (totalExtras > 0) {
                    const overall = ((i + percent / 100) / totalExtras) * 100;
                    setExtraUploadProgress(Math.round(overall));
                  }
                },
              });

              if (totalExtras > 0) {
                const overall = ((i + 1) / totalExtras) * 100;
                setExtraUploadProgress(Math.round(overall));
              }
            }
          } catch (err) {
            console.error("Erro ao enviar módulos:", err);
            setStatus("Conteúdo criado, mas falhou ao enviar módulos.");
            setLoading(false);
            setExtrasUploading(false);
            return;
          }
        }

        if (livreItems.length > 0) {
          try {
            setStatus("Enviando vídeos livres...");
            for (let j = 0; j < livreItems.length; j++) {
              const v = livreItems[j];
              const index = moduloItems.length + j;
              await uploadVideoToVimeo({
                file: v.file,
                titulo: v.titulo,
                duracao: v.duracao,
                conteudoId: conteudo.id,
                moduloId: null,
                onProgress: (percent) => {
                  if (totalExtras > 0) {
                    const overall = ((index + percent / 100) / totalExtras) * 100;
                    setExtraUploadProgress(Math.round(overall));
                  }
                },
              });

              if (totalExtras > 0) {
                const overall = ((index + 1) / totalExtras) * 100;
                setExtraUploadProgress(Math.round(overall));
              }
            }
          } catch (err) {
            console.error("Erro ao enviar vídeos livres:", err);
            setStatus("Conteúdo criado, mas falhou ao enviar vídeos livres.");
            setLoading(false);
            setExtrasUploading(false);
            return;
          }
        }

        if (totalExtras > 0) {
          setExtrasUploading(false);
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
    formData,
    videoFile,
    thumbnailDesktop,
    thumbnailMobile,
    thumbnailDestaque,
    modulos,
    videosLivres,
    navigate,
    uploadVideoToVimeo,
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
