import apiClient from './apiClient';

export const streamingApi = {
  // Get streaming data for a specific movie
  getMovieStreaming: async (movieId, imdbId, title) => {
    try {
      const params = { title };
      if (imdbId) params.imdb_id = imdbId;
      
      const response = await apiClient.get(`/streaming/movie/${movieId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie streaming data:', error);
      throw error;
    }
  },

  // Get all available streaming services
  getStreamingServices: async () => {
    try {
      const response = await apiClient.get('/streaming/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming services:', error);
      throw error;
    }
  },

  // Search for streaming availability by title
  searchStreamingByTitle: async (title, year = null) => {
    try {
      const params = { title };
      if (year) params.year = year;
      
      const response = await apiClient.get('/streaming/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching streaming by title:', error);
      throw error;
    }
  },

  // Get popular content for a streaming service
  getPopularContent: async (service = null, type = 'all', limit = 20) => {
    try {
      const params = { type, limit };
      if (service) params.service = service;
      
      const response = await apiClient.get('/streaming/popular', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular streaming content:', error);
      throw error;
    }
  },

  // Get streaming statistics
  getStreamingStats: async () => {
    try {
      const response = await apiClient.get('/streaming/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming stats:', error);
      throw error;
    }
  },

  // Clear streaming cache (admin only)
  clearStreamingCache: async () => {
    try {
      const response = await apiClient.delete('/streaming/cache');
      return response.data;
    } catch (error) {
      console.error('Error clearing streaming cache:', error);
      throw error;
    }
  }
};

// Helper function to format streaming data for display
export const formatStreamingData = (streamingData) => {
  if (!streamingData || !streamingData.data) {
    return {
      subscription: [],
      rent: [],
      buy: [],
      free: [],
      isEmpty: true
    };
  }

  const data = streamingData.data.data || streamingData.data;
  
  return {
    subscription: data.subscription || [],
    rent: data.rent || [],
    buy: data.buy || [],
    free: data.free || [],
    isEmpty: (
      (!data.subscription || data.subscription.length === 0) &&
      (!data.rent || data.rent.length === 0) &&
      (!data.buy || data.buy.length === 0) &&
      (!data.free || data.free.length === 0)
    ),
    lastUpdated: streamingData.data.lastUpdated
  };
};

// Helper function to get streaming service icon
export const getStreamingServiceIcon = (serviceName) => {
  const iconMap = {
    'Netflix': '🎬',
    'Amazon Prime Video': '📺',
    'Disney+': '🏰',
    'Hulu': '📻',
    'HBO Max': '🎭',
    'YouTube Movies': '▶️',
    'Apple TV': '🍎',
    'Google Play Movies': '🎮',
    'Vudu': '🎯',
    'Tubi': '📱',
    'Crackle': '⚡',
    'Pluto TV': '🪐'
  };
  
  return iconMap[serviceName] || '📽️';
};

// Helper function to categorize streaming type
export const getStreamingTypeInfo = (type) => {
  const typeInfo = {
    subscription: {
      label: 'Subscription',
      color: '#4CAF50',
      description: 'Included with subscription'
    },
    rent: {
      label: 'Rent',
      color: '#FF9800',
      description: 'Available for rent'
    },
    buy: {
      label: 'Buy',
      color: '#F44336',
      description: 'Available for purchase'
    },
    free: {
      label: 'Free',
      color: '#2196F3',
      description: 'Free with ads'
    }
  };
  
  return typeInfo[type] || {
    label: 'Unknown',
    color: '#757575',
    description: 'Availability unknown'
  };
};