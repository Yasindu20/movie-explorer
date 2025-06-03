import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import ReviewModeSelector from './ReviewModeSelector';

const MovieReviews = ({ movie }) => {
  const [reviewModeOpen, setReviewModeOpen] = useState(false);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h5" fontWeight="bold">
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

      {/* Placeholder content - you can expand this later */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
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

      {/* Review Mode Selector */}
      <ReviewModeSelector
        open={reviewModeOpen}
        onClose={() => setReviewModeOpen(false)}
        movie={movie}
      />
    </Paper>
  );
};

export default MovieReviews;