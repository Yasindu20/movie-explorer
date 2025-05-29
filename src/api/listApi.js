import apiClient from './apiClient';

export const listApi = {
  // Get all public lists
  getLists: async (params = {}) => {
    const response = await apiClient.get('/lists', { params });
    return response.data;
  },

  // Get single list
  getList: async (id) => {
    const response = await apiClient.get(`/lists/${id}`);
    return response.data;
  },

  // Create list
  createList: async (listData) => {
    const response = await apiClient.post('/lists', listData);
    return response.data;
  },

  // Update list
  updateList: async (id, listData) => {
    const response = await apiClient.put(`/lists/${id}`, listData);
    return response.data;
  },

  // Delete list
  deleteList: async (id) => {
    const response = await apiClient.delete(`/lists/${id}`);
    return response.data;
  },

  // Add movie to list
  addMovieToList: async (listId, movieData) => {
    const response = await apiClient.post(`/lists/${listId}/movies`, movieData);
    return response.data;
  },

  // Remove movie from list
  removeMovieFromList: async (listId, movieId) => {
    const response = await apiClient.delete(`/lists/${listId}/movies/${movieId}`);
    return response.data;
  },

  // Toggle follow list
  toggleFollowList: async (id) => {
    const response = await apiClient.put(`/lists/${id}/follow`);
    return response.data;
  }
};