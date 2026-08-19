import axios from 'axios';

// In local dev, VITE_API_URL is unset so this falls back to '/api',
// which Vite's dev server proxies to http://localhost:5000 (see vite.config.js).
// In production (Vercel), VITE_API_URL is set to the deployed backend's
// full API URL, e.g. https://your-backend.onrender.com/api
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
