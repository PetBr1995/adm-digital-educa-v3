import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Divider,
    Checkbox,
    ListItemText,
    LinearProgress,
    Paper,
    alpha,
    Dialog,
    IconButton,
} from "@mui/material";
import theme from "../theme/theme";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CheckIcon from "@mui/icons-material/Check";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useEffect, useMemo, useState } from "react";
import { Add, CloudUpload, Delete, People } from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import * as tus from "tus-js-client";

const STORAGE_KEY = "cadastrar_conteudo_draft_v2";

const CadastrarConteudo = () => {
    const navigate = useNavigate();

    // =========================
    // Draft (localStorage)
    // =========================
    const [formData, setFormData] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved
                ? JSON.parse(saved)
                : {
                    // step 1
                    titulo: "",
                    descricao: "",
                    aprendizagem: "",
                    prerequisitos: "",
                    tipoConteudo: "",
                    categoriaId: "",
                    subcategoriaId: "",
                    nivel: "",

                    // step 3 (extras)
                    dataCriacao: "",
                    destaque: false,
                    gratuitoTipo: "NENHUM",
                    gratuitoDataFim: "",

                    instrutorIds: [],
                    tagIds: []
                };
        } catch {
            return {
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
                tagIds: []
            };
        }
    });

    const [step, setStep] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return 1;
            const parsed = JSON.parse(saved);
            return parsed?.__step ? parsed.__step : 1;
        } catch {
            return 1;
        }
    });

    const [abaAtiva, setAbaAtiva] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return "MODULOS";
            const parsed = JSON.parse(saved);
            return parsed?.__aba ? parsed.__aba : "MODULOS";
        } catch {
            return "MODULOS";
        }
    });

    useEffect(() => {
        const toSave = { ...formData, __step: step, __aba: abaAtiva };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }, [formData, step, abaAtiva]);

    const updateField = (field) => (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // =========================
    // Lists
    // =========================
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [instrutores, setInstrutores] = useState([]);
    const [tags, setTags] = useState([]);


    const [showFormModulo, setShowFormModulo] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const listarCategorias = async () => {
            try {
                const res = await api.get("/categorias/list", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const normalized = (res.data || []).map((c) => ({
                    id: String(c._id ?? c.id ?? ""),
                    nome: String(c.nome ?? c.title ?? "")
                }));

                setCategorias(normalized);
            } catch (err) {
                console.log(err);
                setCategorias([]);
            }
        };

        const listarSubcategorias = async () => {
            api.get("/subcategorias/list", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }).then(function (response) {
                setSubcategorias(response.data)
                console.log(response)
            }).catch(function (error) {
                console.log(error)
            })

        };

        const listarInstrutores = async () => {
            try {
                const res = await api.get("/instrutor", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data?.instrutores ?? res.data ?? [];
                const normalized = (Array.isArray(data) ? data : []).map((i) => ({
                    id: String(i._id ?? i.id ?? i._idstr ?? ""),
                    nome: String(i.nome ?? i.name ?? i.nomeCompleto ?? "Sem nome")
                }));

                setInstrutores(normalized);
            } catch (err) {
                console.log(err);
                setInstrutores([]);
            }
        };

        const listarTags = async () => {
            try {
                const res = await api.get("/tags", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const normalized = (res.data || [])
                    .map((t) => ({
                        id: String(t._id ?? t.id ?? ""),
                        nome: String(t.nome ?? t.name ?? "")
                    }))
                    .filter((t) => {
                        const nome = t.nome.trim();
                        return nome !== "" && isNaN(Number(nome));
                    });

                setTags(normalized);
            } catch (err) {
                console.log(err);
                setTags([]);
            }
        };

        listarCategorias();
        listarSubcategorias();
        listarInstrutores();
        listarTags();
    }, []);

    const subcategoriasFiltradas = useMemo(() => {
        const catId = String(formData.categoriaId || "");
        if (!catId) return [];
        return subcategorias.filter((s) => String(s.categoriaId) === catId);
    }, [subcategorias, formData.categoriaId]);

    // quando muda categoria, zera subcategoria
    useEffect(() => {
        setFormData((prev) => {
            const catId = String(prev.categoriaId || "");
            const subId = String(prev.subcategoriaId || "");
            if (!catId) return { ...prev, subcategoriaId: "" };
            // se sub atual não pertence à categoria, zera
            const ok = subcategorias.some(
                (s) => String(s.id) === subId && String(s.categoriaId) === catId
            );
            return ok ? prev : { ...prev, subcategoriaId: "" };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.categoriaId, subcategorias.length]);

    // =========================
    // Files (não salvar no localStorage)
    // =========================
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailDesktop, setThumbnailDesktop] = useState(null);
    const [thumbnailMobile, setThumbnailMobile] = useState(null);
    const [thumbnailDestaque, setThumbnailDestaque] = useState(null);

    // =========================
    // Upload state
    // =========================
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    // =========================
    // Validações por step
    // =========================
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
        formData.nivel
    ]);

    // step 2 (abas) sem validação obrigatória por enquanto
    const step2Valid = true;

    const step3Valid = useMemo(() => {
        // vídeo obrigatório (como no antigo)
        return !!videoFile;
    }, [videoFile]);

    const handleNext = () => {
        if (step === 1 && !step1Valid) return;
        if (step === 2 && !step2Valid) return;
        setStep((s) => Math.min(3, s + 1));
    };

    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const handleClearDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
        setFormData({
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
            tagIds: []
        });
        setStep(1);
        setAbaAtiva("MODULOS");
        setVideoFile(null);
        setThumbnailDesktop(null);
        setThumbnailMobile(null);
        setThumbnailDestaque(null);
        setStatus("");
        setUploadProgress(0);
        setLoading(false);
    };

    // =========================
    // Submit final (multipart + tus)
    // =========================
    const handleSubmitFinal = async () => {
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

        const tipoGratuito = (formData.gratuitoTipo || "NENHUM").toUpperCase();
        const gratuitoAte =
            tipoGratuito === "TEMPORARIO" && formData.gratuitoDataFim
                ? formData.gratuitoDataFim
                : null;

        // payload base (compatível com o antigo)
        const conteudoData = {
            titulo: formData.titulo,
            descricao: formData.descricao,
            tipo: formData.tipoConteudo,
            level: formData.nivel,
            aprendizagem: formData.aprendizagem,
            requisitos: formData.prerequisitos,

            // ids como string (evita quebrar se for Mongo _id)
            categoriaId: String(formData.categoriaId),
            ...(formData.subcategoriaId ? { subcategoriaId: String(formData.subcategoriaId) } : {}),

            dataCriacao: formData.dataCriacao,
            destaque: !!formData.destaque,

            gratuitoTipo: tipoGratuito,
            ...(gratuitoAte ? { gratuitoAte } : {}),
            fileSize: videoFile?.size
        };

        const fd = new FormData();
        Object.entries(conteudoData).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") fd.append(k, v);
        });

        // arrays
        (formData.instrutorIds || []).forEach((id) => fd.append("instrutorIds[]", String(id)));
        (formData.tagIds || []).forEach((ids) => fd.append("tags[]", String(Rds)));

        // thumbnails
        if (thumbnailDesktop) fd.append("thumbnailDesktop", thumbnailDesktop);
        if (thumbnailMobile) fd.append("thumbnailMobile", thumbnailMobile);
        if (thumbnailDestaque) fd.append("thumbnailDestaque", thumbnailDestaque);

        try {
            const res = await api.post("/conteudos/create", fd, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            const { vimeoUploadLink, conteudo } = res.data;

            if (!vimeoUploadLink) {
                setStatus("Erro: link de upload do Vimeo não retornado.");
                setLoading(false);
                return;
            }

            setStatus("Enviando vídeo para o Vimeo...");
            setUploadProgress(0);

            const upload = new tus.Upload(videoFile, {
                uploadUrl: vimeoUploadLink,
                metadata: {
                    filename: videoFile.name,
                    filetype: videoFile.type
                },
                onError: (err) => {
                    console.error("Erro no upload:", err);
                    setStatus("Erro ao enviar vídeo.");
                    setLoading(false);
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    const percent = Math.round((bytesUploaded / bytesTotal) * 100);
                    setUploadProgress(percent);
                    setStatus(`Enviando vídeo... ${percent}%`);
                },
                onSuccess: async () => {
                    try {
                        await api.post(
                            `/vimeo-client/update-metadata/${conteudo.id}`,
                            {
                                name: conteudo.titulo,
                                description: conteudo.descricao || ""
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        setStatus("Conteúdo criado com sucesso!");
                        localStorage.removeItem(STORAGE_KEY);

                        setLoading(false);
                        navigate("/conteudos");
                    } catch (err) {
                        console.error("Erro ao atualizar metadata:", err);
                        setStatus("Conteúdo criado, mas falhou ao atualizar metadata.");
                        setLoading(false);
                    }
                }
            });

            upload.start();
        } catch (err) {
            console.error("Erro ao criar conteúdo:", err.response?.data || err);
            setStatus("Erro ao criar conteúdo.");
            setLoading(false);
        }
    };

    // =========================
    // Step 2 pages (layout mantido)
    // =========================
    const PaginaModulos = () => {
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
                {
                    showFormModulo && (

                        <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, my: 2, borderRadius: "6px" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography>📝 Informações Básicas</Typography>
                                <IconButton onClick={() => setShowFormModulo(false)} sx={{ borderRadius: "6px", color: alpha("#FF2C2C", 0.8), border: `1px solid ${alpha("#FF2C2C", 0.3)}` }}>
                                    <Delete />
                                </IconButton>
                            </Box>
                            <TextField fullWidth margin="normal" required placeholder="Título do modulo:" />
                            <TextField fullWidth margin="normal" required placeholder="Subtítulo do modulo:" />
                            <TextField fullWidth margin="normal" multiline rows={3} required placeholder="Descrição do módulo:" />
                            <Typography sx={{ mt: 2 }}>🎥 Selecionar Vídeo</Typography>
                            <Box
                                sx={{
                                    p: 3,
                                    mt: 2,
                                    height: "300px",
                                    borderRadius: "10px",
                                    // 🔥 dashed controlado em todos os lados
                                    border: "2px solid transparent",
                                    borderImage: `repeating-linear-gradient(
                                                45deg,
                                                ${alpha("#ffffff", 0.35)} 0 10px,
                                                transparent 10px 20px
                                                ) 1 round`,

                                    backgroundColor: alpha("#0F3663", 0.25),

                                    transition: "all .2s ease",

                                    "&:hover": {
                                        cursor: "pointer",
                                        borderImage: `repeating-linear-gradient(
                                                45deg,
                                                ${alpha(theme.palette.primary.dark, 1)} 0 10px,
                                                transparent 10px 20px
                                            ) 1 round`,
                                        backgroundColor: alpha("#0F3663", 0.35)
                                    }
                                }}
                            >

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    disableRipple
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
                                            backgroundColor: alpha("#0F3663", 0.75)
                                        },

                                        "&:active": {
                                            transform: "scale(0.98)"
                                        }
                                    }}
                                >
                                    Selecione o vídeo
                                    <input type="file" accept="video/*" hidden />
                                </Button>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        textAlign: "center",
                                        mt: 1,
                                        opacity: 0.7
                                    }}
                                >
                                    Clique para selecionar ou arraste um vídeo
                                </Typography>
                            </Box>

                        </Box>
                    )}
            </>
        );
    };

    const PaginaVideosLivres = () => {
        return (
            <>
                <HelpOutlineIcon />
                <Box sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, borderRadius: "6px" }}>
                    <Typography sx={{ mt: 1 }}>🎥 Selecionar vídeos</Typography>
                    <Box
                        sx={{
                            p: 3,
                            mt: 2,
                            height: "300px",
                            borderRadius: "10px",
                            // 🔥 dashed controlado em todos os lados
                            border: "2px solid transparent",
                            borderImage: `repeating-linear-gradient(
                                                45deg,
                                                ${alpha("#ffffff", 0.35)} 0 10px,
                                                transparent 10px 20px
                                                ) 1 round`,

                            backgroundColor: alpha("#0F3663", 0.25),

                            transition: "all .2s ease",

                            "&:hover": {
                                cursor: "pointer",
                                borderImage: `repeating-linear-gradient(
                                                45deg,
                                                ${alpha(theme.palette.primary.dark, 1)} 0 10px,
                                                transparent 10px 20px
                                            ) 1 round`,
                                backgroundColor: alpha("#0F3663", 0.35)
                            }
                        }}
                    >

                        <Button
                            fullWidth
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            disableRipple
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
                                    backgroundColor: alpha("#0F3663", 0.75)
                                },

                                "&:active": {
                                    transform: "scale(0.98)"
                                }
                            }}
                        >
                            Selecione o vídeo
                            <input type="file" accept="video/*" hidden />
                        </Button>

                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                textAlign: "center",
                                mt: 1,
                                opacity: 0.7
                            }}
                        >
                            Clique para selecionar ou arraste um vídeo
                        </Typography>
                    </Box>
                </Box>
            </>
        )
    };

    return (
        <>
            <Box
                sx={{
                    bgcolor: theme.palette.secondary.light,
                    maxWidth: "900px",
                    mx: "auto",
                    borderRadius: "6px",
                    border: `1px solid ${theme.palette.divider}`
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        pb: 2,
                        px: 2,
                        my: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <Typography variant="h5">Dados do novo conteúdo</Typography>

                    <Box
                        sx={{
                            width: "300px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        {/* STEP 1 */}
                        <Box
                            sx={{
                                position: "relative",
                                bgcolor:
                                    step > 1
                                        ? "#0BBE76"
                                        : step === 1
                                            ? theme.palette.primary.light
                                            : theme.palette.secondary.dark,
                                borderRadius: "50%",
                                width: 45,
                                height: 45,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color:
                                    step >= 1 ? "#ffffff": theme.palette.secondary.light,
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    borderRadius: "2px",
                                    top: 20,
                                    right: -78,
                                    width: "74px",
                                    height: "4px",
                                    bgcolor:
                                        step > 1 ? "#0BBE76" : theme.palette.secondary.dark,
                                    zIndex: 10
                                }
                            }}
                        >
                            <ListAltIcon />
                        </Box>

                        {/* STEP 2 */}
                        <Box
                            sx={{
                                position: "relative",
                                borderRadius: "50%",
                                width: 45,
                                height: 45,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor:
                                    step > 2
                                        ? "#0BBE76"
                                        : step === 2
                                            ? theme.palette.primary.light
                                            : theme.palette.secondary.dark,
                                color:
                                    step >= 2 ? "#ffffff" : theme.palette.primary.light,
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    borderRadius: "2px",
                                    top: 20,
                                    right: -79,
                                    width: "74px",
                                    height: "4px",
                                    bgcolor:
                                        step > 2 ? "#0BBE76" : theme.palette.secondary.dark
                                }
                            }}
                        >
                            <SlideshowIcon />
                        </Box>

                        {/* STEP 3 */}
                        <Box
                            sx={{
                                borderRadius: "50%",
                                width: 45,
                                height: 45,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor:
                                    step === 3
                                        ? theme.palette.primary.light
                                        : step > 3
                                            ? "green"
                                            : theme.palette.secondary.dark,
                                color:
                                    step >= 3 ? "#ffffff" : theme.palette.primary.light
                            }}
                        >
                            <CheckIcon />
                        </Box>
                    </Box>
                </Box>


                {/* status / progress (sem mexer no layout: aparece como uma faixinha) */}
                {(status || loading) && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        {status && (
                            <Typography sx={{ mb: 1, color: "#fff", opacity: 0.9 }}>
                                {status}
                            </Typography>
                        )}
                        {loading && (
                            <LinearProgress
                                variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
                                value={uploadProgress > 0 ? uploadProgress : undefined}
                                sx={{
                                    height: 8,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.primary.light, 0.15),
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: theme.palette.primary.light
                                    }
                                }}
                            />
                        )}
                    </Box>
                )}

                {/* STEP 1 */}
                {step === 1 && (
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
                                        titulo: e.target.value.slice(0, 100)
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
                                        descricao: e.target.value.slice(0, 500)
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
                                        aprendizagem: e.target.value.slice(0, 500)
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
                                        prerequisitos: e.target.value.slice(0, 500)
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
                                    gridTemplateColumns: "repeat(2, 1fr)"
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
                                            subcategoriaId: ""
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
                        </Box>
                    </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "start",
                                alignItems: "center",
                                gap: 2,
                                px: 2,
                                borderBottom: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Button
                                disableRipple
                                onClick={() => setAbaAtiva("MODULOS")}
                                sx={{
                                    borderRadius: 0,
                                    "&:hover": { backgroundColor: "transparent" },
                                    "&:active": { backgroundColor: "transparent" },
                                    borderBottom:
                                        abaAtiva === "MODULOS"
                                            ? `2px solid ${theme.palette.primary.light}`
                                            : "none"
                                }}
                            >
                                Gerenciar Módulos
                            </Button>

                            <Button
                                disableRipple
                                onClick={() => setAbaAtiva("VIDEOS")}
                                sx={{
                                    borderRadius: 0,
                                    "&:hover": { backgroundColor: "transparent" },
                                    "&:active": { backgroundColor: "transparent" },
                                    borderBottom:
                                        abaAtiva === "VIDEOS"
                                            ? `2px solid ${theme.palette.primary.light}`
                                            : "none"
                                }}
                            >
                                Vídeos Livres
                            </Button>
                        </Box>

                        <Box sx={{ px: 2, py: 2 }}>
                            {abaAtiva === "MODULOS" ? <PaginaModulos /> : <PaginaVideosLivres />}
                        </Box>
                    </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <>
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                ⚙️ Extras e Upload
                            </Typography>

                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 2,
                                    gridTemplateColumns: "repeat(2, 1fr)"
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
                                                    : ""
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


                            {/* Instrutores */}
                            <TextField
                                select
                                fullWidth
                                label="Instrutores"
                                value={formData.instrutorIds}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({
                                        ...prev,
                                        instrutorIds: typeof value === "string" ? value.split(",") : value
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
                                            : ""
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

                            {/* Tags */}
                            <TextField
                                select
                                fullWidth
                                label="Tags"
                                value={formData.tagIds}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({
                                        ...prev,
                                        tagIds: typeof value === "string" ? value.split(",") : value
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
                                            : ""
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

                            {/* Thumbnails */}
                            <Typography sx={{ mb: 2 }}>📷✨ Thumbnails</Typography>
                            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "120px" }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    sx={{
                                        borderRadius: 2,
                                        borderColor: theme.palette.divider,
                                        color: "#fff",
                                        "&:hover": { borderColor: theme.palette.divider }
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
                                        "&:hover": { borderColor: theme.palette.divider }
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
                                        "&:hover": { borderColor: theme.palette.divider }
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

                            {/* Vídeo */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px dashed ${theme.palette.divider}`,
                                    backgroundColor: alpha("#000", 0.08)
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
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
                                            "&:hover": { borderColor: alpha(theme.palette.primary.light, 0.35) }
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
                                <Button variant="outlined" onClick={handleClearDraft} sx={{ color: "#fff", borderColor: alpha(theme.palette.primary.light, 0.25) }}>
                                    Limpar dados
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}

                {/* Footer */}
                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        gap: 2,
                        justifyContent: "end",
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Button
                        onClick={() => navigate("/conteudos")}
                        variant="outlined"
                        sx={{ borderColor: theme.palette.divider, color: "#ffffff" }}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    {step > 1 && (
                        <Button variant="outlined" onClick={handleBack} sx={{ color: "#fff" }} disabled={loading}>
                            Voltar
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={loading || (step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                            sx={{ bgcolor: theme.palette.primary.light, fontWeight: 600 }}
                        >
                            Próximo
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleSubmitFinal}
                            disabled={loading || !step3Valid}
                            sx={{ bgcolor: theme.palette.primary.light, fontWeight: 600 }}
                        >
                            Cadastrar
                        </Button>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default CadastrarConteudo;
