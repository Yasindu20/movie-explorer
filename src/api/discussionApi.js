import apiClient from './apiClient';

export const discussionApi = {
  // Get discussions for a movie
  getMovieDiscussions: async (movieId, params = {}) => {
    const response = await apiClient.get(`/discussions/movie/${movieId}`, { params });
    return response.data;
  },

  // Get single discussion
  getDiscussion: async (id) => {
    const response = await apiClient.get(`/discussions/${id}`);
    return response.data;
  },

  // Create discussion
  createDiscussion: async (discussionData) => {
    const response = await apiClient.post('/discussions', discussionData);
    return response.data;
  },

  // Update discussion
  updateDiscussion: async (id, discussionData) => {
    const response = await apiClient.put(`/discussions/${id}`, discussionData);
    return response.data;
  },

  // Delete discussion
  deleteDiscussion: async (id) => {
    const response = await apiClient.delete(`/discussions/${id}`);
    return response.data;
  },

  // Add comment
  addComment: async (id, comment) => {
    const response = await apiClient.post(`/discussions/${id}/comments`, { content: comment });
    return response.data;
  },

  // Toggle like
  toggleLike: async (id) => {
    const response = await apiClient.put(`/discussions/${id}/like`);
    return response.data;
  }
};
