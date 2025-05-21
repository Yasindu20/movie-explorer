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

export const fetchMoviesByMood = async (mood, page = 1) => {
  try {
    // First, look for movies by genres
    const genreQuery = mood.genres.join('|'); // '|' means OR in TMDb API
    
    // Create a base response with genre filtering
    const genreResponse = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreQuery,
        without_genres: mood.exclusions?.join('|') || '',
        page,
        sort_by: 'popularity.desc',
        include_adult: false,
        'vote_count.gte': 100 // Ensure some minimum votes for quality
      }
    });
    
    // If mood has a year range, apply it
    if (mood.yearRange) {
      genreResponse.params = {
        ...genreResponse.params,
        'primary_release_date.gte': `${mood.yearRange.start}-01-01`,
        'primary_release_date.lte': `${mood.yearRange.end}-12-31`
      };
    }
    
    // For better results, also search for movies with the mood keywords
    // and combine results
    const keywordPromises = mood.keywords.map(async (keyword) => {
      // First find keyword ID
      const keywordSearchResponse = await tmdbApi.get('/search/keyword', {
        params: { query: keyword }
      });
      
      if (keywordSearchResponse.data.results && keywordSearchResponse.data.results.length > 0) {
        const keywordId = keywordSearchResponse.data.results[0].id;
        
        // Then search for movies with this keyword
        const keywordMoviesResponse = await tmdbApi.get('/discover/movie', {
          params: {
            with_keywords: keywordId,
            without_genres: mood.exclusions?.join('|') || '',
            page: 1,
            sort_by: 'popularity.desc',
            'vote_count.gte': 50
          }
        });
        
        return keywordMoviesResponse.data.results || [];
      }
      return [];
    });
    
    // Wait for all keyword searches to complete
    const keywordResults = await Promise.all(keywordPromises);
    
    // Flatten the results into a single array
    const flattenedKeywordResults = keywordResults.flat();
    
    // Combine with genre results and remove duplicates
    const combinedResults = [...genreResponse.data.results];
    
    flattenedKeywordResults.forEach(movie => {
      if (!combinedResults.some(m => m.id === movie.id)) {
        combinedResults.push(movie);
      }
    });
    
    // Sort by popularity and take the first 20
    const sortedResults = combinedResults
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 20);
    
    // Return in the same format as other API functions
    return {
      page,
      results: sortedResults,
      total_pages: Math.min(
        Math.ceil(sortedResults.length / 20), 
        genreResponse.data.total_pages
      ),
      total_results: sortedResults.length
    };
  } catch (error) {
    console.error('Error fetching mood-based movies:', error);
    throw error;
  }
};

export default tmdbApi;