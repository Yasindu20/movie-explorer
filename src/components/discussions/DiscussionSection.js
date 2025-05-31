import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tab,
  Tabs,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add,
  Forum,
  Sort,
  QuestionAnswer,
  RateReview,
  Psychology,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { discussionApi } from '../../api/discussionApi';
import DiscussionList from './DiscussionList';
import CreateDiscussionDialog from './CreateDiscussionDialog';

// Move categories outside component to prevent recreation on every render
const categories = [
  { value: 'all', label: 'All Discussions', icon: <Forum /> },
  { value: 'general', label: 'General', icon: <QuestionAnswer /> },
  { value: 'review', label: 'Reviews', icon: <RateReview /> },
  { value: 'theory', label: 'Theories', icon: <Psychology /> },
  { value: 'spoiler', label: 'Spoilers', icon: <Warning />, color: 'error' }
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-likes', label: 'Most Liked' },
  { value: '-views', label: 'Most Viewed' },
  { value: '-comments', label: 'Most Discussed' }
];

const DiscussionSection = ({ movieId, movieTitle, moviePoster }) => {
  const { isAuthenticated } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadDiscussions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const category = activeTab === 0 ? null : categories[activeTab].value;
      const response = await discussionApi.getMovieDiscussions(movieId, {
        category,
        sort: sortBy,
        page,
        limit: 10
      });

      if (response.success) {
        if (page === 1) {
          setDiscussions(response.data);
        } else {
          setDiscussions(prev => [...prev, ...response.data]);
        }
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error('Error loading discussions:', error);
      setError('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [movieId, activeTab, sortBy, page]); // Remove categories from dependencies since it's now stable

  // Keep only one useEffect that depends on loadDiscussions
  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
    handleSortClose();
  };

  const handleCreateDiscussion = async (discussionData) => {
    try {
      const response = await discussionApi.createDiscussion({
        ...discussionData,
        movieId,
        movieTitle,
        moviePoster
      });

      if (response.success) {
        setDiscussions(prev => [response.data, ...prev]);
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleDiscussionUpdate = (updatedDiscussion) => {
    setDiscussions(prev =>
      prev.map(d => d._id === updatedDiscussion._id ? updatedDiscussion : d)
    );
  };

  const handleDiscussionDelete = (discussionId) => {
    setDiscussions(prev => prev.filter(d => d._id !== discussionId));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          <Forum sx={{ mr: 1, verticalAlign: 'middle' }} />
          Discussions
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleSortClick} size="small">
            <Sort />
          </IconButton>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            {sortOptions.map(option => (
              <MenuItem
                key={option.value}
                selected={sortBy === option.value}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          {isAuthenticated && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              size="small"
            >
              Start Discussion
            </Button>
          )}
        </Box>
      </Box>

      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {categories.map((category, index) => (
            <Tab
              key={category.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category.icon}
                  {category.label}
                  {category.value === 'spoiler' && (
                    <Chip label="⚠️" size="small" color="error" />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : discussions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No discussions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Be the first to start a discussion about this movie!
          </Typography>
          {isAuthenticated && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Start Discussion
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <DiscussionList
            discussions={discussions}
            onUpdate={handleDiscussionUpdate}
            onDelete={handleDiscussionDelete}
          />

          {page < totalPages && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outlined"
              >
                {loading ? <CircularProgress size={24} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}

      <CreateDiscussionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateDiscussion}
        movieTitle={movieTitle}
      />
    </Box>
  );
};

export default DiscussionSection;