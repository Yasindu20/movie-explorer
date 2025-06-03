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
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Star,
  CalendarMonth,
  AccessTime,
  Language,
  AttachMoney,
  PlayArrow,
  Share
} from '@mui/icons-material';
import { fetchMovieDetails, getImageUrl } from '../api/tmdbApi';
import { useMovieContext } from '../context/MovieContext';
import WhereToWatch from '../components/WhereToWatch';
import YouTube from 'react-youtube';
import AIReviewSynthesis from '../components/AIReviewSynthesis';
import MovieReviews from '../components/MovieReviews';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { favorites, addToFavorites, removeFromFavorites } = useMovieContext();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

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

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
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
    height: '800',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0
    },
  };

  // Toggle trailer display
  const toggleTrailer = () => {
    setShowTrailer(!showTrailer);
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading movie details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>Movie not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Cinematic Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '70vh', sm: '80vh', md: '90vh' },
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Back Button - Always Visible */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            zIndex: 10
          }}
        >
          <Zoom in={true} timeout={500}>
            <Button
              onClick={handleGoBack}
              variant="contained"
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: 30,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
                color: theme.palette.text.primary,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back
            </Button>
          </Zoom>
        </Box>

        {/* Background Image with Parallax Effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'w1280')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'scale(1.1)',
            filter: 'brightness(0.7)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(
                0deg,
                ${theme.palette.background.default} 0%,
                transparent 40%,
                transparent 60%,
                ${alpha(theme.palette.mode === 'dark' ? '#000' : '#000', 0.7)} 100%
              )`,
              zIndex: 1
            },
            '@keyframes slowZoom': {
              '0%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1.2)' }
            },
            animation: 'slowZoom 30s infinite alternate ease-in-out'
          }}
        />

        {/* Movie Info Overlay - Animation with Fade In */}
        <Container
          maxWidth="xl"
          sx={{
            height: '100%',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            pt: { xs: 4, sm: 6, md: 8 },
            pb: { xs: 8, sm: 12, md: 16 }
          }}
        >
          <Fade in={true} timeout={1000}>
            <Grid container spacing={3} alignItems="flex-end">
              {/* Movie Poster - Floating Animation */}
              <Grid item xs={12} sm={4} md={3} lg={3}
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}
              >
                <Zoom in={true} timeout={800}>
                  <Box
                    component="img"
                    src={getImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    sx={{
                      width: { xs: '200px', sm: '220px', md: '280px' },
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
                      transform: 'translateY(20px)',
                      border: '3px solid rgba(255,255,255,0.2)',
                      '@keyframes float': {
                        '0%': { transform: 'translateY(20px)' },
                        '50%': { transform: 'translateY(10px)' },
                        '100%': { transform: 'translateY(20px)' }
                      },
                      animation: 'float 6s infinite ease-in-out',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(10px) scale(1.03)',
                        boxShadow: '0 30px 100px rgba(0,0,0,0.55)',
                      }
                    }}
                  />
                </Zoom>
              </Grid>

              {/* Movie Title and Info */}
              <Grid item xs={12} sm={8} md={9} lg={9}>
                <Box>
                  {/* Release Year with Glass Effect */}
                  <Typography
                    variant="overline"
                    sx={{
                      display: 'inline-block',
                      color: 'white',
                      fontWeight: 'bold',
                      mb: { xs: 1, sm: 2 },
                      background: 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)',
                      px: { xs: 1, sm: 2 },
                      py: { xs: 0.3, sm: 0.5 },
                      borderRadius: 1,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                      letterSpacing: { xs: 0.5, sm: 1 },
                      fontSize: { xs: '0.6rem', sm: '0.75rem' }
                    }}
                  >
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Coming Soon'}
                  </Typography>

                  {/* Movie Title with Text Glow */}
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '2rem', sm: '3.5rem', md: '4.5rem' },
                      lineHeight: 1.1,
                      mb: { xs: 1, sm: 2 },
                      color: 'white',
                      textShadow: '0 0 20px rgba(0,0,0,0.7)',
                      letterSpacing: '-1px'
                    }}
                  >
                    {movie.title}
                  </Typography>

                  {/* Rating and Genres - Glass Morphism Effect */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: { xs: 2, sm: 3 }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: alpha('#000', 0.5),
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.7,
                        mr: 1
                      }}
                    >
                      <Star sx={{ color: 'gold', mr: 0.5 }} />
                      <Typography variant="body1" fontWeight="bold">
                        {movie.vote_average?.toFixed(1) || 'N/A'}/10
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {movie.genres?.slice(0, isMobile ? 2 : 4).map((genre) => (
                        <Chip
                          key={genre.id}
                          label={genre.name}
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            bgcolor: alpha('#000', 0.5),
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            '& .MuiChip-label': {
                              fontWeight: 500
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Action Buttons - Floating and Glowing */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      mt: { xs: 2, sm: 3 },
                      mb: 1
                    }}
                  >
                    {trailerKey && (
                      <Button
                        variant="contained"
                        color="error"
                        size={isMobile ? "medium" : "large"}
                        startIcon={<PlayArrow />}
                        onClick={toggleTrailer}
                        sx={{
                          borderRadius: 30,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 1, sm: 1.2 },
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #f44336 30%, #ff9800 90%)',
                          boxShadow: '0 4px 20px rgba(244, 67, 54, 0.5)',
                          '&:hover': {
                            boxShadow: '0 6px 30px rgba(244, 67, 54, 0.7)',
                            transform: 'translateY(-3px) scale(1.02)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {showTrailer ? 'Hide Trailer' : 'Watch Trailer'}
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      color={isFavorite ? 'secondary' : 'primary'}
                      size={isMobile ? "medium" : "large"}
                      startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
                      onClick={handleFavoriteToggle}
                      sx={{
                        borderRadius: 30,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.2 },
                        fontWeight: 'bold',
                        backgroundColor: isFavorite
                          ? alpha(theme.palette.secondary.main, 0.9)
                          : alpha(theme.palette.primary.main, 0.9),
                        backdropFilter: 'blur(10px)',
                        boxShadow: isFavorite
                          ? '0 4px 20px rgba(233, 30, 99, 0.4)'
                          : '0 4px 20px rgba(25, 118, 210, 0.4)',
                        '&:hover': {
                          backgroundColor: isFavorite
                            ? theme.palette.secondary.main
                            : theme.palette.primary.main,
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: isFavorite
                            ? '0 6px 30px rgba(233, 30, 99, 0.6)'
                            : '0 6px 30px rgba(25, 118, 210, 0.6)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                    </Button>

                    <Tooltip title="Share movie">
                      <IconButton
                        aria-label="share"
                        sx={{
                          bgcolor: alpha(theme.palette.background.paper, 0.2),
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.background.paper, 0.3),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Share />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Trailer Section - Conditional Render with Animation */}
      {showTrailer && trailerKey && (
        <Fade in={showTrailer} timeout={500}>
          <Box sx={{
            position: 'relative',
            height: { xs: 320, sm: 500, md: 650, lg: 750 },
            bgcolor: 'black',
            mb: { xs: 2, sm: 4 },
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            borderRadius: { xs: 0, sm: 2 },
            overflow: 'hidden',
            mx: { xs: 0, sm: 2, md: 3 }
          }}>
            <YouTube videoId={trailerKey} opts={opts} />
          </Box>
        </Fade>
      )}

      {/* Movie Details Content */}
      <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 6 } }}>
        {/* Where to Watch Section - Full Width */}
        <Box sx={{ mb: 4 }}>
          <WhereToWatch movie={movie} />
        </Box>

        {/* AI Review Synthesis Section */}
        <Box sx={{ mb: 4 }}>
          <AIReviewSynthesis
            movieId={movie.id}
            movieTitle={movie.title}
          />
        </Box>

        {/* Enhanced Movie Reviews Section with AI Bot - THIS IS THE KEY CHANGE */}
        <Box sx={{ mb: 4 }}>
          <MovieReviews movie={movie} />
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Available only on mobile */}
          {isMobile && (
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                  Overview
                </Typography>
                <Typography variant="body1">
                  {movie.overview || 'No overview available.'}
                </Typography>
              </Box>

              {/* Movie Stats Cards - 2x2 Grid for Mobile */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        height: '100%'
                      }}
                    >
                      <CalendarMonth color="primary" sx={{ fontSize: '1.8rem', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Release Date
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {movie.release_date
                          ? new Date(movie.release_date).toLocaleDateString()
                          : 'Unknown'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        height: '100%'
                      }}
                    >
                      <AccessTime color="primary" sx={{ fontSize: '1.8rem', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Runtime
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatRuntime(movie.runtime)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        height: '100%'
                      }}
                    >
                      <Language color="primary" sx={{ fontSize: '1.8rem', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Language
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {movie.original_language?.toUpperCase() || 'Unknown'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        height: '100%'
                      }}
                    >
                      <AttachMoney color="primary" sx={{ fontSize: '1.8rem', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Budget
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(movie.budget)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          {/* Tablet and Desktop Layout */}
          {!isMobile && (
            <>
              {/* Left Column - Hidden on Mobile */}
              <Grid item xs={12} md={4}>
                {/* Movie Stats Cards */}
                <Paper
                  elevation={3}
                  sx={{
                    p: { sm: 2, md: 3 },
                    borderRadius: 3,
                    mb: 4
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      pb: 1
                    }}
                  >
                    Movie Facts
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={12}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <CalendarMonth color="primary" sx={{ fontSize: '1.5rem', mr: 1.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Release Date
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {movie.release_date
                              ? new Date(movie.release_date).toLocaleDateString()
                              : 'Unknown'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={12}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <AccessTime color="primary" sx={{ fontSize: '1.5rem', mr: 1.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Runtime
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatRuntime(movie.runtime)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={12}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Language color="primary" sx={{ fontSize: '1.5rem', mr: 1.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Original Language
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {movie.original_language?.toUpperCase() || 'Unknown'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={12}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <AttachMoney color="primary" sx={{ fontSize: '1.5rem', mr: 1.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Budget
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(movie.budget)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Production Companies */}
                {movie.production_companies?.length > 0 && (
                  <Paper
                    elevation={3}
                    sx={{
                      p: { sm: 2, md: 3 },
                      borderRadius: 3,
                      mb: 4
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 1
                      }}
                    >
                      Production
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {movie.production_companies.map((company) => (
                        <Box key={company.id} sx={{ display: 'flex', alignItems: 'center' }}>
                          {company.logo_path ? (
                            <Box
                              component="img"
                              src={getImageUrl(company.logo_path, 'w92')}
                              alt={company.name}
                              sx={{
                                height: 30,
                                width: 60,
                                objectFit: 'contain',
                                mr: 2,
                                filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none'
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 60,
                                height: 30,
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                                mr: 2
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                No logo
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="body2">{company.name}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}
              </Grid>

              {/* Right Column - Main Content */}
              <Grid item xs={12} md={8}>
                {/* Overview Section */}
                <Paper elevation={3} sx={{ p: { sm: 3, md: 4 }, borderRadius: 3, mb: 4 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    Overview
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {movie.overview || 'No overview available.'}
                  </Typography>
                </Paper>

                {/* Cast Section with Hover Effects */}
                <Paper elevation={3} sx={{ p: { sm: 3, md: 4 }, borderRadius: 3, mb: 4 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    Top Cast
                  </Typography>
                  <Grid container spacing={2}>
                    {movie.credits?.cast?.slice(0, 6).map((person) => (
                      <Grid item xs={12} sm={6} md={4} key={person.id}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: 6
                            }
                          }}
                        >
                          <Box
                            component="img"
                            src={person.profile_path
                              ? getImageUrl(person.profile_path, 'w185')
                              : 'https://via.placeholder.com/92x138?text=No+Image'}
                            alt={person.name}
                            sx={{
                              width: 60,
                              height: 90,
                              borderRadius: 1,
                              mr: 2,
                              objectFit: 'cover',
                              boxShadow: 2
                            }}
                          />
                          <Box>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              {person.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {person.character}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default MovieDetailsPage;