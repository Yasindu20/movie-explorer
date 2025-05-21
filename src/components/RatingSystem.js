import React, { useState, useEffect } from 'react';
import {
  Box,
  Rating,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Zoom
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useRecommendation } from '../context/RecommendationContext';

const RatingSystem = ({ movieId, size = 'medium', showLabel = true, labelPosition = 'top' }) => {
  const { userRatings, rateMovie } = useRecommendation();
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(-1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Initialize rating from context if available
  useEffect(() => {
    if (userRatings[movieId]) {
      setValue(userRatings[movieId].rating);
    } else {
      setValue(0);
    }
  }, [userRatings, movieId]);
  
  const handleRatingChange = (event, newValue) => {
    setValue(newValue);
    rateMovie(movieId, newValue);
    setOpenSnackbar(true);
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  
  // Labels for hover state
  const labels = {
    0.5: 'Terrible',
    1: 'Terrible+',
    1.5: 'Poor',
    2: 'Poor+',
    2.5: 'Ok',
    3: 'Ok+',
    3.5: 'Good',
    4: 'Good+',
    4.5: 'Excellent',
    5: 'Excellent+',
  };
  
  // Get label based on hover or value
  const getLabelText = (value) => {
    return labels[value] || '';
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: labelPosition === 'left' ? 'row' : 'column',
      alignItems: labelPosition === 'left' ? 'center' : 'flex-start',
      gap: labelPosition === 'left' ? 2 : 0.5
    }}>
      {showLabel && (
        <Typography 
          component="legend" 
          variant={size === 'small' ? 'caption' : 'body2'}
          color="text.secondary"
          sx={{ 
            minWidth: labelPosition === 'left' ? 80 : 'auto',
            fontWeight: hover !== -1 ? 'bold' : 'normal' 
          }}
        >
          {hover !== -1 ? getLabelText(hover) : value > 0 ? 'Your Rating' : 'Rate This'}
        </Typography>
      )}
      
      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
        <Box>
          <Rating
            name={`movie-rating-${movieId}`}
            value={value}
            precision={0.5}
            size={size}
            onChange={handleRatingChange}
            onChangeActive={(event, newHover) => {
              setHover(newHover);
            }}
            icon={<Star fontSize="inherit" sx={{ color: 'gold' }} />}
            emptyIcon={<StarBorder fontSize="inherit" />}
            sx={{
              '& .MuiRating-iconFilled': {
                filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5))'
              }
            }}
          />
        </Box>
      </Zoom>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {value > 0 
            ? `Rating saved: ${value} stars` 
            : 'Rating removed'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RatingSystem;