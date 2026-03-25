const DEFAULT_CHUNK_SIZE_MB = 128;

const envChunkSizeRaw = Number(import.meta.env.VITE_TUS_CHUNK_SIZE_MB);
const chunkSizeMb = Number.isFinite(envChunkSizeRaw) && envChunkSizeRaw > 0
  ? envChunkSizeRaw
  : DEFAULT_CHUNK_SIZE_MB;

export const TUS_CHUNK_SIZE = Math.round(chunkSizeMb * 1024 * 1024);

// Backoff curto para falhas de rede sem resetar o upload inteiro.
export const TUS_RETRY_DELAYS = [0, 1000, 3000, 5000, 10000, 20000];
