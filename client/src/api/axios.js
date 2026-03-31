import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Axios interceptor to append authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Strict implementation requirement
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
