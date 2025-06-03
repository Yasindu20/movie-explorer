import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Grid
} from '@mui/material';
import {
  Add,
  SmartToy,
  Edit,
  TrendingUp,
  Psychology,
  Chat,
  AutoAwesome,
  RateReview
} from '@mui/icons-material';
import ReviewModeSelector from './ReviewModeSelector';
import AIReviewBot from './AIReviewBot';

const MovieReviews = ({ movie }) => {
  const theme = useTheme();
  const [reviewModeOpen, setReviewModeOpen] = useState(false);
  const [aiBotOpen, setAiBotOpen] = useState(false);
  const [reviews, setReviews] = useState([]); // This would come from your API
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Fetch reviews for this movie
    // setReviews(fetchedReviews);
  }, [movie.id]);

  const handleReviewCreated = (newReview) => {
    console.log('New review created:', newReview);
    // Add the new review to the reviews list
    setReviews(prev => [newReview, ...prev]);
  };

  return (
    <Box>
      {/* Main Reviews Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
            <RateReview sx={{ mr: 1 }} />
            User Reviews
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setReviewModeOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Write Review
          </Button>
        </Box>

        {/* Reviews List or Placeholder */}
        {reviews.length > 0 ? (
          <Box>
            {/* Display actual reviews here */}
            {reviews.map((review, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{review.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {review.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No reviews yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to share your thoughts about {movie.title}!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setReviewModeOpen(true)}
              sx={{ borderRadius: 3 }}
            >
              Write the First Review
            </Button>
          </Box>
        )}

        {/* Review Mode Selector */}
        <ReviewModeSelector
          open={reviewModeOpen}
          onClose={() => setReviewModeOpen(false)}
          movie={movie}
          onReviewCreated={handleReviewCreated}
        />
      </Paper>

      {/* AI Chat Bot Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)'
            : 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(30px, -30px)'
          }
        }}
      >
        {/* Header with gradient background */}
        <Box
          sx={{
            color: 'white',
            p: 3,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <SmartToy sx={{ fontSize: '1.5rem' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Chat with AI Review Assistant
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Have a natural conversation about {movie.title} and create your review effortlessly
              </Typography>
            </Box>
          </Box>

          {/* Feature highlights */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chat sx={{ mr: 1, fontSize: '1.2rem', opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Natural conversation
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Psychology sx={{ mr: 1, fontSize: '1.2rem', opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Smart questions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AutoAwesome sx={{ mr: 1, fontSize: '1.2rem', opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  AI-powered insights
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* CTA Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SmartToy />}
              onClick={() => setAiBotOpen(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'primary.main',
                fontWeight: 'bold',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Chatting with AI
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<TrendingUp />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              See How It Works
            </Button>
          </Box>
        </Box>

        {/* Info cards */}
        <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={1}
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 4
                  }
                }}
              >
                <Chat color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Just Talk
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share your thoughts naturally - no forms or complicated steps
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={1}
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 4
                  }
                }}
              >
                <Psychology color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Smart AI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI asks thoughtful questions to help you express your views
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={1}
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 4
                  }
                }}
              >
                <AutoAwesome color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Perfect Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get a polished, well-structured review ready to publish
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* AI Review Bot Dialog */}
      <AIReviewBot
        open={aiBotOpen}
        onClose={() => setAiBotOpen(false)}
        movie={movie}
        onReviewGenerated={handleReviewCreated}
      />
    </Box>
  );
};

export default MovieReviews;