import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box,  
  Button, 
  Paper 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useMovieContext } from '../context/MovieContext';
import { Favorite, Home } from '@mui/icons-material';

const FavoritesPage = () => {
  const { favorites } = useMovieContext();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 1,
          mb: 3
        }}
      >
        <Favorite sx={{ mr: 1, color: 'red' }} />
        My Favorite Movies
      </Typography>
      
      {favorites.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" paragraph>
            You haven't added any favorite movies yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Browse through trending movies or search for your favorites and click the heart icon to add them here.
          </Typography>
          <Button 
            component={RouterLink} 
            to="/" 
            variant="contained" 
            startIcon={<Home />}
            sx={{ mt: 2 }}
          >
            Browse Movies
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {favorites.map((movie) => (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} in your favorites
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
};

export default FavoritesPage;