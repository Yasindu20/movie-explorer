import React, { useState } from 'react';
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip, 
  Collapse,
  Divider,
  Button,
  alpha
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Star, 
  ExpandMore, 
  ExpandLess,
  PlayCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../api/tmdbApi';
import { useMovieContext } from '../context/MovieContext';
import { useRecommendation } from '../context/RecommendationContext';
import RatingSystem from './RatingSystem';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { favorites, addToFavorites, removeFromFavorites } = useMovieContext();
  const { addToWatchHistory } = useRecommendation();
  const [expanded, setExpanded] = useState(false);

  // Check if movie is in favorites
  const isFavorite = favorites.some(fav => fav.id === movie.id);

  // Handle favorite toggle
  const handleFavoriteToggle = (e) => {
    e.stopPropagation(); // Prevent card click
    if (isFavorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  // Navigate to movie details when card is clicked
  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
    // Add to watch history when clicked
    addToWatchHistory(movie.id);
  };

  // Toggle expanded state
  const toggleExpanded = (e) => {
    e.stopPropagation(); // Prevent card click
    setExpanded(!expanded);
  };

  // Format release date
  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).getFullYear();
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: theme => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
        }
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="300"
          image={getImageUrl(movie.poster_path)}
          alt={movie.title}
        />
        
        {/* Rating badge */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            bgcolor: 'rgba(0,0,0,0.7)', 
            color: 'gold', 
            borderRadius: '50%',
            width: 45,
            height: 45,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" component="span">
              {movie.vote_average?.toFixed(1) || 'N/A'}
            </Typography>
            <Star fontSize="small" sx={{ ml: 0.5 }} />
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatReleaseDate(movie.release_date)}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      {/* Action bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 1,
        py: 0.5
      }}>
        {/* Favorite button */}
        <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
          <IconButton 
            sx={{ 
              color: isFavorite ? 'red' : 'gray'
            }}
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>
        
        {/* Rating system toggle */}
        <Tooltip title={expanded ? "Hide rating" : "Rate this movie"}>
          <IconButton
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label="rate movie"
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Expandable rating panel */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom>
            Rate this movie:
          </Typography>
          <RatingSystem movieId={movie.id} />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayCircleOutline />}
              onClick={handleCardClick}
              fullWidth
            >
              View Details
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};

export default MovieCard;