import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  Button,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  Grid
} from '@mui/material';
import {
  ArrowBack,
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  CalendarToday,
  Visibility,
  Send
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { blogApi } from '../api/blogApi';
import { getImageUrl } from '../api/tmdbApi';

const BlogDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    loadBlog();
  }, [slug]);

  const loadBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogApi.getBlog(slug);

      if (response.success) {
        setBlog(response.data);
        setLiked(response.data.likes.includes(user?.id));
        setLikeCount(response.data.likes.length);
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  }, [slug, user?.id]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  const handleLike = async () => {
    try {
      const response = await blogApi.toggleLike(blog._id);

      if (response.success) {
        setLiked(response.data.isLiked);
        setLikeCount(response.data.likes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      setCommenting(true);
      const response = await blogApi.addComment(blog._id, comment);

      if (response.success) {
        setBlog(response.data);
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading blog post...
        </Typography>
      </Container>
    );
  }

  if (error || !blog) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Blog post not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/blog')}
          variant="contained"
        >
          Back to Blog
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/blog')}
        sx={{ mb: 3 }}
      >
        Back to Blog
      </Button>

      {/* Main Blog Post */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        {/* Featured Image */}
        {blog.featuredImage && (
          <Box
            component="img"
            src={blog.featuredImage}
            alt={blog.title}
            sx={{
              width: '100%',
              height: 300,
              objectFit: 'cover'
            }}
          />
        )}

        <Box sx={{ p: 4 }}>
          {/* Category and Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip
              label={blog.category}
              color="primary"
              sx={{ textTransform: 'capitalize' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption">
                {formatDistanceToNow(new Date(blog.publishedAt || blog.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 3 }}
          >
            {blog.title}
          </Typography>

          {/* Author Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={blog.author.avatar}
              alt={blog.author.name}
              sx={{ mr: 2 }}
            >
              {blog.author.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {blog.author.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{blog.author.username}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Button
              startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
              onClick={handleLike}
              color={liked ? "primary" : "inherit"}
              variant={liked ? "contained" : "outlined"}
            >
              {likeCount} Likes
            </Button>

            <Button
              startIcon={<Comment />}
              variant="outlined"
              onClick={() => document.getElementById('comments').scrollIntoView()}
            >
              {blog.comments.length} Comments
            </Button>

            <Button
              startIcon={<Share />}
              onClick={handleShare}
              variant="outlined"
            >
              Share
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {blog.views} views
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Blog Content */}
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.7,
              fontSize: '1.1rem',
              '& p': { mb: 2 },
              whiteSpace: 'pre-line'
            }}
          >
            {blog.content}
          </Typography>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {blog.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/blog?tag=${tag}`)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Related Movies */}
          {blog.relatedMovies && blog.relatedMovies.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Related Movies
              </Typography>
              <Grid container spacing={2}>
                {blog.relatedMovies.map(movie => (
                  <Grid item xs={6} sm={4} md={3} key={movie.movieId}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                      onClick={() => navigate(`/movie/${movie.movieId}`)}
                    >
                      <CardMedia
                        component="img"
                        height="150"
                        image={getImageUrl(movie.moviePoster, 'w185')}
                        alt={movie.movieTitle}
                      />
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                          {movie.movieTitle}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Comments Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }} id="comments">
        <Typography variant="h6" gutterBottom>
          Comments ({blog.comments.length})
        </Typography>

        {/* Add Comment Form */}
        {user && (
          <Box component="form" onSubmit={handleComment} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={!comment.trim() || commenting}
            >
              {commenting ? <CircularProgress size={20} /> : 'Post Comment'}
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Comments List */}
        {blog.comments.length === 0 ? (
          <Typography color="text.secondary" textAlign="center">
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {blog.comments.map((comment, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  sx={{ width: 32, height: 32 }}
                >
                  {comment.user.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default BlogDetailsPage;