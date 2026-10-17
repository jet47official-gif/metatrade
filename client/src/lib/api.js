import axios from 'axios';

const api = axios.create({
  // In production the API lives on a different domain than the frontend,
  // so we must use an absolute URL (env var is gitignored, hence the hardcoded fallback).
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? 'https://metatrade.onrender.com/api'
      : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('API 401 Unauthorized:', error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;
