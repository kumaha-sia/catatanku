import axios from 'axios';
import { useAuthStore } from './store/authStore';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback dynamic IP support for mobile testing
  return `http://${window.location.hostname}:5000/api/v1`;
};

export const API_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add the auth token header to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      useAuthStore.getState().logout();
      // Optionally redirect to login page, but the protected routes wrapper in App.tsx usually handles this if token is null
    }
    return Promise.reject(error);
  }
);

export default api;
