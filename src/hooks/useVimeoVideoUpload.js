import { useCallback, useState } from "react";
import * as tus from "tus-js-client";

/**
 * Hook para:
 * 1) POST /video/create
 * 2) tus upload pro Vimeo
 * 3) POST /vimeo-client/video/:id/update-metadata
 *
 * Dependências:
 * - api: sua instância axios (axiosInstance)
 */
export default function useVimeoVideoUpload(api) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const uploadVideoToVimeo = useCallback(
    async ({ file, titulo, duracao, conteudoId, moduloId = null, onProgress }) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      setIsUploading(true);
      setProgress(0);
      setStatus(`Preparando upload "${titulo}"...`);

      // 1) cria vídeo no backend
      const { data } = await api.post(
        "/video/create",
        {
          titulo: (titulo || file.name.replace(/\.[^/.]+$/, "")).trim(),
          duracao: Number(duracao || 0),
          moduloId: moduloId || null,
          conteudoId,
          fileSize: file.size,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dbVideoId = data.video?.id ?? data.id ?? data.videoId;
      const vimeoUploadLink = data.vimeoUploadLink;

      if (!dbVideoId || !vimeoUploadLink) {
        setIsUploading(false);
        throw new Error("Erro: ID ou link de upload não retornados pelo backend");
      }

      // 2) tus upload
      setStatus(`Enviando "${titulo}"...`);
      await new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
          uploadUrl: vimeoUploadLink,
          metadata: { filename: file.name, filetype: file.type },
          chunkSize: 100 * 1024 * 1024,
          onError: (err) => reject(err),
          onProgress: (bytesUploaded, bytesTotal) => {
            const percent = Math.round((bytesUploaded / bytesTotal) * 100);
            setProgress(percent);
            setStatus(`Enviando "${titulo}"... ${percent}%`);
            if (typeof onProgress === "function") {
              onProgress(percent, bytesUploaded, bytesTotal);
            }
          },
          onSuccess: resolve,
        });

        upload.start();
      });

      // 3) update metadata
      try {
        await api.post(
          `/vimeo-client/video/${dbVideoId}/update-metadata`,
          { name: titulo, description: "" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.log("Upload OK, mas metadata falhou:", e);
      }

      setStatus(`Upload concluído: "${titulo}"`);
      setIsUploading(false);
      return dbVideoId;
    },
    [api]
  );

  /**
   * Helper: faz upload de uma lista (sequencial)
   * items: [{ file, titulo, duracao, moduloId? }]
   */
  const uploadMany = useCallback(
    async ({ items, conteudoId, defaultModuloId = null }) => {
      for (let i = 0; i < items.length; i++) {
        const v = items[i];
        if (!v?.file) continue;

        await uploadVideoToVimeo({
          file: v.file,
          titulo: v.titulo,
          duracao: v.duracao,
          conteudoId,
          moduloId: v.moduloId ?? defaultModuloId,
        });
      }
    },
    [uploadVideoToVimeo]
  );

  return {
    uploadVideoToVimeo,
    uploadMany,
    progress,
    status,
    isUploading,
    setStatus, // opcional se você quiser setar mensagens externas
    setProgress,
  };
}
