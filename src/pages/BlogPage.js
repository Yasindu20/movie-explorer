import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputBase,
  alpha,
  useTheme
} from '@mui/material';
import {
  Article,
  Add,
  Search,
  TrendingUp,
  Category,
  Tag
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blogApi } from '../api/blogApi';
import BlogCard from '../components/blog/BlogCard';
import CreateBlogDialog from '../components/blog/CreateBlogDialog';

const BlogPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    search: ''
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [trendingTags, setTrendingTags] = useState([]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'review', label: 'Reviews' },
    { value: 'news', label: 'News' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'list', label: 'Lists' },
    { value: 'opinion', label: 'Opinion' },
    { value: 'interview', label: 'Interviews' }
  ];

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 12,
        ...(filters.category && { category: filters.category }),
        ...(filters.tag && { tag: filters.tag })
      };

      const response = await blogApi.getBlogs(params);

      if (response.success) {
        if (page === 1) {
          setBlogs(response.data);
        } else {
          setBlogs(prev => [...prev, ...response.data]);
        }
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.tag, page]);

  // Remove the first useEffect and keep only this one
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(() => {
    // Load trending tags
    loadTrendingTags();
  }, []);

  const loadTrendingTags = async () => {
    // Mock trending tags - in real app, this would be an API call
    setTrendingTags([
      'marvel', 'dc', 'horror', 'scifi', 'oscars2024',
      'netflix', 'reviews', 'thriller', 'comedy', 'drama'
    ]);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1);
  };

  const handleTagClick = (tag) => {
    handleFilterChange('tag', tag === filters.tag ? '' : tag);
  };

  const handleCreateBlog = () => {
    if (isAuthenticated) {
      setCreateDialogOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleBlogCreated = (newBlog) => {
    navigate(`/blog/${newBlog.slug}`);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Article sx={{ mr: 2, fontSize: 'inherit' }} />
          Movie Blog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Read reviews, analyses, and opinions from our community of movie enthusiasts
        </Typography>
      </Box>

      {/* Action Bar */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center'
        }}
      >
        {/* Search */}
        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: { xs: '100%', sm: 300 },
            boxShadow: 0,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search blog posts..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }}>
            <Search />
          </IconButton>
        </Paper>

        {/* Category Filter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            label="Category"
            startAdornment={<Category sx={{ mr: 0.5, fontSize: 20 }} />}
          >
            {categories.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        {/* Create Blog Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateBlog}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Write a Post
        </Button>
      </Paper>

      {/* Trending Tags */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <TrendingUp sx={{ mr: 1 }} />
          Trending Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {trendingTags.map(tag => (
            <Chip
              key={tag}
              label={`#${tag}`}
              clickable
              color={filters.tag === tag ? 'primary' : 'default'}
              onClick={() => handleTagClick(tag)}
              icon={<Tag />}
            />
          ))}
        </Box>
      </Paper>

      {/* Active Filters */}
      {(filters.category || filters.tag) && (
        <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Active filters:
          </Typography>
          {filters.category && (
            <Chip
              label={categories.find(c => c.value === filters.category)?.label}
              onDelete={() => handleFilterChange('category', '')}
              size="small"
            />
          )}
          {filters.tag && (
            <Chip
              label={`#${filters.tag}`}
              onDelete={() => handleFilterChange('tag', '')}
              size="small"
            />
          )}
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Blog Grid */}
      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : blogs.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }}
        >
          <Article sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No blog posts found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {filters.category || filters.tag
              ? 'Try adjusting your filters or search terms'
              : 'Be the first to share your thoughts about movies!'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateBlog}
            sx={{ mt: 2 }}
          >
            Write the First Post
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {blogs.map(blog => (
              <Grid item key={blog._id} xs={12} sm={6} md={4}>
                <BlogCard blog={blog} />
              </Grid>
            ))}
          </Grid>

          {/* Load More */}
          {page < totalPages && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                size="large"
                sx={{ borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Load More Posts'}
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Create Blog Dialog */}
      <CreateBlogDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleBlogCreated}
      />
    </Container>
  );
};

export default BlogPage;