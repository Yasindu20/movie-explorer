import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  Chip, 
  CircularProgress, 
  Button, 
  Alert, 
  Divider, 
  IconButton, 
  useTheme, 
  Link 
} from '@mui/material';
import { 
  ArrowBack, 
  Favorite, 
  FavoriteBorder, 
  Star, 
  CalendarMonth, 
  AccessTime, 
  Language, 
  AttachMoney 
} from '@mui/icons-material';
import { fetchMovieDetails, getImageUrl } from '../api/tmdbApi';
import { useMovieContext } from '../context/MovieContext';
import YouTube from 'react-youtube';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { favorites, addToFavorites, removeFromFavorites } = useMovieContext();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  // Check if movie is in favorites
  const isFavorite = favorites.some(fav => fav.id === Number(id));

  // Fetch movie details
  useEffect(() => {
    const getMovieDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchMovieDetails(id);
        setMovie(data);
        
        // Find trailer
        if (data.videos && data.videos.results) {
          const trailer = data.videos.results.find(
            video => video.type === 'Trailer' && video.site === 'YouTube'
          );
          if (trailer) {
            setTrailerKey(trailer.key);
          }
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getMovieDetails();
  }, [id]);

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavorites(Number(id));
    } else if (movie) {
      addToFavorites(movie);
    }
  };

  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  // Format runtime
  const formatRuntime = (minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Unknown';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // YouTube options
  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Movie not found</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        backgroundImage: movie.backdrop_path 
          ? `linear-gradient(${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}, ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}), url(${getImageUrl(movie.backdrop_path, 'w1280')})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack} 
          variant="contained"
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Grid container spacing={4}>
            {/* Movie Poster */}
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color={isFavorite ? 'secondary' : 'primary'}
                  startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleFavoriteToggle}
                  fullWidth
                >
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </Box>
              
              {/* Movie Info Cards */}
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <CalendarMonth color="primary" />
                      <Typography variant="body2" sx={{ mt: 1 }}>Release Date</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {movie.release_date 
                          ? new Date(movie.release_date).toLocaleDateString() 
                          : 'Unknown'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <AccessTime color="primary" />
                      <Typography variant="body2" sx={{ mt: 1 }}>Runtime</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatRuntime(movie.runtime)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Language color="primary" />
                      <Typography variant="body2" sx={{ mt: 1 }}>Language</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {movie.original_language?.toUpperCase() || 'Unknown'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <AttachMoney color="primary" />
                      <Typography variant="body2" sx={{ mt: 1 }}>Budget</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(movie.budget)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Movie Details */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {movie.title}
                </Typography>
                
                {movie.release_date && (
                  <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                    ({new Date(movie.release_date).getFullYear()})
                  </Typography>
                )}
              </Box>
              
              {/* Rating */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2 
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.08)', 
                    color: 'primary.main', 
                    borderRadius: '4px',
                    p: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    mr: 2
                  }}
                >
                  <Star sx={{ color: 'gold', mr: 0.5 }} />
                  <Typography variant="body1" fontWeight="bold">
                    {movie.vote_average?.toFixed(1) || 'N/A'} / 10
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {movie.vote_count?.toLocaleString() || 0} votes
                </Typography>
              </Box>
              
              {/* Genres */}
              <Box sx={{ mb: 3 }}>
                {movie.genres?.map((genre) => (
                  <Chip 
                    key={genre.id} 
                    label={genre.name} 
                    sx={{ mr: 1, mb: 1 }} 
                    color="primary" 
                    variant="outlined"
                  />
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Overview */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Overview
              </Typography>
              <Typography variant="body1" paragraph>
                {movie.overview || 'No overview available.'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Cast */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Cast
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {movie.credits?.cast?.slice(0, 6).map((person) => (
                  <Grid item xs={6} sm={4} key={person.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={person.profile_path 
                          ? getImageUrl(person.profile_path, 'w185') 
                          : 'https://via.placeholder.com/92x138?text=No+Image'}
                        alt={person.name}
                        sx={{
                          width: 46,
                          height: 69,
                          borderRadius: 1,
                          mr: 1,
                          objectFit: 'cover'
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {person.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {person.character}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              {/* Trailer */}
              {trailerKey && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Trailer
                  </Typography>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <YouTube videoId={trailerKey} opts={opts} />
                  </Box>
                </>
              )}
              
              {/* Production Companies */}
              {movie.production_companies?.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Production
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    {movie.production_companies.map((company) => (
                      <Box key={company.id} sx={{ textAlign: 'center', mr: 2 }}>
                        {company.logo_path ? (
                          <Box
                            component="img"
                            src={getImageUrl(company.logo_path, 'w92')}
                            alt={company.name}
                            sx={{
                              height: 30,
                              maxWidth: 100,
                              objectFit: 'contain',
                              mb: 1,
                              filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none'
                            }}
                          />
                        ) : (
                          <Typography variant="body2">{company.name}</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default MovieDetailsPage;