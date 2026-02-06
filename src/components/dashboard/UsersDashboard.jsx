import axios from "axios";
import theme from "../../theme/theme";
import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Grid, Paper, Divider } from "@mui/material";
import { School, Person, PersonOff, HowToReg } from "@mui/icons-material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const UsersDashboard = () => {
  const [usuarios, setUsuarios] = useState({});

  const getUsers = () => {
    axios
      .get("https://api.digitaleduca.com.vc/dashboard/usuarios", {
        headers: {
          Authorization: `Dashboard FDYWmkzwEDhacggv6tIZhHsqhz8FSkqVbsqR1QYsL722i8lRr9kFTiWofUmAYDQqvT3w8IcpjJwS9DqEkUpdmBtRzJEg9Ivy25jEXezoaMxpUvlFlct37ZQ4DOpMie`,
        },
      })
      .then((response) => {
        setUsuarios(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const infUsuarios = [
    { number: usuarios.totalUsuarios, nome: "Total de Usuários", icone: School },
    { number: usuarios.usuariosCancelados, nome: "Usuários Cancelados", icone: PersonOff },
    { number: usuarios.usuariosComAssinatura, nome: "Assinaturas Ativas", icone: HowToReg },
    { number: usuarios.usuariosFree, nome: "Usuários Free", icone: Person },
  ];

  // helpers
  const safeNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const safeDiv = (num, den) => (den > 0 ? num / den : 0);
  const toPct = (v) => Math.round(v * 1000) / 10; // 1 casa decimal

  // KPI computations
  const kpis = useMemo(() => {
    const total = safeNumber(usuarios.totalUsuarios);
    const cancelados = safeNumber(usuarios.usuariosCancelados);
    const assinaturasAtivas = safeNumber(usuarios.usuariosComAssinatura);
    const free = safeNumber(usuarios.usuariosFree);

    const taxaConversao = safeDiv(assinaturasAtivas, total);
    const pctFree = safeDiv(free, total);
    const pctPagantes = safeDiv(assinaturasAtivas, total);
    const taxaCancelamento = safeDiv(cancelados, total);

    return {
      total,
      cancelados,
      assinaturasAtivas,
      free,
      taxaConversao,
      pctFree,
      pctPagantes,
      taxaCancelamento,
    };
  }, [usuarios]);

  // Charts data
  const pieData = useMemo(() => {
    // composição (Free x Assinaturas Ativas x Cancelados)
    // Se as categorias se sobrepõem no seu modelo, ajuste aqui.
    return [
      { name: "Usuários Free", value: kpis.free },
      { name: "Assinaturas Ativas", value: kpis.assinaturasAtivas },
      { name: "Usuários Cancelados", value: kpis.cancelados },
    ];
  }, [kpis]);

  const barsData = useMemo(() => {
    return [
      { name: "Conversão", value: toPct(kpis.taxaConversao) },
      { name: "% Free", value: toPct(kpis.pctFree) },
      { name: "% Pagantes", value: toPct(kpis.pctPagantes) },
      { name: "Cancelamento", value: toPct(kpis.taxaCancelamento) },
    ];
  }, [kpis]);

  // Use as cores do seu theme (uma paleta simples pros segmentos)
  const pieColors = [
    theme.palette.primary.main,
    theme.palette.success?.main || theme.palette.primary.dark,
    theme.palette.error?.main || theme.palette.primary.light,
  ];

  const kpiCards = [
    { label: "Taxa de Conversão", value: `${toPct(kpis.taxaConversao)}%` },
    { label: "% Usuários Free", value: `${toPct(kpis.pctFree)}%` },
    { label: "% Usuários Pagantes", value: `${toPct(kpis.pctPagantes)}%` },
    { label: "Taxa de Cancelamento", value: `${toPct(kpis.taxaCancelamento)}%` },
  ];

  return (
    <Box sx={{maxWidth:"1200px"}}>
      {/* Cards atuais */}
      <Grid
        container
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        {infUsuarios.map((inf, index) => {
          const Icon = inf.icone;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
              elevation={0}
                sx={{
                  p: 2,
                  textAlign: "start",
                  borderRadius: 2,
                  borderBottom: `2px solid ${theme.palette.primary.light}`,
                  py: 4,
                  bgcolor:theme.palette.secondary.light,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
                  <Icon
                    sx={{
                      color: theme.palette.primary.dark,
                      bgcolor: theme.palette.primary.light,
                      width: 45,
                      height: 45,
                      p: 1,
                      borderRadius: "8px",
                    }}
                  />
                  <Typography sx={{ fontSize: "25px", fontWeight: 400 }}>
                    {inf.number ?? 0}
                  </Typography>
                </Box>
                <Typography sx={{ mt: 1 }}>{inf.nome}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* KPIs em % (cards menores) */}
      <Grid
        container
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        {kpiCards.map((k, idx) => (
          <Paper
          elevation={0}
            key={idx}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.secondary.light,
              borderBottom: `2px solid ${theme.palette.primary.light}`,
            }}
          >
            <Typography sx={{ opacity: 0.8, fontSize: 13 }}>{k.label}</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 22, fontWeight: 500 }}>
              {k.value}
            </Typography>
          </Paper>
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid
        container
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {/* Pizza/Donut */}
        <Paper
        elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.secondary.light,
            borderRight:`3px solid ${theme.palette.primary.light}`
          }}
        >
          <Typography sx={{ fontWeight: 500, mb: 1 }}>
            Distribuição de Usuários
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Barras de percentuais */}
        <Paper
        elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.secondary.light,
            borderLeft:`3px solid ${theme.palette.primary.light}`
          }}
        >
          <Typography sx={{ fontWeight: 500, mb: 1 }}>
            KPIs (%) — Visão rápida
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={barsData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, "Valor"]} />
                <Bar dataKey="value" fill={theme.palette.primary.light} radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Box>
  );
};

export default UsersDashboard;
