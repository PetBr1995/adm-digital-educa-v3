import {
  ArrowBackRounded,
  PlayCircleRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import theme from "../theme/theme";
import {
  extractVimeoEmbedFromObject,
  resolveEmbedViaVimeoLinkEndpoint,
} from "../utils/vimeoPlayer";

const normalizePalestrantes = (conteudo) => {
  const list = Array.isArray(conteudo?.instrutores) ? conteudo.instrutores : [];
  return list
    .map((item) => {
      const raw = item?.instrutor ?? item ?? {};
      const nome = raw?.nome || "";
      if (!nome) return null;
      return {
        nome,
        formacao: raw?.formacao || "",
        sobre: raw?.sobre || "",
      };
    })
    .filter(Boolean);
};

const ConteudoPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const initialConteudo = location.state?.conteudo ?? null;

  const [conteudo, setConteudo] = useState(initialConteudo);
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id) {
        setError("Conteúdo inválido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        let candidate = initialConteudo;

        let resolved = await resolveEmbedViaVimeoLinkEndpoint(api, candidate);
        if (!resolved) resolved = extractVimeoEmbedFromObject(candidate);

        if (!resolved) {
          let response;
          try {
            response = await api.get(`/conteudos/${id}/admin`);
          } catch {
            response = await api.get(`/conteudos/${id}`);
          }
          const raw = response.data?.data ?? response.data?.conteudo ?? response.data ?? {};
          candidate = raw;
          resolved = await resolveEmbedViaVimeoLinkEndpoint(api, raw);
          if (!resolved) resolved = extractVimeoEmbedFromObject(raw);
        }

        if (!mounted) return;
        setConteudo(candidate);
        setEmbedUrl(resolved);
        if (!resolved) setError("Não foi possível localizar um link Vimeo para este conteúdo.");
      } catch (err) {
        if (!mounted) return;
        console.error("Erro ao carregar player do conteúdo:", err);
        setError("Falha ao carregar o conteúdo.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id, initialConteudo]);

  const thumbUrl = useMemo(() => {
    if (!conteudo?.thumbnailDesktop) return "";
    return `https://api.digitaleduca.com.vc/public/${conteudo.thumbnailDesktop}`;
  }, [conteudo]);
  const palestrantes = useMemo(() => normalizePalestrantes(conteudo), [conteudo]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Button
          variant="text"
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/conteudos")}
          sx={{ mb: 2, color: "#d4d4dd", textTransform: "none" }}
        >
          Voltar para conteúdos
        </Button>

        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background: "linear-gradient(180deg, rgba(24,24,44,0.88), rgba(15,15,30,0.96))",
            boxShadow: `0 24px 60px ${alpha("#000", 0.45)}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              bgcolor: "#07080f",
            }}
          >
            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <CircularProgress />
              </Stack>
            ) : embedUrl ? (
              <Box
                component="iframe"
                src={embedUrl}
                title="Player Vimeo do conteúdo"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                sx={{ width: "100%", height: "100%", border: 0 }}
              />
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", color: "#d8d8de", p: 2 }}>
                <PlayCircleRounded sx={{ fontSize: 56, opacity: 0.7, mb: 1 }} />
                <Typography>{error || "Vídeo indisponível."}</Typography>
              </Stack>
            )}

            {/* somente controles nativos do Vimeo por enquanto */}
          </Box>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
              <Box>
                <Typography sx={{ fontSize: 30, fontWeight: 800, color: "#f5f6fb", lineHeight: 1.15 }}>
                  {conteudo?.titulo || "Conteúdo"}
                </Typography>
                <Typography sx={{ mt: 1, color: alpha("#eef0ff", 0.76), maxWidth: 740 }}>
                  {conteudo?.descricao || "Reprodução do conteúdo selecionado."}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2, borderColor: alpha("#fff", 0.1) }} />

            <Typography sx={{ mb: 1.2, color: "#f5f6fb", fontWeight: 700 }}>
              Palestrante{palestrantes.length > 1 ? "s" : ""}
            </Typography>

            {palestrantes.length > 0 ? (
              <Stack spacing={1.2}>
                {palestrantes.map((p, idx) => (
                  <Box
                    key={`${p.nome}-${idx}`}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1.5,
                      bgcolor: alpha("#fff", 0.02),
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          bgcolor: "error.main",
                          color: "common.white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {p.nome.trim().charAt(0).toUpperCase()}
                      </Box>
                      <Box>
                        <Typography sx={{ color: "#f5f6fb", fontWeight: 700 }}>{p.nome}</Typography>
                        {p.formacao && (
                          <Typography sx={{ color: alpha("#eef0ff", 0.76), fontSize: 13 }}>
                            {p.formacao}
                          </Typography>
                        )}
                        {p.sobre && (
                          <Typography sx={{ mt: 0.5, color: alpha("#eef0ff", 0.66), fontSize: 13 }}>
                            {p.sobre}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: alpha("#eef0ff", 0.66) }}>
                Informações do palestrante não disponíveis para este conteúdo.
              </Typography>
            )}

            {thumbUrl && (
              <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden", maxWidth: 420 }}>
                <Box component="img" src={thumbUrl} alt={conteudo?.titulo || "thumbnail"} sx={{ width: "100%" }} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ConteudoPlayer;
