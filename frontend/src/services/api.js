import axios from 'axios';

// Fallback automatico para a API do Render do projeto
const baseURL = import.meta.env.VITE_API_URL || 'https://conecta-candidato-api-qvrx.onrender.com/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      if (!window.location.hash.includes('/login')) window.location.hash = '#/login';
    }
    return Promise.reject(err);
  }
);

export default api;
