import axios from "axios";
let hasLoggedUnauthorized = false;

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Exemplo: const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!hasLoggedUnauthorized) {
        console.error("Não autorizado - Sessão expirada");
        hasLoggedUnauthorized = true;

        setTimeout(() => {
          hasLoggedUnauthorized = false;
        }, 5000);
      }
    }
    return Promise.reject(error);
  },
);
