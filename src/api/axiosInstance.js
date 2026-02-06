// src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.digitaleduca.com.vc", // mesma URL do seu backend
});

// adiciona token em cada requisição, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
