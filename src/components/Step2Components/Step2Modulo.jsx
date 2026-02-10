import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  alpha,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import theme from "../../theme/theme";
import { Add, CloudUpload, Delete, VideoFile } from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCadastrarConteudo } from "../../context/CadastrarConteudoContext";

const Step2Modulos = () => {
  const {
    showFormModulo,
    setShowFormModulo,
    modulos,
    setModulos,
  } = useCadastrarConteudo();
  // --- vídeo (1 por módulo) ---
  const [isDragging, setIsDragging] = useState(false);
  const [video, setVideo] = useState(null); // { file, titulo, duracao, status, progress }
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [descricao, setDescricao] = useState("");

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
      // se quiser, troque por snackbar/toast do seu padrão
      alert("Arquivo inválido. Selecione um vídeo.");
      return;
    }

    try {
      const duracao = await getVideoDuration(file);
      setVideo({
        file,
        titulo: file.name.replace(/\.[^/.]+$/, ""),
        duracao,
        status: "pending", // pending | uploading | success | error
        progress: 0,
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao processar a duração do vídeo.");
    }
  };

  const onInputChange = async (e) => {
    const file = e.target.files?.[0];
    await handlePickVideo(file);
    // permite re-selecionar o mesmo arquivo
    e.target.value = "";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    await handlePickVideo(file);
  };

  const uploadDisabled = useMemo(() => {
    // você controla aqui (ex: enquanto salvando módulo etc.)
    return false;
  }, []);

  const canSave =
    titulo.trim() !== "" &&
    subtitulo.trim() !== "" &&
    descricao.trim() !== "" &&
    !!video?.file;

  const handleSaveModulo = () => {
    if (!canSave) return;
    const newModulo = {
      id: Date.now(),
      titulo: titulo.trim(),
      subtitulo: subtitulo.trim(),
      descricao: descricao.trim(),
      video,
    };
    setModulos((prev) => [...prev, newModulo]);
    setTitulo("");
    setSubtitulo("");
    setDescricao("");
    setVideo(null);
    setShowFormModulo(false);
  };

  const handleRemoveModulo = (id) => {
    setModulos((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "start", alignItems: "center", gap: 1 }}>
        <Button
          onClick={() => setShowFormModulo((prev) => !prev)}
          variant="contained"
          startIcon={<Add sx={{ border: 1, borderRadius: "100%", color: "#ffffff" }} />}
          sx={{ color: "#ffffff", fontWeight: 600 }}
        >
          Novo Módulo
        </Button>
        <HelpOutlineIcon />
      </Box>

      {showFormModulo && (
        <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, my: 2, borderRadius: "6px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography>📝 Informações Básicas</Typography>
            <IconButton
              onClick={() => setShowFormModulo(false)}
              sx={{
                borderRadius: "6px",
                color: alpha("#FF2C2C", 0.8),
                border: `1px solid ${alpha("#FF2C2C", 0.3)}`,
              }}
            >
              <Delete />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            margin="normal"
            required
            label="Título do módulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            required
            label="Subtítulo do módulo"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            multiline
            rows={3}
            required
            label="Descrição do módulo"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <Typography sx={{ mt: 2 }}>🎥 Selecionar Vídeo</Typography>

          {/* DROPZONE (estilo do seu Step2, com drag&drop do exemplo) */}
          <Box
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
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
              disabled={uploadDisabled || video?.status === "uploading"}
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
              {video ? "Trocar vídeo" : "Selecione o vídeo"}
              <input type="file" accept="video/*" hidden onChange={onInputChange} />
            </Button>

            <Typography
              variant="caption"
              sx={{ display: "block", textAlign: "center", mt: 1, opacity: 0.7, color: "#fff" }}
            >
              {isDragging ? "Solte o vídeo aqui" : "Clique para selecionar ou arraste um vídeo"}
            </Typography>

            {/* Detalhes do vídeo selecionado */}
            {video && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: "10px",
                  border: `1px solid ${alpha("#ffffff", 0.18)}`,
                  backgroundColor: alpha("#0F3663", 0.35),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha("#fff", 0.12), color: "#fff" }}>
                    <VideoFile />
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: "#fff", fontWeight: 700 }} noWrap>
                      {video.file.name}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={formatFileSize(video.file.size)}
                        sx={{ color: "#fff", borderColor: alpha("#fff", 0.25) }}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`Duração: ${formatDuration(video.duracao)}`}
                        sx={{ color: "#fff", borderColor: alpha("#fff", 0.25) }}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={
                          video.status === "pending"
                            ? "Aguardando"
                            : video.status === "uploading"
                            ? "Enviando..."
                            : video.status === "success"
                            ? "Concluído"
                            : "Erro"
                        }
                        sx={{ color: "#fff", borderColor: alpha("#fff", 0.25) }}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Tooltip title="Remover vídeo">
                    <span>
                      <IconButton
                        onClick={() => setVideo(null)}
                        disabled={video.status === "uploading"}
                        sx={{
                          borderRadius: "8px",
                          color: alpha("#FF2C2C", 0.9),
                          border: `1px solid ${alpha("#FF2C2C", 0.35)}`,
                          "&:hover": { backgroundColor: alpha("#FF2C2C", 0.12) },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>

                <TextField
                  fullWidth
                  margin="normal"
                  required
                  label="Título do vídeo"
                  value={video.titulo}
                  onChange={(e) => setVideo((prev) => ({ ...prev, titulo: e.target.value }))}
                  disabled={video.status === "uploading" || video.status === "success"}
                  sx={{
                    mt: 2,
                    "& .MuiOutlinedInput-root": { borderRadius: 2, color: "#fff" },
                    "& .MuiInputLabel-root": { color: alpha("#fff", 0.75) },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha("#fff", 0.25),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha("#fff", 0.45),
                    },
                  }}
                />

                {video.status === "uploading" && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: alpha("#fff", 0.8) }}>
                        Enviando...
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha("#fff", 0.8) }}>
                        {video.progress.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={video.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha("#fff", 0.12),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* IMPORTANTE:
              Aqui você só seleciona o vídeo.
              O upload (tus/axios) você faz no submit do módulo, usando:
              - video.file
              - video.titulo
              - video.duracao
          */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={() => setShowFormModulo(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveModulo}
              disabled={!canSave}
              sx={{ fontWeight: 600 }}
            >
              Salvar módulo
            </Button>
          </Box>
        </Box>
      )}

      {modulos?.length > 0 && (
        <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
          {modulos.map((m) => (
            <Box
              key={m.id}
              sx={{
                p: 2,
                borderRadius: "10px",
                border: `1px solid ${alpha("#ffffff", 0.18)}`,
                backgroundColor: alpha("#0F3663", 0.25),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha("#fff", 0.12), color: "#fff" }}>
                  <VideoFile />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 700 }} noWrap>
                    {m.titulo}
                  </Typography>
                  <Typography sx={{ color: alpha("#fff", 0.75) }} noWrap>
                    {m.subtitulo}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={m.video?.file ? formatFileSize(m.video.file.size) : "Sem vídeo"}
                      sx={{ color: "#fff", borderColor: alpha("#fff", 0.25) }}
                      variant="outlined"
                    />
                    {m.video?.duracao !== undefined && (
                      <Chip
                        size="small"
                        label={`Duração: ${formatDuration(m.video.duracao)}`}
                        sx={{ color: "#fff", borderColor: alpha("#fff", 0.25) }}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                <Tooltip title="Remover módulo">
                  <IconButton
                    onClick={() => handleRemoveModulo(m.id)}
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
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default Step2Modulos;
