import React from "react";
import {
  Box,
  Button,
  Checkbox,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import theme from "../../theme/theme";
import { useCadastrarConteudo } from "../../context/CadastrarConteudoContext";

const Step3ExtrasUpload = () => {
  const {
    formData,
    setFormData,
    updateField,
    instrutores,
    tags,
    thumbnailDesktop,
    thumbnailMobile,
    thumbnailDestaque,
    setThumbnailDesktop,
    setThumbnailMobile,
    setThumbnailDestaque,
    videoFile,
    setVideoFile,
    handleClearDraft,
  } = useCadastrarConteudo();
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        ⚙️ Extras e Upload
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(2, 1fr)",
        }}
      >
        <TextField
          type="datetime-local"
          fullWidth
          label="Data de Criação"
          InputLabelProps={{ shrink: true }}
          value={formData.dataCriacao}
          onChange={updateField("dataCriacao")}
        />

        <TextField
          select
          fullWidth
          label="Conteúdo Gratuito"
          value={formData.gratuitoTipo}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              gratuitoTipo: e.target.value,
              gratuitoDataFim:
                String(e.target.value).toUpperCase() === "TEMPORARIO"
                  ? prev.gratuitoDataFim
                  : "",
            }))
          }
        >
          <MenuItem value="NENHUM">Nenhum</MenuItem>
          <MenuItem value="PERMANENTE">Permanente</MenuItem>
          <MenuItem value="TEMPORARIO">Temporário</MenuItem>
        </TextField>

        {String(formData.gratuitoTipo).toUpperCase() === "TEMPORARIO" && (
          <TextField
            type="date"
            fullWidth
            label="Gratuito até"
            InputLabelProps={{ shrink: true }}
            value={formData.gratuitoDataFim}
            onChange={updateField("gratuitoDataFim")}
          />
        )}
      </Box>

      <TextField
        select
        fullWidth
        label="Instrutores"
        value={formData.instrutorIds}
        onChange={(e) => {
          const value = e.target.value;
          setFormData((prev) => ({
            ...prev,
            instrutorIds: typeof value === "string" ? value.split(",") : value,
          }));
        }}
        SelectProps={{
          multiple: true,
          renderValue: (selected) =>
            selected?.length > 0
              ? instrutores
                  .filter((i) => selected.includes(i.id))
                  .map((i) => i.nome)
                  .join(", ")
              : "",
        }}
        sx={{ mb: 2, mt: 2 }}
      >
        {instrutores.map((i) => (
          <MenuItem key={i.id} value={i.id}>
            <Checkbox checked={(formData.instrutorIds || []).includes(i.id)} />
            <ListItemText primary={i.nome} />
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        label="Tags"
        value={formData.tagIds}
        onChange={(e) => {
          const value = e.target.value;
          setFormData((prev) => ({
            ...prev,
            tagIds: typeof value === "string" ? value.split(",") : value,
          }));
        }}
        SelectProps={{
          multiple: true,
          renderValue: (selected) =>
            selected?.length > 0
              ? tags
                  .filter((t) => selected.includes(t.id))
                  .map((t) => `#${t.nome}`)
                  .join(", ")
              : "",
        }}
        sx={{ mb: 2 }}
      >
        {tags.map((t) => (
          <MenuItem key={t.id} value={t.id}>
            <Checkbox checked={(formData.tagIds || []).includes(t.id)} />
            <ListItemText primary={`#${t.nome}`} />
          </MenuItem>
        ))}
      </TextField>

      <Typography sx={{ mb: 2 }}>📷✨ Thumbnails</Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "120px",
        }}
      >
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.divider,
            color: "#fff",
            "&:hover": { borderColor: theme.palette.divider },
          }}
        >
          Thumbnail Desktop
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setThumbnailDesktop(e.target.files?.[0] ?? null)}
          />
        </Button>

        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.divider,
            color: "#fff",
            "&:hover": { borderColor: theme.palette.divider },
          }}
        >
          Thumbnail Mobile
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setThumbnailMobile(e.target.files?.[0] ?? null)}
          />
        </Button>

        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.divider,
            color: "#fff",
            "&:hover": { borderColor: theme.palette.divider },
          }}
        >
          Thumbnail Destaque
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setThumbnailDestaque(e.target.files?.[0] ?? null)}
          />
        </Button>
      </Box>

      <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
        {thumbnailDesktop?.name && (
          <Typography variant="body2">Desktop: {thumbnailDesktop.name}</Typography>
        )}
        {thumbnailMobile?.name && (
          <Typography variant="body2">Mobile: {thumbnailMobile.name}</Typography>
        )}
        {thumbnailDestaque?.name && (
          <Typography variant="body2">Destaque: {thumbnailDestaque.name}</Typography>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px dashed ${theme.palette.divider}`,
          backgroundColor: alpha("#000", 0.08),
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body1" sx={{ color: "#fff" }}>
            🎥 Vídeo introdutório (obrigatório)
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{
              borderRadius: 2,
              borderColor: alpha(theme.palette.primary.light, 0.25),
              color: "#fff",
              "&:hover": { borderColor: alpha(theme.palette.primary.light, 0.35) },
            }}
          >
            {videoFile ? "Alterar Vídeo" : "Selecionar Vídeo"}
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </Button>
        </Box>

        {videoFile && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9, color: "#fff" }}>
            {videoFile.name} — {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClearDraft}
          sx={{ color: "#fff", borderColor: alpha(theme.palette.primary.light, 0.25) }}
        >
          Limpar dados
        </Button>
      </Box>
    </Box>
  );
};

export default Step3ExtrasUpload;
