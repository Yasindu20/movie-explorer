import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../api/tmdbApi';
import { useMovieContext } from '../context/MovieContext';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { favorites, addToFavorites, removeFromFavorites } = useMovieContext();

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
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: 5
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
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      {/* Favorite button */}
      <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
        <IconButton 
          sx={{ 
            position: 'absolute', 
            bottom: 5, 
            right: 5,
            color: isFavorite ? 'red' : 'gray'
          }}
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
      </Tooltip>
    </Card>
  );
};

export default MovieCard;