import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Public,
  Lock,
  Group,
  Share,
  Star,
  Remove,
  PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { listApi } from '../api/listApi';
import { getImageUrl, searchMovies } from '../api/tmdbApi';
import { formatDistanceToNow } from 'date-fns';

const ListDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [addMovieDialogOpen, setAddMovieDialogOpen] = useState(false);
  const [movieSearch, setMovieSearch] = useState('');
  const [movieSearchResults, setMovieSearchResults] = useState([]);
  const [searchingMovies, setSearchingMovies] = useState(false);

  useEffect(() => {
    loadList();
  }, [id]);

  const loadList = async () => {
    try {
      setLoading(true);
      const response = await listApi.getList(id);
      
      if (response.success) {
        setList(response.data);
        setFollowing(response.data.followers.includes(user?.id));
      }
    } catch (error) {
      console.error('Error loading list:', error);
      setError('Failed to load list');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await listApi.toggleFollowList(id);
      
      if (response.success) {
        setFollowing(response.data.isFollowing);
        setList(prev => ({
          ...prev,
          followers: response.data.isFollowing
            ? [...prev.followers, user.id]
            : prev.followers.filter(f => f !== user.id)
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleMovieSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setMovieSearchResults([]);
      return;
    }

    try {
      setSearchingMovies(true);
      const results = await searchMovies(searchTerm);
      setMovieSearchResults(results.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setSearchingMovies(false);
    }
  };

  const handleAddMovie = async (movie) => {
    try {
      const movieData = {
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path,
        movieYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        movieRating: movie.vote_average
      };

      const response = await listApi.addMovieToList(id, movieData);
      
      if (response.success) {
        setList(response.data);
        setAddMovieDialogOpen(false);
        setMovieSearch('');
        setMovieSearchResults([]);
      }
    } catch (error) {
      console.error('Error adding movie to list:', error);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      const response = await listApi.removeMovieFromList(id, movieId);
      
      if (response.success) {
        setList(response.data);
      }
    } catch (error) {
      console.error('Error removing movie from list:', error);
    }
  };

  const isOwner = user && list && list.creator._id === user.id;
  const canEdit = isOwner || (list?.collaborators.some(c => c.user._id === user?.id && c.role === 'editor'));
  const canAddMovies = canEdit || list?.isCollaborative;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading list...
        </Typography>
      </Container>
    );
  }

  if (error || !list) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'List not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/lists')}
          variant="contained"
        >
          Back to Lists
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/lists')}
        sx={{ mb: 3 }}
      >
        Back to Lists
      </Button>

      {/* List Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {list.name}
              </Typography>
              {list.isPublic ? (
                <Public color="action" />
              ) : (
                <Lock color="action" />
              )}
              {list.isCollaborative && (
                <Group color="primary" />
              )}
            </Box>

            {list.description && (
              <Typography variant="body1" paragraph color="text.secondary">
                {list.description}
              </Typography>
            )}

            {/* Creator and Stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={list.creator.avatar}
                  alt={list.creator.name}
                  sx={{ width: 32, height: 32 }}
                >
                  {list.creator.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {list.creator.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created {formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {list.movies.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Movies
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {list.followers.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {list.views}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Views
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tags */}
            {list.tags && list.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {list.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            {user && !isOwner && (
              <Button
                variant={following ? "outlined" : "contained"}
                startIcon={following ? <PersonAdd /> : <PersonAdd />}
                onClick={handleFollow}
              >
                {following ? 'Unfollow' : 'Follow'}
              </Button>
            )}

            {canAddMovies && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddMovieDialogOpen(true)}
              >
                Add Movie
              </Button>
            )}

            <IconButton onClick={() => navigator.share ? navigator.share({
              title: list.name,
              text: list.description,
              url: window.location.href
            }) : navigator.clipboard.writeText(window.location.href)}>
              <Share />
            </IconButton>
          </Box>
        </Box>

        {/* Category */}
        <Chip
          label={list.category}
          color="primary"
          sx={{ textTransform: 'capitalize' }}
        />
      </Paper>

      {/* Movies Grid */}
      {list.movies.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            No movies in this list yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {canAddMovies ? 'Add some movies to get started!' : 'Check back later for updates.'}
          </Typography>
          {canAddMovies && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddMovieDialogOpen(true)}
            >
              Add First Movie
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {list.movies.map((movie) => (
            <Grid item key={movie.movieId} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              >
                <CardActionArea onClick={() => navigate(`/movie/${movie.movieId}`)}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={getImageUrl(movie.moviePoster)}
                    alt={movie.movieTitle}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap gutterBottom>
                      {movie.movieTitle}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {movie.movieRating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <Star sx={{ color: 'gold', fontSize: '1rem', mr: 0.5 }} />
                          <Typography variant="body2">
                            {movie.movieRating?.toFixed(1)}
                          </Typography>
                        </Box>
                      )}
                      {movie.movieYear && (
                        <Typography variant="body2" color="text.secondary">
                          {movie.movieYear}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Added {formatDistanceToNow(new Date(movie.addedAt), { addSuffix: true })}
                    </Typography>

                    {movie.note && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        "{movie.note}"
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>

                {canEdit && (
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveMovie(movie.movieId)}
                    >
                      <Remove />
                    </IconButton>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Movie Dialog */}
      <Dialog
        open={addMovieDialogOpen}
        onClose={() => setAddMovieDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Movie to List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search for movies"
            fullWidth
            variant="outlined"
            value={movieSearch}
            onChange={(e) => {
              setMovieSearch(e.target.value);
              handleMovieSearch(e.target.value);
            }}
            sx={{ mb: 2 }}
          />

          {searchingMovies && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          )}

          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {movieSearchResults.map((movie) => (
              <Card
                key={movie.id}
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleAddMovie(movie)}
              >
                <Box sx={{ display: 'flex', p: 1 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 60, height: 90, borderRadius: 1 }}
                    image={getImageUrl(movie.poster_path, 'w92')}
                    alt={movie.title}
                  />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {movie.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMovieDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListDetailsPage;