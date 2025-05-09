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
  useTheme,
  Chip
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
  const [selectedGenre, setSelectedGenre] = useState(null);

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

  // Handle genre selection
  const handleGenreClick = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null); // Deselect if already selected
    } else {
      setSelectedGenre(genreId); // Select new genre
    }
  };

  // Filter movies by selected genre
  const filteredMovies = selectedGenre
    ? trendingMovies.filter(movie => 
        movie.genre_ids && movie.genre_ids.includes(selectedGenre)
      )
    : trendingMovies;

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

      {/* Genre Filters */}
      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Filter by Genre
          {selectedGenre && (
            <Button 
              size="small" 
              onClick={() => setSelectedGenre(null)}
              sx={{ ml: 2 }}
            >
              Clear Filter
            </Button>
          )}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {loadingGenres ? (
            <CircularProgress size={24} />
          ) : (
            genres.map((genre) => (
              <Chip
                key={genre.id}
                label={genre.name}
                clickable
                color="primary"
                variant={selectedGenre === genre.id ? "filled" : "outlined"}
                onClick={() => handleGenreClick(genre.id)}
                sx={{ m: 0.5 }}
              />
            ))
          )}
        </Box>
      </Box>

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
        {selectedGenre 
          ? `Trending ${genres.find(g => g.id === selectedGenre)?.name || ''} Movies` 
          : 'Trending This Week'}
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
          {filteredMovies.length === 0 && selectedGenre ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              No trending movies found in this genre. Try selecting a different genre.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredMovies.map((movie) => (
                <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                  <MovieCard movie={movie} />
                </Grid>
              ))}
            </Grid>
          )}

          {!selectedGenre && page < totalPages && (
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