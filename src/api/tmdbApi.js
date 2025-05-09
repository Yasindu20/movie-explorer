import axios from 'axios';

// Replace with your actual TMDb API key
const API_KEY = '6f260ad398044fdb6affceaa84c86761';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Create axios instance with base configurations
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US'
  }
});

// API endpoints
export const endpoints = {
  trending: '/trending/movie/week',
  search: '/search/movie',
  movieDetails: '/movie',
  genres: '/genre/movie/list'
};

// Image sizes
export const imageSizes = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500'
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280'
  }
};

// Helper functions for API calls
export const fetchTrendingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get(endpoints.trending, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get(endpoints.search, {
      params: {
        query,
        page,
        include_adult: false
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`${endpoints.movieDetails}/${movieId}`, {
      params: {
        append_to_response: 'videos,credits'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const fetchGenres = async () => {
  try {
    const response = await tmdbApi.get(endpoints.genres);
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

// Helper to get image URL
export const getImageUrl = (path, size = imageSizes.poster.medium) => {
  if (!path) return 'https://via.placeholder.com/342x513?text=No+Image+Available';
  return `${IMAGE_BASE_URL}${size}${path}`;
};

export default tmdbApi;