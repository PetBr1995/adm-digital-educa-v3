import { alpha, Box, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import theme from "../../theme/theme";

const ContentDashboard = () => {
    const [conteudos, setConteudos] = useState(null);

    useEffect(() => {
        axios
            .get("https://api.digitaleduca.com.vc/dashboard/videos", {
                headers: {
                    Authorization:
                        "Dashboard FDYWmkzwEDhacggv6tIZhHsqhz8FSkqVbsqR1QYsL722i8lRr9kFTiWofUmAYDQqvT3w8IcpjJwS9DqEkUpdmBtRzJEg9Ivy25jEXezoaMxpUvlFlct37ZQ4DOpMie",
                },
            })
            .then((response) => setConteudos(response.data))
            .catch(console.log);
    }, []);

    const cards = useMemo(
        () => [
            { label: "Mais assistido", data: conteudos?.maisAssistido },
            { label: "Melhor avaliado", data: conteudos?.melhorAvaliado },
            { label: "Menos assistido", data: conteudos?.menosAssistido },
            { label: "Pior avaliado", data: conteudos?.piorAvaliado },
        ],
        [conteudos]
    );

    const Metric = ({ title, value }) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
                sx={{
                    fontSize: 12,
                    color: alpha(theme.palette.text.primary, 0.65),
                    lineHeight: 1.2,
                }}
            >
                {title}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                {value ?? "-"}
            </Typography>
        </Box>
    );

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
                gap: 2,
                width: "100%",
                mt: 2,
                maxWidth: "1200px"
            }}
        >
            {cards.map((item) => {
                const d = item.data;

                // formatações básicas
                const nota = typeof d?.notaMedia === "number" ? d.notaMedia.toFixed(1) : d?.notaMedia;
                const taxa = d?.taxaConclusao != null ? `${d.taxaConclusao}%` : null;

                return (
                    <Box
                        key={item.label}
                        sx={{
                            p: 2,
                            borderRadius: "8px",
                            borderBottom: `3px solid ${theme.palette.primary.light}`,
                            background: theme.palette.secondary.light,
                            boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.06)}`,
                            transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            minHeight: 170,
                        }}
                    >
                        {/* Topo */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: theme.palette.primary.main,
                                    background: alpha(theme.palette.primary.main, 0.10),
                                    px: 1.2,
                                    py: 0.6,
                                    borderRadius: 999,
                                }}
                            >
                                {item.label}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: alpha(theme.palette.text.primary, 0.6),
                                    fontWeight: 700,
                                }}
                            >
                                {d?.visualizacoes != null ? `${d.visualizacoes} views` : "-"}
                            </Typography>
                        </Box>

                        {/* Título */}
                        <Typography
                            sx={{
                                fontSize: 16,
                                fontWeight: 900,
                                lineHeight: 1.2,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {d?.titulo ?? "—"}
                        </Typography>

                        {/* Conteúdo 
            <Typography
              sx={{
                fontSize: 13,
                color: alpha(theme.palette.text.primary, 0.70),
                lineHeight: 1.35,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {d?.conteudo ?? "—"}
            </Typography>
                  */}

                        {/* Métricas */}
                        <Box
                            sx={{
                                mt: "auto",
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 1.5,
                                pt: 1.5,
                                borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                            }}
                        >
                            <Metric title="Nota média" value={nota} />
                            <Metric title="Taxa de conclusão" value={taxa} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default ContentDashboard;
