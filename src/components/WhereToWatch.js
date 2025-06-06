import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  Card,
  CardContent,
  Collapse,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  ExpandMore,
  ExpandLess,
  Subscriptions,
  Movie,
  ShoppingCart,
  FreeBreakfast,
  Info,
  Launch
} from '@mui/icons-material';
import { streamingApi, formatStreamingData, getStreamingTypeInfo } from '../api/streamingApi';

const WhereToWatch = ({ movie, compact = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [streamingData, setStreamingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(!compact);

  // Tab configuration
  const tabs = [
    { label: 'Subscription', icon: <Subscriptions />, key: 'subscription' },
    { label: 'Rent', icon: <Movie />, key: 'rent' },
    { label: 'Buy', icon: <ShoppingCart />, key: 'buy' },
    { label: 'Free', icon: <FreeBreakfast />, key: 'free' }
  ];

  useEffect(() => {
    if (movie) {
      fetchStreamingData();
    }
  }, [movie]);

  const fetchStreamingData = async () => {
    if (!movie) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await streamingApi.getMovieStreaming(
        movie.id,
        movie.imdb_id,
        movie.title
      );
      
      const formattedData = formatStreamingData(result);
      setStreamingData(formattedData);
      
      // Set default tab to first available category
      const availableCategories = tabs.filter(tab => 
        formattedData[tab.key] && formattedData[tab.key].length > 0
      );
      if (availableCategories.length > 0) {
        const defaultIndex = tabs.findIndex(tab => tab.key === availableCategories[0].key);
        setActiveTab(defaultIndex);
      }
    } catch (err) {
      console.error('Failed to fetch streaming data:', err);
      setError('Failed to load streaming information');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProviderClick = (provider) => {
    // Track click analytics here if needed
    window.open(provider.url, '_blank', 'noopener,noreferrer');
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const renderProvider = (provider, category) => {
    const typeInfo = getStreamingTypeInfo(category);
    
    return (
      <Card
        key={`${provider.service}-${category}`}
        sx={{
          mb: 1,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: `2px solid transparent`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
            borderColor: provider.color || theme.palette.primary.main
          }
        }}
        onClick={() => handleProviderClick(provider)}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              src={provider.logo}
              alt={provider.service}
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                bgcolor: provider.color || theme.palette.primary.main
              }}
            >
              {provider.service.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {provider.service}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={typeInfo.label}
                  size="small"
                  sx={{
                    bgcolor: alpha(typeInfo.color, 0.1),
                    color: typeInfo.color,
                    fontWeight: 'bold'
                  }}
                />
                {provider.price && (
                  <Typography variant="body2" color="text.secondary">
                    {provider.price}
                  </Typography>
                )}
                {provider.quality && (
                  <Chip
                    label={provider.quality}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            
            <IconButton color="primary">
              <Launch />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderTabContent = () => {
    if (!streamingData) return null;
    
    const currentTab = tabs[activeTab];
    const providers = streamingData[currentTab.key] || [];
    
    if (providers.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Not available on {currentTab.label.toLowerCase()} services
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {providers.map(provider => renderProvider(provider, currentTab.key))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Finding where to watch...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button size="small" onClick={fetchStreamingData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!streamingData || streamingData.isEmpty) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          <Typography variant="body1" gutterBottom>
            No streaming information available
          </Typography>
          <Typography variant="body2">
            This movie might not be currently available on major streaming platforms.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  const availableTabs = tabs.filter(tab => 
    streamingData[tab.key] && streamingData[tab.key].length > 0
  );

  // Compact view for movie cards
  if (compact) {
    const firstAvailableService = availableTabs[0];
    if (!firstAvailableService) return null;
    
    const providers = streamingData[firstAvailableService.key];
    const topProvider = providers[0];
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          src={topProvider.logo}
          alt={topProvider.service}
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="caption" color="text.secondary">
          {providers.length > 1 ? `+${providers.length - 1} more` : firstAvailableService.label}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(90deg, #1a237e 0%, #3f51b5 100%)'
          : 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PlayArrow sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Where to Watch
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh streaming data">
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={fetchStreamingData}
              disabled={loading}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          {compact && (
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={toggleExpanded}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 0 }}>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none'
              }
            }}
          >
            {tabs.map((tab, index) => {
              const count = streamingData[tab.key]?.length || 0;
              return (
                <Tab
                  key={tab.key}
                  icon={tab.icon}
                  label={
                    <Box>
                      <Typography variant="body2">{tab.label}</Typography>
                      {count > 0 && (
                        <Chip 
                          label={count} 
                          size="small" 
                          color="primary"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                    </Box>
                  }
                  disabled={count === 0}
                  iconPosition="start"
                />
              );
            })}
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 2, minHeight: 200 }}>
            {renderTabContent()}
          </Box>

          {/* Footer */}
          {streamingData.lastUpdated && (
            <Box sx={{
              p: 1,
              bgcolor: 'action.hover',
              borderTop: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                <Info sx={{ fontSize: 14, mr: 0.5 }} />
                Last updated: {new Date(streamingData.lastUpdated).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default WhereToWatch;