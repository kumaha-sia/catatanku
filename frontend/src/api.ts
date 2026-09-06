import axios from 'axios';
import { useAuthStore } from './store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
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

export default api;
