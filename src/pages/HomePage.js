import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Button, 
  Alert, 
  Paper, 
  useTheme 
} from '@mui/material';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { useMovieContext } from '../context/MovieContext';
import { fetchGenres } from '../api/tmdbApi';

const HomePage = () => {
  const theme = useTheme();
  const { 
    trendingMovies, 
    isLoading, 
    error, 
    loadTrendingMovies, 
    page, 
    totalPages 
  } = useMovieContext();
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);

  // Load trending movies on component mount
  useEffect(() => {
    if (trendingMovies.length === 0) {
      loadTrendingMovies();
    }
  }, [loadTrendingMovies, trendingMovies.length]);

  // Load genres
  useEffect(() => {
    const getGenres = async () => {
      setLoadingGenres(true);
      try {
        const genreData = await fetchGenres();
        setGenres(genreData);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setLoadingGenres(false);
      }
    };

    getGenres();
  }, []);

  // Handle load more button click
  const handleLoadMore = () => {
    loadTrendingMovies(page + 1);
  };

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          color: 'text.primary',
          mb: 4,
          mt: 2,
          p: 6,
          borderRadius: 2,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: `linear-gradient(${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}, ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}), url(https://source.unsplash.com/random/1600x900/?movie)`,
        }}
      >
        <Box maxWidth="sm">
          <Typography component="h1" variant="h3" color="inherit" gutterBottom>
            Discover Movies
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Find trending and popular movies. Search for your favorites and build your personal collection.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <SearchBar />
          </Box>
        </Box>
      </Paper>

      {/* Trending Movies Section */}
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom 
        sx={{ 
          mt: 4, 
          mb: 3, 
          fontWeight: 'bold',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 1
        }}
      >
        Trending This Week
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading && trendingMovies.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {trendingMovies.map((movie) => (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>

          {page < totalPages && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
              <Button 
                variant="contained" 
                onClick={handleLoadMore}
                disabled={isLoading}
                size="large"
              >
                {isLoading ? <CircularProgress size={24} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default HomePage;