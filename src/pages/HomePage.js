import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  Fade,
  Zoom,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Badge,
  SwipeableDrawer
} from '@mui/material';
import { 
  FilterList, 
  Clear, 
  TrendingUp, 
  Star, 
  StarBorder,
  Close, 
  CalendarMonth,
  Theaters,
  PlayArrow,
  AddCircle,
  AccessTime,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FiberManualRecord,
  NewReleases,
  Info
} from '@mui/icons-material';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { useMovieContext } from '../context/MovieContext';
import { fetchGenres, getImageUrl } from '../api/tmdbApi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// AutoPlaySwipeableViews component with auto-play functionality
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

// API key and base URL from the tmdbApi file
const API_KEY = '6f260ad398044fdb6affceaa84c86761';
const BASE_URL = 'https://api.themoviedb.org/3';

// Function to fetch new releases
const fetchNewReleases = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/now_playing`, {
      params: {
        api_key: API_KEY,
        language: 'en-US',
        page: 1,
        region: 'US' // Use 'US' for US releases, can be changed based on preference
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching new releases:', error);
    throw error;
  }
};

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Responsive breakpoints using useMediaQuery - Mobile First approach
  const isXsScreen = useMediaQuery(theme.breakpoints.only('xs'));
  const isSmScreen = useMediaQuery(theme.breakpoints.only('sm'));
  const isMdScreen = useMediaQuery(theme.breakpoints.only('md'));
  const isLgScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isTouchDevice = useMediaQuery('(hover: none)');
  
  const { 
    trendingMovies, 
    isLoading, 
    error, 
    loadTrendingMovies, 
    page, 
    totalPages,
    darkMode,
    addToFavorites
  } = useMovieContext();
  
  // State for filters
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [ratingRange, setRatingRange] = useState([0, 10]);
  const [selectedYear, setSelectedYear] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  
  // State for hero slideshow
  const [activeStep, setActiveStep] = useState(0);
  const [newReleases, setNewReleases] = useState([]);
  const [loadingNewReleases, setLoadingNewReleases] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  // Ref for slideshow touch area
  const slideshowRef = useRef(null);
  
  // Generate years for dropdown (from 1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  // Load new releases for the slideshow
  useEffect(() => {
    const loadNewReleases = async () => {
      setLoadingNewReleases(true);
      try {
        const releases = await fetchNewReleases();
        // Filter to only movies with backdrops and overviews
        const validReleases = releases
          .filter(movie => movie.backdrop_path && movie.overview)
          .slice(0, 5);
        
        setNewReleases(validReleases);
        if (validReleases.length > 0) {
          setSelectedMovie(validReleases[0]);
        }
      } catch (error) {
        console.error('Error loading new releases:', error);
      } finally {
        setLoadingNewReleases(false);
      }
    };
    
    loadNewReleases();
  }, []);

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
  
  // Update selected movie when active step changes
  useEffect(() => {
    if (newReleases.length > 0 && activeStep < newReleases.length) {
      setSelectedMovie(newReleases[activeStep]);
    }
  }, [activeStep, newReleases]);
  
  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedGenre) count++;
    if (ratingRange[0] > 0 || ratingRange[1] < 10) count++;
    if (selectedYear) count++;
    setActiveFilters(count);
  }, [selectedGenre, ratingRange, selectedYear]);

  // Handle slideshow navigation
  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % newReleases.length);
  }, [newReleases.length]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => 
      prevActiveStep === 0 ? newReleases.length - 1 : prevActiveStep - 1
    );
  }, [newReleases.length]);

  const handleStepChange = useCallback((step) => {
    setActiveStep(step);
  }, []);
  
  // Autoplay management
  const pauseAutoplay = useCallback(() => {
    setAutoplay(false);
  }, []);

  const resumeAutoplay = useCallback(() => {
    setAutoplay(true);
  }, []);
  
  // Drawer management
  const toggleDetailsDrawer = (open) => () => {
    setDetailsDrawerOpen(open);
  };
  
  // Load more trending movies
  const handleLoadMore = () => {
    loadTrendingMovies(page + 1);
  };

  // Handle genre selection
  const handleGenreClick = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genreId);
    }
  };
  
  // Handle rating range change
  const handleRatingChange = (event, newValue) => {
    setRatingRange(newValue);
  };
  
  // Handle year selection
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSelectedGenre(null);
    setRatingRange([0, 10]);
    setSelectedYear('');
  };
  
  // Toggle filter dialog
  const toggleFilterDialog = () => {
    setFilterDialogOpen(!filterDialogOpen);
  };
  
  // Navigate to movie details
  const navigateToMovie = (movieId) => {
    navigate(`/movie/${movieId}`);
  };
  
  // Add to favorites with animation
  const handleAddToFavorites = (movie) => {
    addToFavorites(movie);
    // Could add a toast notification here
  };
  
  // Format rating marks for slider
  const ratingMarks = [
    { value: 0, label: '0' },
    { value: 2, label: '2' },
    { value: 4, label: '4' },
    { value: 6, label: '6' },
    { value: 8, label: '8' },
    { value: 10, label: '10' }
  ];
  
  // Filter movies by all selected criteria
  const filteredMovies = trendingMovies.filter(movie => {
    // Filter by genre
    const passesGenreFilter = !selectedGenre || 
      (movie.genre_ids && movie.genre_ids.includes(selectedGenre));
    
    // Filter by rating
    const rating = movie.vote_average || 0;
    const passesRatingFilter = rating >= ratingRange[0] && rating <= ratingRange[1];
    
    // Filter by year
    let passesYearFilter = true;
    if (selectedYear) {
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
      passesYearFilter = releaseYear === selectedYear;
    }
    
    // Movie must pass all active filters
    return passesGenreFilter && passesRatingFilter && passesYearFilter;
  });
  
  // Get genre names for a movie
  const getGenreNames = (genreIds) => {
    if (!genreIds || !genres.length) return [];
    return genreIds
      .map(id => genres.find(genre => genre.id === id))
      .filter(Boolean)
      .map(genre => genre.name);
  };
  
  // Format release date
  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'Coming Soon';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // If the movie was released in the last 14 days, show "X days ago"
    const dayDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (dayDiff < 14 && dayDiff >= 0) {
      return dayDiff === 0 ? 'Released today!' : `Released ${dayDiff} day${dayDiff === 1 ? '' : 's'} ago`;
    }
    
    // If the movie is yet to be released, show "Coming in X days"
    if (dayDiff < 0) {
      return `Coming in ${Math.abs(dayDiff)} days`;
    }
    
    // Otherwise show the formatted date
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Truncate text to a specific length
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Slideshow Section with New Releases - REDUCED HEIGHT */}
      {newReleases.length > 0 && !loadingNewReleases ? (
        <Box
          ref={slideshowRef}
          sx={{
            position: 'relative',
            // Reduced height for better scrolling
            height: {
              xs: '50vh', // Reduced from 70vh
              sm: '55vh', // Reduced from 75vh
              md: '60vh', // Reduced from 80vh
              lg: '65vh'  // Reduced from 90vh
            },
            width: '100%',
            overflow: 'hidden',
            mb: { xs: 2, sm: 4, md: 6 },
          }}
          onMouseEnter={!isTouchDevice ? pauseAutoplay : undefined}
          onMouseLeave={!isTouchDevice ? resumeAutoplay : undefined}
          onTouchStart={pauseAutoplay}
          onTouchEnd={() => setTimeout(resumeAutoplay, 5000)} // Resume after user interaction
        >
          {/* New Releases Badge - MOVED TO THE RIGHT */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 10, sm: 16, md: 24 },
              // Moved right to avoid overlapping with release date
              right: { xs: 10, sm: 16, md: 40 },
              zIndex: 10,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)' 
                : 'linear-gradient(90deg, #d32f2f 0%, #f57c00 100%)',
              color: 'white',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              borderRadius: { xs: 1, sm: 2 },
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transform: 'rotate(2deg)', // Changed rotation for visual interest
              display: 'flex',
              alignItems: 'center',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                zIndex: -1,
                borderRadius: 'inherit',
              }
            }}
          >
            <NewReleases sx={{ 
              mr: 0.5, 
              fontSize: { xs: '1rem', sm: '1.25rem' } 
            }} />
            <Typography 
              variant="subtitle2" 
              component="span" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
              }}
            >
              New Releases
            </Typography>
          </Box>
        
          {/* Slideshow with AutoPlay */}
          <AutoPlaySwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
            interval={6000}
            disabled={!autoplay}
            resistance
            springConfig={{ duration: '1s', easeFunction: 'ease-in-out', delay: '0s' }}
            style={{ height: '100%' }}
          >
            {newReleases.map((movie, index) => (
              <Box key={movie.id} style={{ height: '100%' }}>
                {Math.abs(activeStep - index) <= 1 ? (
                  <Box
                    sx={{
                      position: 'relative',
                      height: '100%',
                      width: '100%',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(
                          0deg,
                          ${darkMode ? 'rgba(18, 18, 18, 1)' : 'rgba(255, 255, 255, 1)'} 0%,
                          ${darkMode ? 'rgba(18, 18, 18, 0.7)' : 'rgba(255, 255, 255, 0.7)'} 15%,
                          transparent 40%,
                          transparent 60%,
                          ${darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'} 100%
                        )`,
                        zIndex: 1
                      }
                    }}
                  >
                    {/* Background Image with Ken Burns Effect - Mobile-optimized */}
                    <Box
                      component="img"
                      src={getImageUrl(movie.backdrop_path, isXsScreen ? 'w780' : 'w1280')}
                      alt={movie.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: darkMode ? 'brightness(0.7)' : 'brightness(0.9)',
                        transition: 'all 0.5s ease',
                        animation: {
                          xs: 'none', // Disable animation on mobile for better performance
                          sm: 'kenBurns 20s infinite alternate ease-in-out',
                        },
                        animationDelay: `${index * -5}s`,
                        '@keyframes kenBurns': {
                          '0%': {
                            transform: 'scale(1) translate(0%, 0%)',
                          },
                          '100%': {
                            transform: 'scale(1.1) translate(-1%, -1%)',
                          },
                        },
                      }}
                    />
                    
                    {/* Content Overlay - Mobile-first approach */}
                    <Container 
                      maxWidth="xl" 
                      sx={{ 
                        position: 'relative', 
                        zIndex: 2, 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        pb: { xs: 2, sm: 4, md: 8 },
                        pt: { xs: 2, sm: 0 }
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Fade in={true} timeout={1000}>
                            <Box>
                              {/* Release Date Banner - Responsive sizing */}
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
                                {formatReleaseDate(movie.release_date)}
                              </Typography>
                              
                              {/* Movie Title with Glow Effect - Responsive typography */}
                              <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                  fontWeight: 800,
                                  textShadow: darkMode 
                                    ? '0 0 20px rgba(255,255,255,0.3), 0 2px 10px rgba(0,0,0,0.5)' 
                                    : '0 2px 10px rgba(0,0,0,0.3)',
                                  mb: { xs: 1, sm: 2 },
                                  // Mobile-first typography scaling
                                  fontSize: { 
                                    xs: '1.75rem', 
                                    sm: '2.5rem', 
                                    md: '3.5rem', 
                                    lg: '4rem' 
                                  },
                                  lineHeight: { xs: 1.1, sm: 1.2 },
                                  background: darkMode 
                                    ? 'linear-gradient(45deg, #fff 30%, #bbb 90%)' 
                                    : 'linear-gradient(45deg, #111 30%, #333 90%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: darkMode ? 'transparent' : 'transparent',
                                  letterSpacing: { xs: '-0.3px', sm: '-0.5px' },
                                }}
                              >
                                {isXsScreen ? truncateText(movie.title, 50) : movie.title}
                              </Typography>
                              
                              {/* Movie Info Chips - Mobile optimized */}
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                flexWrap: 'wrap', 
                                mb: { xs: 1, sm: 2 }, 
                                gap: { xs: 0.5, sm: 1 }
                              }}>
                                <Chip
                                  icon={<Star sx={{ 
                                    color: 'gold !important',
                                    fontSize: { xs: '0.9rem', sm: 'inherit' }
                                  }} />}
                                  label={`${movie.vote_average?.toFixed(1)}/10`}
                                  size={isXsScreen ? "small" : "medium"}
                                  sx={{
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    fontWeight: 'bold',
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: 'inherit' },
                                    height: { xs: 24, sm: 32 },
                                    mb: { xs: 0.5, sm: 0 }
                                  }}
                                />
                                
                                <Chip
                                  icon={<CalendarMonth sx={{ fontSize: { xs: '0.9rem', sm: 'inherit' } }} />}
                                  label={movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                                  size={isXsScreen ? "small" : "medium"}
                                  sx={{
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: 'inherit' },
                                    height: { xs: 24, sm: 32 },
                                    mb: { xs: 0.5, sm: 0 }
                                  }}
                                />
                                
                                {getGenreNames(movie.genre_ids).slice(0, isXsScreen ? 1 : isSmScreen ? 2 : 3).map(genre => (
                                  <Chip
                                    key={genre}
                                    label={genre}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                                      backdropFilter: 'blur(4px)',
                                      borderRadius: '20px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                      height: { xs: 24, sm: 32 },
                                      mb: { xs: 0.5, sm: 0 }
                                    }}
                                  />
                                ))}
                              </Box>
                              
                              {/* Movie Overview Text - Adaptive for mobile - SHORTENED */}
                              {!isXsScreen && (
                                <Typography
                                  variant="body1"
                                  sx={{
                                    mb: { xs: 1.5, sm: 3 },
                                    maxWidth: '100%', // Allow full width since poster is removed
                                    display: '-webkit-box',
                                    WebkitLineClamp: { xs: 2, sm: 2, md: 3 }, // Reduced number of lines
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {movie.overview}
                                </Typography>
                              )}
                              
                              {/* Action Buttons - Mobile optimized */}
                              <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: { xs: 1, sm: 2 },
                                mt: { xs: 1, sm: 0 }
                              }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size={isXsScreen ? "medium" : "large"}
                                  onClick={() => navigateToMovie(movie.id)}
                                  sx={{
                                    px: { xs: 2, sm: 3, md: 4 },
                                    py: { xs: 0.8, sm: 1, md: 1.2 },
                                    borderRadius: '50px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    backdropFilter: 'blur(4px)',
                                    background: theme.palette.mode === 'dark' 
                                      ? 'linear-gradient(45deg, #1565C0 30%, #0D47A1 90%)' 
                                      : 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
                                    '&:hover': {
                                      transform: 'translateY(-2px) scale(1.03)',
                                      boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
                                    },
                                    transition: 'all 0.3s ease',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                                  }}
                                >
                                  <PlayArrow sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }} /> 
                                  Watch Details
                                </Button>
                                
                                {isXsScreen ? (
                                  <IconButton
                                    color="primary"
                                    onClick={toggleDetailsDrawer(true)}
                                    sx={{
                                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                                      backdropFilter: 'blur(4px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    }}
                                  >
                                    <Info />
                                  </IconButton>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size={isXsScreen ? "medium" : "large"}
                                    onClick={() => handleAddToFavorites(movie)}
                                    sx={{
                                      px: { xs: 2, sm: 3 },
                                      py: { xs: 0.8, sm: 1, md: 1.2 },
                                      borderRadius: '50px',
                                      fontWeight: 'bold',
                                      borderWidth: 2,
                                      borderColor: 'rgba(255, 255, 255, 0.5)',
                                      color: 'white',
                                      backdropFilter: 'blur(4px)',
                                      background: 'rgba(0, 0, 0, 0.3)',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: 'white',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                      },
                                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                                    }}
                                  >
                                    <AddCircle sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }} /> 
                                    Add to List
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Fade>
                        </Grid>
                      </Grid>
                    </Container>
                  </Box>
                ) : null}
              </Box>
            ))}
          </AutoPlaySwipeableViews>
          
          {/* Slideshow Navigation Dots - Mobile Optimized */}
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 10, sm: 20, md: 30 },
              zIndex: 3,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Paper
              elevation={8}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: { xs: 0.3, sm: 0.5 },
                borderRadius: 10,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Custom Dot Indicators - Smaller for mobile */}
              {newReleases.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => handleStepChange(index)}
                  sx={{
                    mx: { xs: 0.3, sm: 0.5 },
                    cursor: 'pointer',
                    padding: { xs: 0.7, sm: 1 },
                    display: 'flex',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <FiberManualRecord
                    sx={{
                      fontSize: index === activeStep 
                        ? { xs: 10, sm: 12, md: 14 } 
                        : { xs: 8, sm: 9, md: 10 },
                      color: index === activeStep 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary,
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Box>
          
          {/* Arrow Navigation Controls - Touch-friendly and responsive */}
          <IconButton
            onClick={handleBack}
            aria-label="Previous movie"
            sx={{
              position: 'absolute',
              left: { xs: 2, sm: 5, md: 10, lg: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'white',
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              backdropFilter: 'blur(5px)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              // Adjust size for mobile
              padding: { xs: 0.8, sm: 1.2, md: 1.5 },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>
          
          <IconButton
            onClick={handleNext}
            aria-label="Next movie"
            sx={{
              position: 'absolute',
              right: { xs: 2, sm: 5, md: 10, lg: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'white',
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              backdropFilter: 'blur(5px)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              // Adjust size for mobile
              padding: { xs: 0.8, sm: 1.2, md: 1.5 },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
          
          {/* Touch indication for mobile - appears briefly when page loads */}
          {isTouchDevice && (
            <Fade in={true} timeout={1000}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  color: theme.palette.text.primary,
                  borderRadius: 2,
                  p: 1.5,
                  display: { xs: 'flex', sm: 'none' },
                  alignItems: 'center',
                  backdropFilter: 'blur(5px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  animation: 'fadeOut 3s forwards',
                  '@keyframes fadeOut': {
                    '0%': { opacity: 1 },
                    '70%': { opacity: 1 },
                    '100%': { opacity: 0, display: 'none' }
                  }
                }}
              >
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                  <KeyboardArrowLeft sx={{ mr: 0.5 }} />
                  Swipe to navigate
                  <KeyboardArrowRight sx={{ ml: 0.5 }} />
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>
      ) : (
        // Loading state for hero section - Mobile responsive
        <Box 
          sx={{ 
            height: { xs: '30vh', sm: '35vh', md: '40vh', lg: '45vh' }, // Reduced loading height
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.paper',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size={isXsScreen ? 40 : 60} />
          <Typography variant="body2" color="text.secondary">
            Loading new releases...
          </Typography>
        </Box>
      )}

      {/* Bottom drawer for movie details on mobile */}
      <SwipeableDrawer
        anchor="bottom"
        open={detailsDrawerOpen}
        onClose={toggleDetailsDrawer(false)}
        onOpen={toggleDetailsDrawer(true)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '85vh',
          }
        }}
        disableSwipeToOpen
      >
        {selectedMovie && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Movie Details
              </Typography>
              <IconButton onClick={toggleDetailsDrawer(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Box
                component="img"
                src={getImageUrl(selectedMovie.poster_path, 'w154')}
                alt={selectedMovie.title}
                sx={{
                  width: 100,
                  height: 150,
                  borderRadius: 1,
                  mr: 2,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}
              />
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedMovie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {formatReleaseDate(selectedMovie.release_date)}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {getGenreNames(selectedMovie.genre_ids).map(genre => (
                    <Chip 
                      key={genre} 
                      label={genre} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ color: 'gold', mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">
                    {selectedMovie.vote_average?.toFixed(1)}/10
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body1" paragraph>
              {selectedMovie.overview}
            </Typography>
            
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                toggleDetailsDrawer(false)();
                navigateToMovie(selectedMovie.id);
              }}
              sx={{ borderRadius: 2 }}
            >
              View Full Details
            </Button>
          </Box>
        )}
      </SwipeableDrawer>

      <Container maxWidth="xl" sx={{ mt: 0, mb: 6 }}>
        {/* Search Bar with rounded edges - Mobile optimized */}
        <Box sx={{ 
          mb: { xs: 3, sm: 4, md: 5 }, 
          transform: 'translateY(-50%)', 
          position: 'relative', 
          zIndex: 2,
          display: newReleases.length > 0 ? 'block' : 'none'
        }}>
          <Paper
            elevation={8}
            sx={{
              maxWidth: 800,
              mx: 'auto',
              borderRadius: '50px',
              p: { xs: 0.5, sm: 1 },
              backdropFilter: 'blur(10px)',
              background: alpha(theme.palette.background.paper, 0.8)
            }}
          >
            <SearchBar />
          </Paper>
        </Box>

        {/* Filter Controls Bar - Mobile-first approach */}
        <Box sx={{ 
          mb: { xs: 2, sm: 3, md: 4 }, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: { xs: 2, md: 0 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 800, 
                // Mobile-first typography
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
                display: 'flex',
                alignItems: 'center',
                background: darkMode 
                  ? 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)' 
                  : 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <TrendingUp 
                color="primary" 
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
                  mr: { xs: 0.5, sm: 1 }
                }} 
              />
              Trending Movies
              {activeFilters > 0 && (
                <Chip
                  label={`${filteredMovies.length} results`}
                  size="small"
                  sx={{ ml: { xs: 1, sm: 2 }, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              )}
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Badge badgeContent={activeFilters} color="primary" invisible={activeFilters === 0}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={toggleFilterDialog}
                fullWidth={isXsScreen}
                sx={{
                  borderRadius: '20px',
                  px: { xs: 1.5, sm: 2 },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                Filters
              </Button>
            </Badge>
          </Box>
        </Box>

        {/* Movies Grid - Mobile-first responsive grid */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: { xs: 2, sm: 3, md: 4 },
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            {error}
          </Alert>
        )}

        {isLoading && trendingMovies.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: { xs: '30vh', sm: '40vh', md: '50vh' },
              flexDirection: 'column',
              gap: 2
            }}
          >
            <CircularProgress size={isXsScreen ? 40 : 60} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              Loading trending movies...
            </Typography>
          </Box>
        ) : (
          <>
            {filteredMovies.length === 0 ? (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, sm: 3, md: 4 }, 
                  mb: { xs: 2, sm: 3, md: 4 },
                  borderRadius: 3,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  No movies match your current filters
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Try adjusting your filter criteria or clear filters to see all trending movies.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleClearFilters}
                  startIcon={<Clear />}
                >
                  Clear All Filters
                </Button>
              </Paper>
            ) : (
              <Fade in={!isLoading} timeout={800}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {filteredMovies.map((movie, index) => (
                    <Grid 
                      item 
                      key={movie.id} 
                      // Mobile-first responsive grid
                      xs={6} 
                      sm={4} 
                      md={3} 
                      lg={3}
                      sx={{ 
                        transform: {
                          xs: 'none', // Disable the transform on very small screens
                          sm: `translateY(${index % 2 === 0 ? '10px' : '0px'})`
                        },
                        transition: 'transform 0.3s ease-in-out'
                      }}
                    >
                      <Zoom 
                        in={true} 
                        style={{ 
                          // Reduced delay on mobile for better perceived performance
                          transitionDelay: `${isXsScreen ? index * 30 : index * 50}ms` 
                        }}
                      >
                        <Box>
                          <MovieCard movie={movie} />
                        </Box>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </Fade>
            )}

            {filteredMovies.length > 0 && !activeFilters && page < totalPages && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: { xs: 3, sm: 4, md: 6 }, 
                  mb: { xs: 1, sm: 2 } 
                }}
              >
                <Button 
                  variant="contained" 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size={isXsScreen ? "medium" : "large"}
                  sx={{
                    minWidth: { xs: 160, sm: 200 },
                    borderRadius: '30px',
                    py: { xs: 1, sm: 1.5 },
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={isXsScreen ? 20 : 24} color="inherit" />
                  ) : (
                    'Load More Movies'
                  )}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Filter Dialog - Mobile optimized */}
      <Dialog
        open={filterDialogOpen}
        onClose={toggleFilterDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={isXsScreen} // Full screen dialog on mobile
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: isXsScreen ? 0 : 3,
            overflow: 'hidden'
          }
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            <FilterList sx={{ mr: 1 }} />
            Movie Filters
            {activeFilters > 0 && (
              <Chip 
                label={activeFilters} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }} 
              />
            )}
          </Typography>
          <IconButton onClick={toggleFilterDialog} edge="end" aria-label="close">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
          <Stack spacing={4} sx={{ my: 1 }}>
            {/* Genre Filter - Touch-friendly */}
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Movie Genres
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
                      sx={{ 
                        m: 0.5,
                        borderRadius: '50px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)'
                        },
                        // Touch-friendly larger size on mobile
                        height: { xs: 36, sm: 32 },
                        fontSize: { xs: '0.8rem', sm: '0.75rem' }
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>
            
            <Divider flexItem />
            
            {/* Rating Filter - Mobile optimized */}
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center', 
                  mb: 3,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <Star sx={{ mr: 1, color: 'gold' }} />
                Rating Range
              </Typography>
              <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
                <Slider
                  value={ratingRange}
                  onChange={handleRatingChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10}
                  step={0.5}
                  marks={ratingMarks}
                  valueLabelFormat={value => `${value}`}
                  sx={{
                    '& .MuiSlider-thumb': {
                      height: { xs: 28, sm: 24 }, // Larger thumb on mobile for touch
                      width: { xs: 28, sm: 24 },
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)'
                      }
                    },
                    '& .MuiSlider-rail': {
                      height: { xs: 10, sm: 8 }, // Thicker track on mobile
                      borderRadius: 4
                    },
                    '& .MuiSlider-track': {
                      height: { xs: 10, sm: 8 },
                      borderRadius: 4
                    },
                    '& .MuiSlider-mark': {
                      height: { xs: 10, sm: 8 },
                      width: 2
                    }
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mt: 2 
                }}>
                  <StarBorder sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="body1" fontWeight="medium">
                    {ratingRange[0]} to {ratingRange[1]} stars
                  </Typography>
                  <Star sx={{ color: 'gold', ml: 1 }} />
                </Box>
              </Box>
            </Box>
            
            <Divider flexItem />
            
            {/* Year Filter - Touch-friendly dropdown */}
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <CalendarMonth sx={{ mr: 1 }} />
                Release Year
              </Typography>
              <FormControl 
                variant="outlined" 
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  },
                  // Increase height on mobile for touch
                  '& .MuiInputBase-root': {
                    height: { xs: 56, sm: 'auto' }
                  }
                }}
              >
                <InputLabel id="year-select-label">Select Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  value={selectedYear}
                  onChange={handleYearChange}
                  label="Select Year"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Any year</em>
                  </MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 3, sm: 2 }, 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'space-between' },
          gap: { xs: 1, sm: 0 }
        }}>
          {activeFilters > 0 && (
            <Button 
              onClick={handleClearFilters} 
              color="error"
              startIcon={<Clear />}
              variant="outlined"
              fullWidth={isXsScreen}
              sx={{
                borderRadius: '20px',
                order: { xs: 2, sm: 1 },
                mb: { xs: 0, sm: 0 }
              }}
            >
              Clear All Filters
            </Button>
          )}
          <Button 
            onClick={toggleFilterDialog} 
            variant="contained" 
            color="primary"
            fullWidth={isXsScreen}
            sx={{
              borderRadius: '20px',
              px: 3,
              order: { xs: 1, sm: 2 },
              mb: { xs: activeFilters > 0 ? 1 : 0, sm: 0 }
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;