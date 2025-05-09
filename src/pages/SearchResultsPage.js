import React, { useEffect, useCallback, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert, 
  Divider,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { useMovieContext } from '../context/MovieContext';

const SearchResultsPage = () => {
  const { 
    searchQuery, 
    searchResults, 
    isLoading, 
    error, 
    searchForMovies, 
    page, 
    totalPages 
  } = useMovieContext();
  const navigate = useNavigate();
  const observer = useRef();
  
  // If no search query, redirect to home
  useEffect(() => {
    if (!searchQuery) {
      navigate('/');
    }
  }, [searchQuery, navigate]);

  // Infinite scroll logic
  const lastMovieElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        searchForMovies(searchQuery, page + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, page, totalPages, searchQuery, searchForMovies]);

  // Regular load more function as alternative to infinite scroll
  const handleLoadMore = () => {
    if (page < totalPages) {
      searchForMovies(searchQuery, page + 1);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <SearchBar />
      </Box>
      
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 1
        }}
      >
        {searchResults.length > 0
          ? `Search Results for "${searchQuery}"`
          : `Searching for "${searchQuery}"...`}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {searchResults.length === 0 && !isLoading && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No movies found matching "{searchQuery}". Try a different search term.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {searchResults.map((movie, index) => {
          // Apply ref to last element for infinite scroll
          if (index === searchResults.length - 1) {
            return (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3} ref={lastMovieElementRef}>
                <MovieCard movie={movie} />
              </Grid>
            );
          } else {
            return (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                <MovieCard movie={movie} />
              </Grid>
            );
          }
        })}
      </Grid>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Alternative "Load More" button */}
      {!isLoading && searchResults.length > 0 && page < totalPages && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleLoadMore}
            size="large"
          >
            Load More
          </Button>
        </Box>
      )}
      
      {page >= totalPages && searchResults.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            You've reached the end of the results.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SearchResultsPage;