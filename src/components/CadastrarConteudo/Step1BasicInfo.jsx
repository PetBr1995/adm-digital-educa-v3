import React from "react";
import { Box, Checkbox, MenuItem, TextField, Typography } from "@mui/material";
import { WorkspacePremium } from "@mui/icons-material";
import theme from "../../theme/theme";
import { useCadastrarConteudo } from "../../context/CadastrarConteudoContext";

const Step1BasicInfo = () => {
  const {
    formData,
    setFormData,
    categorias,
    subcategorias,
    updateField,
  } = useCadastrarConteudo();
  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">📝 Informações básicas</Typography>
        <TextField
          fullWidth
          margin="normal"
          placeholder="Título do conteúdo:"
          required
          value={formData.titulo}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              titulo: e.target.value.slice(0, 100),
            }))
          }
          inputProps={{ maxLength: 100 }}
          helperText={`${formData.titulo.length}/100 caracteres`}
        />
        <TextField
          fullWidth
          margin="normal"
          placeholder="Descrição"
          multiline
          rows={3}
          required
          value={formData.descricao}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              descricao: e.target.value.slice(0, 500),
            }))
          }
          inputProps={{ maxLength: 500 }}
          helperText={`${formData.descricao.length}/500 caracteres`}
        />
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h6">🎯 Aprendizagem e pré-requisitos</Typography>
        <TextField
          fullWidth
          margin="normal"
          placeholder="O que o aluno vai aprender:"
          multiline
          rows={3}
          value={formData.aprendizagem}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              aprendizagem: e.target.value.slice(0, 500),
            }))
          }
          inputProps={{ maxLength: 500 }}
          helperText={`${formData.aprendizagem.length}/500 caracteres`}
        />
        <TextField
          fullWidth
          margin="normal"
          placeholder="Pré-requisitos"
          multiline
          rows={3}
          value={formData.prerequisitos}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              prerequisitos: e.target.value.slice(0, 500),
            }))
          }
          inputProps={{ maxLength: 500 }}
          helperText={`${formData.prerequisitos.length}/500 caracteres`}
        />
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ⚙️ Configurações
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          <TextField
            select
            label="Tipo de conteúdo:"
            fullWidth
            value={formData.tipoConteudo}
            onChange={updateField("tipoConteudo")}
          >
            <MenuItem value="AULA">Aula</MenuItem>
            <MenuItem value="PALESTRA">Palestra</MenuItem>
            <MenuItem value="PODCAST">Podcast</MenuItem>
          </TextField>

          <TextField
            select
            label="Categoria:"
            fullWidth
            value={formData.categoriaId}
            onChange={(e) => {
              const newCat = e.target.value ?? "";
              setFormData((prev) => ({
                ...prev,
                categoriaId: newCat,
                subcategoriaId: "",
              }));
            }}
          >
            <MenuItem value="">Selecione uma categoria...</MenuItem>
            {categorias.map((categoria) => (
              <MenuItem key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Nivel:"
            fullWidth
            value={formData.nivel}
            onChange={updateField("nivel")}
          >
            <MenuItem value="Iniciante">Iniciante</MenuItem>
            <MenuItem value="Intermediario">Intermediário</MenuItem>
            <MenuItem value="Avancado">Avançado</MenuItem>
          </TextField>

          <TextField
            select
            label="Subcategoria:"
            fullWidth
            value={formData.subcategoriaId}
            onChange={updateField("subcategoriaId")}
            disabled={!formData.categoriaId}
          >
            <MenuItem value="">Selecione uma subcategoria...</MenuItem>
            {subcategorias.map((subcategoria) => (
              <MenuItem key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nome}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "start", alignItems: "center" }}>
          <Checkbox
            checked={!!formData.destaque}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, destaque: e.target.checked }))
            }
            sx={{ "&:hover": { backgroundColor: "transparent" } }}
          />
          <label style={{ fontSize: "18px" }}>Destaque</label>
          <WorkspacePremium sx={{ color: theme.palette.primary.light }} />
        </Box>
      </Box>
    </>
  );
};

export default Step1BasicInfo;
