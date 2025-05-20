import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  alpha
} from '@mui/material';
import { ArrowBack, ArrowForward, MoodOutlined } from '@mui/icons-material';
import { useMovieContext } from '../context/MovieContext';
import MovieCard from '../components/MovieCard';

const MoodDiscoveryPage = () => {
  const { moodId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { 
    moods,
    selectedMood, 
    selectMood, 
    clearMood, 
    moodMovies,
    moodLoading, 
    moodError,
    moodPage,
    moodTotalPages,
    loadMoodMovies
  } = useMovieContext();
  
  // On component mount or when moodId changes
  useEffect(() => {
    if (moodId) {
      selectMood(moodId);
    } else {
      clearMood();
    }
    
    // Clean up on unmount
    return () => clearMood();
  }, [moodId, selectMood, clearMood]);
  
  // Handle mood selection
  const handleMoodSelect = (moodId) => {
    navigate(`/moods/${moodId}`);
  };
  
  // Load more movies
  const handleLoadMore = () => {
    if (selectedMood && moodPage < moodTotalPages) {
      loadMoodMovies(selectedMood, moodPage + 1);
    }
  };
  
  // Apply mood-specific styling
  const applyMoodStyling = () => {
    if (!selectedMood) return {};
    
    return {
      background: selectedMood.colorScheme.background,
      color: selectedMood.colorScheme.textColor
    };
  };
  
  // If we have a moodId but no mood, it's invalid
  if (moodId && !selectedMood && !moodLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Invalid mood selected. Please choose from the available options.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/moods')}
          startIcon={<ArrowBack />}
        >
          Back to Moods
        </Button>
      </Container>
    );
  }
  
  return (
    <Box sx={{ minHeight: '100vh', ...applyMoodStyling() }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              color: selectedMood ? selectedMood.colorScheme.textColor : 'inherit'
            }}
          >
            <MoodOutlined sx={{ mr: 1, fontSize: 'inherit' }} />
            {selectedMood ? `${selectedMood.name} Movies` : 'Mood Discovery'}
          </Typography>
          
          {selectedMood && (
            <Button 
              variant="outlined" 
              onClick={() => navigate('/moods')}
              startIcon={<ArrowBack />}
              sx={{
                borderColor: selectedMood.colorScheme.textColor,
                color: selectedMood.colorScheme.textColor,
                '&:hover': {
                  borderColor: selectedMood.colorScheme.textColor,
                  backgroundColor: alpha(selectedMood.colorScheme.textColor, 0.1)
                }
              }}
            >
              Back to All Moods
            </Button>
          )}
        </Box>
        
        {/* Selected mood description */}
        {selectedMood && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h5" gutterBottom>
              {selectedMood.emoji} {selectedMood.name}
            </Typography>
            <Typography variant="body1">
              {selectedMood.description}
            </Typography>
          </Paper>
        )}
        
        {/* Mood selection grid - show only if no mood is selected */}
        {!selectedMood && (
          <>
            <Typography variant="h5" gutterBottom>
              How do you feel today?
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4 }}>
              Choose a mood to discover films that match your emotional state or the feeling you want to experience.
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {moods.map((mood) => (
                <Grid item key={mood.id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8
                      },
                      background: mood.colorScheme.background
                    }}
                    onClick={() => handleMoodSelect(mood.id)}
                  >
                    <CardMedia
                      sx={{ height: 200 }}
                      image={mood.imageUrl || `https://source.unsplash.com/500x300/?${mood.name.toLowerCase()}`}
                      title={mood.name}
                    />
                    <CardContent>
                      <Typography 
                        variant="h5" 
                        component="div" 
                        gutterBottom
                        sx={{ 
                          color: mood.colorScheme.textColor,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {mood.emoji} {mood.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: mood.colorScheme.textColor }}
                      >
                        {mood.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        
        {/* Movies grid - show only if a mood is selected */}
        {selectedMood && (
          <>
            {moodError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {moodError}
              </Alert>
            )}
            
            {moodLoading && moodMovies.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '50vh',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <CircularProgress 
                  size={60} 
                  sx={{ color: selectedMood.colorScheme.primary }} 
                />
                <Typography variant="h6">
                  Finding {selectedMood.name.toLowerCase()} movies for you...
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {moodMovies.map((movie) => (
                    <Grid item key={movie.id} xs={12} sm={6} md={3} lg={3}>
                      <MovieCard movie={movie} />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Load more button */}
                {moodMovies.length > 0 && moodPage < moodTotalPages && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button 
                      variant="contained" 
                      onClick={handleLoadMore}
                      disabled={moodLoading}
                      endIcon={moodLoading ? <CircularProgress size={20} /> : <ArrowForward />}
                      sx={{
                        bgcolor: selectedMood.colorScheme.primary,
                        '&:hover': {
                          bgcolor: selectedMood.colorScheme.secondary
                        }
                      }}
                    >
                      {moodLoading ? 'Loading...' : 'Load More'}
                    </Button>
                  </Box>
                )}
                
                {/* No results message */}
                {!moodLoading && moodMovies.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No movies found for this mood. Try selecting a different mood.
                  </Alert>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default MoodDiscoveryPage;