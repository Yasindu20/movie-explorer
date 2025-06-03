import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Fab,
  useTheme
} from '@mui/material';
import { Add, Sort } from '@mui/icons-material';
import ReviewCard from './ReviewCard';
import SmartReviewComposer from './SmartReviewComposer';
import axios from 'axios';

const MovieReviews = ({ movie }) => {
  const theme = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    if (movie?.id) {
      loadReviews();
    }
  }, [movie?.id, sortBy]);

  const loadReviews = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      
      const response = await axios.get(`/api/user-reviews/movie/${movie.id}`, {
        params: {
          page: pageNum,
          limit: 10,
          sort: sortBy
        }
      });

      const newReviews = response.data.data;
      
      if (pageNum === 1) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      setHasMore(response.data.currentPage < response.data.pages);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadReviews(page + 1);
  };

  const handleReviewCreated = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setComposerOpen(false);
  };

  const handleLike = (reviewId, likeData) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, likeCount: likeData.likes, isLiked: likeData.isLiked }
        : review
    ));
  };

  const handleComment = (reviewId, updatedReview) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId ? updatedReview : review
    ));
  };

  if (loading && reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading reviews...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h5" fontWeight="bold">
          User Reviews ({reviews.length})
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="-createdAt">Newest</MenuItem>
              <MenuItem value="createdAt">Oldest</MenuItem>
              <MenuItem value="-ratings.overall">Highest Rated</MenuItem>
              <MenuItem value="ratings.overall">Lowest Rated</MenuItem>
              <MenuItem value="-likeCount">Most Liked</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setComposerOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Write Review
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
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
            onClick={() => setComposerOpen(true)}
            sx={{ borderRadius: 3 }}
          >
            Write the First Review
          </Button>
        </Box>
      ) : (
        <Box>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}

          {hasMore && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Load More Reviews'}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="write review"
        onClick={() => setComposerOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
      >
        <Add />
      </Fab>

      {/* Review Composer */}
      <SmartReviewComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        movie={movie}
        onReviewCreated={handleReviewCreated}
      />
    </Box>
  );
};

export default MovieReviews;