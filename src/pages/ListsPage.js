import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  InputBase,
  alpha,
  Card,
  CardMedia,
  CardContent,
  useTheme
} from '@mui/material';
import {
  List as ListIcon,
  Add,
  Search,
  ViewList,
  ViewModule,
  Favorite,
  Movie,
  Group,
  Public,
  Lock,
  TrendingUp,
  Category
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listApi } from '../api/listApi';
import CreateListDialog from '../components/lists/CreateListDialog';
import ListCard from '../components/lists/ListCard';

const ListsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme(); // Add this line
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filters = [
    { value: 'all', label: 'All Lists', icon: <ViewList /> },
    { value: 'trending', label: 'Trending', icon: <TrendingUp /> },
    { value: 'favorites', label: 'Favorites', icon: <Favorite /> },
    { value: 'watchlist', label: 'Watchlists', icon: <Movie /> },
    { value: 'themed', label: 'Themed', icon: <Category /> },
    { value: 'collaborative', label: 'Collaborative', icon: <Group /> }
  ];

  useEffect(() => {
    loadLists();
  }, [filter, page]);

  const loadLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 12
      };

      // Apply filters
      if (filter === 'trending') {
        params.sort = '-followers';
      } else if (filter !== 'all') {
        if (filter === 'collaborative') {
          params.isCollaborative = true;
        } else {
          params.category = filter;
        }
      }

      const response = await listApi.getLists(params);

      if (response.success) {
        if (page === 1) {
          setLists(response.data);
        } else {
          setLists(prev => [...prev, ...response.data]);
        }
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      setError('Failed to load movie lists');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1);
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleCreateList = () => {
    if (isAuthenticated) {
      setCreateDialogOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleListCreated = (newList) => {
    navigate(`/list/${newList._id}`);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleListClick = (listId) => {
    navigate(`/list/${listId}`);
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
          <ListIcon sx={{ mr: 2, fontSize: 'inherit' }} />
          Movie Lists
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover curated movie collections created by our community
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
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }}>
            <Search />
          </IconButton>
        </Paper>

        <Box sx={{ flexGrow: 1 }} />

        {/* View Toggle */}
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="grid">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Create List Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateList}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Create List
        </Button>
      </Paper>

      {/* Filter Tabs */}
      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          sx={{
            flexWrap: 'wrap',
            '& .MuiToggleButton-root': {
              borderRadius: 2,
              m: 0.5,
              px: 2
            }
          }}
        >
          {filters.map(f => (
            <ToggleButton key={f.value} value={f.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {f.icon}
                {f.label}
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Lists Grid/List View */}
      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : lists.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.05) // FIXED: Use theme directly
          }}
        >
          <ListIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No lists found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Be the first to create a movie list!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateList}
            sx={{ mt: 2 }}
          >
            Create Your First List
          </Button>
        </Paper>
      ) : (
        <>
          {view === 'grid' ? (
            <Grid container spacing={3}>
              {lists.map(list => (
                <Grid item key={list._id} xs={12} sm={6} md={4}>
                  <ListCard
                    list={list}
                    onClick={() => handleListClick(list._id)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {lists.map(list => (
                <Card
                  key={list._id}
                  sx={{
                    display: 'flex',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleListClick(list._id)}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      width: 120,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {list.movies.slice(0, 3).map((movie, index) => (
                      <CardMedia
                        key={movie.movieId}
                        component="img"
                        sx={{
                          width: 40,
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          left: index * 30
                        }}
                        image={`https://image.tmdb.org/t/p/w92${movie.moviePoster}`}
                        alt={movie.movieTitle}
                      />
                    ))}
                  </Box>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          {list.name}
                          {list.isPublic ? (
                            <Public sx={{ ml: 1, fontSize: 18, verticalAlign: 'middle' }} />
                          ) : (
                            <Lock sx={{ ml: 1, fontSize: 18, verticalAlign: 'middle' }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {list.creator.name} • {list.movieCount} movies
                        </Typography>
                        {list.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {list.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{list.followerCount}</Typography>
                          <Typography variant="caption">Followers</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{list.views}</Typography>
                          <Typography variant="caption">Views</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

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
                {loading ? <CircularProgress size={24} /> : 'Load More Lists'}
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Create List Dialog */}
      <CreateListDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleListCreated}
      />
    </Container>
  );
};

export default ListsPage;