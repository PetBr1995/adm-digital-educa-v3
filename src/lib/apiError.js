export const getApiErrorMessage = (error, fallback = "Ocorreu um erro inesperado.") => {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }
    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  return fallback;
};
