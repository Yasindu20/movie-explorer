import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchTrendingMovies, searchMovies } from '../api/tmdbApi';

// Create context
const MovieContext = createContext();

// Initial state
const initialState = {
  trendingMovies: [],
  searchResults: [],
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 0,
  searchQuery: '',
  favorites: [],
  darkMode: false
};

// Actions
const actions = {
  FETCH_TRENDING_START: 'FETCH_TRENDING_START',
  FETCH_TRENDING_SUCCESS: 'FETCH_TRENDING_SUCCESS',
  FETCH_TRENDING_ERROR: 'FETCH_TRENDING_ERROR',
  SEARCH_MOVIES_START: 'SEARCH_MOVIES_START',
  SEARCH_MOVIES_SUCCESS: 'SEARCH_MOVIES_SUCCESS',
  SEARCH_MOVIES_ERROR: 'SEARCH_MOVIES_ERROR',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  RESET_SEARCH: 'RESET_SEARCH',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE'
};

// Reducer
const movieReducer = (state, action) => {
  switch (action.type) {
    case actions.FETCH_TRENDING_START:
      return { ...state, isLoading: true, error: null };
    case actions.FETCH_TRENDING_SUCCESS:
      return {
        ...state,
        isLoading: false,
        trendingMovies: action.payload.page === 1 
          ? action.payload.results 
          : [...state.trendingMovies, ...action.payload.results],
        page: action.payload.page,
        totalPages: action.payload.total_pages
      };
    case actions.FETCH_TRENDING_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    
    case actions.SEARCH_MOVIES_START:
      return { ...state, isLoading: true, error: null };
    case actions.SEARCH_MOVIES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        searchResults: action.payload.page === 1 
          ? action.payload.results 
          : [...state.searchResults, ...action.payload.results],
        page: action.payload.page,
        totalPages: action.payload.total_pages
      };
    case actions.SEARCH_MOVIES_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    
    case actions.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case actions.RESET_SEARCH:
      return { ...state, searchResults: [], page: 1, totalPages: 0, searchQuery: '' };
    
    case actions.ADD_TO_FAVORITES:
      return { 
        ...state, 
        favorites: [...state.favorites, action.payload]
      };
    case actions.REMOVE_FROM_FAVORITES:
      return { 
        ...state, 
        favorites: state.favorites.filter(movie => movie.id !== action.payload) 
      };
    
    case actions.TOGGLE_DARK_MODE:
      return { ...state, darkMode: !state.darkMode };
    
    default:
      return state;
  }
};

// Provider component
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Load favorites and dark mode preference from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    const darkModePreference = localStorage.getItem('darkMode');
    
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites);
      parsedFavorites.forEach(movie => {
        dispatch({ type: actions.ADD_TO_FAVORITES, payload: movie });
      });
    }
    
    if (darkModePreference === 'true') {
      dispatch({ type: actions.TOGGLE_DARK_MODE });
    }
    
    // Load last search query
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
      dispatch({ type: actions.SET_SEARCH_QUERY, payload: lastSearch });
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', state.darkMode);
  }, [state.darkMode]);

  // Save last search query
  useEffect(() => {
    if (state.searchQuery) {
      localStorage.setItem('lastSearch', state.searchQuery);
    }
  }, [state.searchQuery]);

  // Functions to interact with the API
  const loadTrendingMovies = async (page = 1) => {
    dispatch({ type: actions.FETCH_TRENDING_START });
    try {
      const data = await fetchTrendingMovies(page);
      dispatch({ 
        type: actions.FETCH_TRENDING_SUCCESS, 
        payload: data 
      });
    } catch (error) {
      dispatch({ 
        type: actions.FETCH_TRENDING_ERROR, 
        payload: error.message 
      });
    }
  };

  const searchForMovies = async (query, page = 1) => {
    dispatch({ type: actions.SET_SEARCH_QUERY, payload: query });
    dispatch({ type: actions.SEARCH_MOVIES_START });
    try {
      const data = await searchMovies(query, page);
      dispatch({ 
        type: actions.SEARCH_MOVIES_SUCCESS, 
        payload: data 
      });
    } catch (error) {
      dispatch({ 
        type: actions.SEARCH_MOVIES_ERROR, 
        payload: error.message 
      });
    }
  };

  const resetSearch = () => {
    dispatch({ type: actions.RESET_SEARCH });
  };

  const addToFavorites = (movie) => {
    dispatch({ type: actions.ADD_TO_FAVORITES, payload: movie });
  };

  const removeFromFavorites = (movieId) => {
    dispatch({ type: actions.REMOVE_FROM_FAVORITES, payload: movieId });
  };

  const toggleDarkMode = () => {
    dispatch({ type: actions.TOGGLE_DARK_MODE });
  };

  return (
    <MovieContext.Provider
      value={{
        ...state,
        loadTrendingMovies,
        searchForMovies,
        resetSearch,
        addToFavorites,
        removeFromFavorites,
        toggleDarkMode
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

// Custom hook to use the movie context
export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
};