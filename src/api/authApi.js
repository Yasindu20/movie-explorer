import apiClient from './apiClient';

export const authApi = {
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/updatedetails', userData);
    return response.data;
  }
};