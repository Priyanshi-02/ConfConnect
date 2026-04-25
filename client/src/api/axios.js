import axios from 'axios';

// Dynamically target the backend API based on the hosting environment
const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
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
