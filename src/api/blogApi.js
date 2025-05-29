import apiClient from './apiClient';

export const blogApi = {
  // Get all blogs
  getBlogs: async (params = {}) => {
    const response = await apiClient.get('/blogs', { params });
    return response.data;
  },

  // Get single blog
  getBlog: async (slug) => {
    const response = await apiClient.get(`/blogs/${slug}`);
    return response.data;
  },

  // Create blog
  createBlog: async (blogData) => {
    const response = await apiClient.post('/blogs', blogData);
    return response.data;
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    const response = await apiClient.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  // Delete blog
  deleteBlog: async (id) => {
    const response = await apiClient.delete(`/blogs/${id}`);
    return response.data;
  },

  // Toggle like
  toggleLike: async (id) => {
    const response = await apiClient.put(`/blogs/${id}/like`);
    return response.data;
  },

  // Add comment
  addComment: async (id, comment) => {
    const response = await apiClient.post(`/blogs/${id}/comments`, { content: comment });
    return response.data;
  }
};