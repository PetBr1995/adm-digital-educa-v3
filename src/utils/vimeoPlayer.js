export const buildVimeoEmbedUrl = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "number") {
    return `https://player.vimeo.com/video/${value}`;
  }

  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d+$/.test(raw)) {
    return `https://player.vimeo.com/video/${raw}`;
  }

  const uriMatch = raw.match(/\/videos\/(\d+)/);
  if (uriMatch?.[1]) {
    return `https://player.vimeo.com/video/${uriMatch[1]}`;
  }

  const urlMatch = raw.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\?([^#]+))?/);
  if (urlMatch?.[1]) {
    const params = new URLSearchParams(urlMatch[2] || "");
    const h = params.get("h");
    return h
      ? `https://player.vimeo.com/video/${urlMatch[1]}?h=${h}`
      : `https://player.vimeo.com/video/${urlMatch[1]}`;
  }

  return "";
};

export const parseVimeoId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 100000 ? String(value) : "";
  }

  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw)) {
    const numeric = Number(raw);
    return numeric >= 100000 ? raw : "";
  }

  const uriMatch = raw.match(/\/videos\/(\d+)/);
  if (uriMatch?.[1]) return uriMatch[1];

  const urlMatch = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (urlMatch?.[1]) return urlMatch[1];

  return "";
};

export const extractVimeoIdCandidates = (conteudo) => {
  if (!conteudo || typeof conteudo !== "object") return [];

  const firstVideoFromModulo =
    Array.isArray(conteudo.modulos) && conteudo.modulos.length > 0
      ? conteudo.modulos.find((m) => m?.video || (Array.isArray(m?.videos) && m.videos.length > 0))
      : null;

  const rawCandidates = [
    conteudo.vimeoId,
    conteudo.vimeoUri,
    conteudo.vimeoUrl,
    conteudo.vimeoPlayerUrl,
    conteudo.videoUrl,
    conteudo.videoLink,
    conteudo?.video?.vimeoId,
    conteudo?.video?.vimeoUri,
    conteudo?.video?.vimeoUrl,
    conteudo?.video?.vimeoPlayerUrl,
    conteudo?.video?.uri,
    conteudo?.video?.url,
    conteudo?.video?.link,
    conteudo?.videos?.[0]?.vimeoId,
    conteudo?.videos?.[0]?.vimeoUri,
    conteudo?.videos?.[0]?.vimeoPlayerUrl,
    conteudo?.videos?.[0]?.uri,
    conteudo?.videos?.[0]?.url,
    conteudo?.videos?.[0]?.link,
    conteudo?.videos?.[0]?.vimeoUrl,
    conteudo?.videosLivres?.[0]?.vimeoId,
    conteudo?.videosLivres?.[0]?.vimeoUri,
    conteudo?.videosLivres?.[0]?.vimeoPlayerUrl,
    conteudo?.videosLivres?.[0]?.uri,
    conteudo?.videosLivres?.[0]?.url,
    conteudo?.videosLivres?.[0]?.link,
    conteudo?.videosLivres?.[0]?.vimeoUrl,
    firstVideoFromModulo?.video?.vimeoId,
    firstVideoFromModulo?.video?.vimeoUri,
    firstVideoFromModulo?.video?.vimeoPlayerUrl,
    firstVideoFromModulo?.video?.uri,
    firstVideoFromModulo?.video?.url,
    firstVideoFromModulo?.video?.link,
    firstVideoFromModulo?.video?.vimeoUrl,
  ];

  const unique = new Set();
  rawCandidates.forEach((candidate) => {
    const parsed = parseVimeoId(candidate);
    if (parsed) unique.add(parsed);
  });

  return Array.from(unique);
};

export const extractEmbedFromLinkResponse = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const candidates = [
    data.link,
    data.url,
    data.playerUrl,
    data.vimeoUrl,
    data.videoUrl,
    data.uri,
    data.video?.link,
    data.video?.url,
    data.video?.playerUrl,
    data.video?.vimeoUrl,
    data.video?.uri,
  ];

  for (const candidate of candidates) {
    const embed = buildVimeoEmbedUrl(candidate);
    if (embed) return embed;
  }

  return "";
};

export const resolveEmbedViaVimeoLinkEndpoint = async (api, conteudo) => {
  const vimeoIds = extractVimeoIdCandidates(conteudo);
  for (const vimeoId of vimeoIds) {
    try {
      const response = await api.get(`/vimeo-client/video/${vimeoId}/link`);
      const embed = extractEmbedFromLinkResponse(response.data);
      if (embed) return embed;
    } catch {
      // tenta próximo id candidato
    }
  }
  return "";
};

export const extractVimeoEmbedFromObject = (conteudo) => {
  if (!conteudo || typeof conteudo !== "object") return "";

  const firstVideoFromModulo =
    Array.isArray(conteudo.modulos) && conteudo.modulos.length > 0
      ? conteudo.modulos.find((m) => m?.video || (Array.isArray(m?.videos) && m.videos.length > 0))
      : null;

  const candidates = [
    conteudo.vimeoUrl,
    conteudo.vimeoPlayerUrl,
    conteudo.vimeoUri,
    conteudo.videoUrl,
    conteudo.videoLink,
    conteudo?.video?.vimeoUrl,
    conteudo?.video?.vimeoPlayerUrl,
    conteudo?.video?.vimeoUri,
    conteudo?.video?.url,
    conteudo?.video?.link,
    conteudo?.videos?.[0]?.vimeoUrl,
    conteudo?.videos?.[0]?.vimeoPlayerUrl,
    conteudo?.videos?.[0]?.vimeoUri,
    conteudo?.videos?.[0]?.playerUrl,
    conteudo?.videos?.[0]?.uri,
    conteudo?.videos?.[0]?.url,
    conteudo?.videos?.[0]?.link,
    conteudo?.videosLivres?.[0]?.vimeoUrl,
    conteudo?.videosLivres?.[0]?.vimeoPlayerUrl,
    conteudo?.videosLivres?.[0]?.vimeoUri,
    conteudo?.videosLivres?.[0]?.playerUrl,
    conteudo?.videosLivres?.[0]?.uri,
    conteudo?.videosLivres?.[0]?.url,
    conteudo?.videosLivres?.[0]?.link,
    firstVideoFromModulo?.video?.vimeoUrl,
    firstVideoFromModulo?.video?.vimeoPlayerUrl,
    firstVideoFromModulo?.video?.vimeoUri,
    firstVideoFromModulo?.video?.playerUrl,
    firstVideoFromModulo?.video?.uri,
    firstVideoFromModulo?.video?.url,
    firstVideoFromModulo?.video?.link,
  ];

  for (const candidate of candidates) {
    const embed = buildVimeoEmbedUrl(candidate);
    if (embed) return embed;
  }

  return "";
};
