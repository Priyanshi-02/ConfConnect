import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  updateProfile: async (profileData) => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.put('/auth/profile', profileData);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Profile update failed', 
        loading: false 
      });
      throw error;
    }
  },

  googleLogin: async (credential) => {
    try {
      const response = await api.post('/auth/google', { credential });
      const data = response.data;
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Google Login failed';
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Requirement: DO NOT auto login. Keep null state and let UI redirect to login.
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));
