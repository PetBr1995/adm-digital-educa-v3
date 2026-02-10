import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  alpha,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  TextField,
  LinearProgress,
} from "@mui/material";
import theme from "../../theme/theme";
import { CloudUpload, Delete, VideoFile } from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCadastrarConteudo } from "../../context/CadastrarConteudoContext";

const Step2VideosLivres = () => {
  const { videosLivres, setVideosLivres } = useCadastrarConteudo();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const getVideoDuration = (file) =>
    new Promise((resolve, reject) => {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        window.URL.revokeObjectURL(el.src);
        const seconds = Math.round(el.duration);
        resolve(Number.isFinite(seconds) ? seconds : 0);
      };
      el.onerror = () => reject(new Error("Erro ao ler duração do vídeo"));
      el.src = URL.createObjectURL(file);
    });

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (seconds) => {
    const s = Math.max(0, Number(seconds || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handlePickVideo = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Arquivo inválido. Selecione um vídeo.");
      return;
    }

    try {
      const duracao = await getVideoDuration(file);

      const newItem = {
        id: Date.now(),
        file,
        titulo: file.name.replace(/\.[^/.]+$/, ""),
        duracao,
        progress: 0,
        status: "pending",
      };

      // ✅ salva no pai (CadastrarConteudo)
      setVideosLivres((prev) => [...prev, newItem]);
    } catch (e) {
      console.error(e);
      alert("Erro ao processar a duração do vídeo.");
    }
  };

  const handleInputChange = async (e) => {
    const file = e.target.files?.[0];
    await handlePickVideo(file);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    await handlePickVideo(file);
  };

  const handleRemove = (id) => {
    setVideosLivres((prev) => prev.filter((v) => v.id !== id));
  };

  const handleTitleChange = (id, titulo) => {
    setVideosLivres((prev) =>
      prev.map((v) => (v.id === id ? { ...v, titulo } : v))
    );
  };

  return (
    <>
      <HelpOutlineIcon />

      <Box sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, borderRadius: "6px" }}>
        <Typography sx={{ mt: 1 }}>🎥 Selecionar vídeos</Typography>

        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          sx={{
            p: 3,
            mt: 2,
            minHeight: "300px",
            borderRadius: "10px",
            border: "2px solid transparent",
            borderImage: `repeating-linear-gradient(
              45deg,
              ${alpha("#ffffff", isDragging ? 0.6 : 0.35)} 0 10px,
              transparent 10px 20px
            ) 1 round`,
            backgroundColor: alpha("#0F3663", isDragging ? 0.35 : 0.25),
            transition: "all .2s ease",
            "&:hover": {
              cursor: "pointer",
              borderImage: `repeating-linear-gradient(
                45deg,
                ${alpha(theme.palette.primary.dark, 1)} 0 10px,
                transparent 10px 20px
              ) 1 round`,
              backgroundColor: alpha("#0F3663", 0.35),
            },
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            disableRipple
            onClick={(e) => e.stopPropagation()}
            sx={{
              py: 2,
              borderRadius: "8px",
              border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
              color: "#ffffff",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: alpha("#0F3663", 0.6),
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              transition: "all .2s ease",
              "&:hover": {
                borderColor: theme.palette.primary.light,
                backgroundColor: alpha("#0F3663", 0.75),
              },
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            Adicionar vídeo
            <input ref={inputRef} type="file" accept="video/*" hidden onChange={handleInputChange} />
          </Button>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 1,
              opacity: 0.7,
              color: "#ffffff",
            }}
          >
            {isDragging ? "Solte o vídeo aqui" : "Clique para selecionar ou arraste um vídeo"}
          </Typography>

          {/* ✅ LISTA (agora é do pai) */}
          {videosLivres?.length > 0 && (
            <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
              {videosLivres.map((v) => (
                <Box
                  key={v.id}
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    border: `1px solid ${alpha("#ffffff", 0.18)}`,
                    backgroundColor: alpha("#0F3663", 0.35),
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha("#fff", 0.12), color: "#fff" }}>
                      <VideoFile />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: "#fff", fontWeight: 700 }} noWrap>
                        {v.file?.name || v.fileName || "Arquivo não disponível"}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={formatFileSize(v.file?.size ?? v.fileSize)}
                          sx={{ color: "#fff" }}
                          variant="outlined"
                        />
                        <Chip size="small" label={`Duração: ${formatDuration(v.duracao)}`} sx={{ color: "#fff" }} variant="outlined" />
                      </Box>
                    </Box>

                    <Tooltip title="Remover vídeo">
                      <IconButton
                        onClick={() => handleRemove(v.id)}
                        sx={{
                          borderRadius: "8px",
                          color: alpha("#FF2C2C", 0.9),
                          border: `1px solid ${alpha("#FF2C2C", 0.35)}`,
                          "&:hover": { backgroundColor: alpha("#FF2C2C", 0.12) },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <TextField
                    fullWidth
                    margin="normal"
                    required
                    label="Título do vídeo"
                    value={v.titulo}
                    onChange={(e) => handleTitleChange(v.id, e.target.value)}
                    sx={{
                      mt: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2, color: "#fff" },
                      "& .MuiInputLabel-root": { color: alpha("#fff", 0.75) },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha("#fff", 0.25) },
                    }}
                  />

                  {v.status === "uploading" && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress variant="determinate" value={v.progress || 0} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Step2VideosLivres;
