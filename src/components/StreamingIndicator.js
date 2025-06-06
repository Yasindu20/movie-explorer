import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
  Typography,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Launch,
  Subscriptions,
  Movie,
  ShoppingCart,
  FreeBreakfast
} from '@mui/icons-material';
import { streamingApi, formatStreamingData } from '../api/streamingApi';

const StreamingIndicator = ({ movie, variant = 'compact', showQuickAccess = false }) => {
  const [streamingData, setStreamingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchStreamingData = async () => {
      if (!movie) return;
      
      try {
        const result = await streamingApi.getMovieStreaming(
          movie.id,
          movie.imdb_id,
          movie.title
        );
        
        const formattedData = formatStreamingData(result);
        setStreamingData(formattedData);
      } catch (err) {
        console.error('Failed to fetch streaming data for indicator:', err);
        setStreamingData({ isEmpty: true });
      } finally {
        setLoading(false);
      }
    };

    if (movie) {
      fetchStreamingData();
    }
  }, [movie]);

  const handleQuickAccessClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleQuickAccessClose = () => {
    setAnchorEl(null);
  };

  const handleProviderClick = (provider) => {
    window.open(provider.url, '_blank', 'noopener,noreferrer');
    handleQuickAccessClose();
  };

  const getAllProviders = () => {
    if (!streamingData) return [];
    
    const allProviders = [
      ...(streamingData.subscription || []).map(p => ({ ...p, type: 'subscription' })),
      ...(streamingData.rent || []).map(p => ({ ...p, type: 'rent' })),
      ...(streamingData.buy || []).map(p => ({ ...p, type: 'buy' })),
      ...(streamingData.free || []).map(p => ({ ...p, type: 'free' }))
    ];
    
    return allProviders;
  };

  const getTypeIcon = (type) => {
    const icons = {
      subscription: <Subscriptions fontSize="small" />,
      rent: <Movie fontSize="small" />,
      buy: <ShoppingCart fontSize="small" />,
      free: <FreeBreakfast fontSize="small" />
    };
    return icons[type] || <PlayArrow fontSize="small" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      subscription: '#4CAF50',
      rent: '#FF9800', 
      buy: '#F44336',
      free: '#2196F3'
    };
    return colors[type] || '#757575';
  };

  if (loading) {
    if (variant === 'compact') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={40} />
        </Box>
      );
    }
    return <Skeleton variant="rectangular" width={120} height={24} />;
  }

  if (!streamingData || streamingData.isEmpty) {
    return variant === 'compact' ? null : (
      <Chip
        size="small"
        label="Not available"
        variant="outlined"
        sx={{ opacity: 0.6 }}
      />
    );
  }

  const allProviders = getAllProviders();
  const topProviders = allProviders.slice(0, 3);
  const hasMore = allProviders.length > 3;

  // Compact variant - show avatars only
  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AvatarGroup 
          max={3} 
          sx={{
            '& .MuiAvatar-root': {
              width: 20,
              height: 20,
              fontSize: '0.75rem',
              border: '1px solid rgba(255,255,255,0.3)'
            }
          }}
        >
          {topProviders.map((provider, index) => (
            <Tooltip key={index} title={`${provider.service} (${provider.type})`}>
              <Avatar
                src={provider.logo}
                alt={provider.service}
                sx={{ 
                  bgcolor: provider.color,
                  cursor: showQuickAccess ? 'pointer' : 'default'
                }}
                onClick={showQuickAccess ? () => handleProviderClick(provider) : undefined}
              >
                {provider.service.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
        
        {showQuickAccess && allProviders.length > 0 && (
          <IconButton
            size="small"
            onClick={handleQuickAccessClick}
            sx={{ ml: 0.5 }}
          >
            <Launch fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  // Detailed variant - show chips with counts
  if (variant === 'detailed') {
    const categories = [
      { key: 'subscription', label: 'Sub', icon: <Subscriptions /> },
      { key: 'free', label: 'Free', icon: <FreeBreakfast /> },
      { key: 'rent', label: 'Rent', icon: <Movie /> },
      { key: 'buy', label: 'Buy', icon: <ShoppingCart /> }
    ];

    const availableCategories = categories.filter(cat => 
      streamingData[cat.key] && streamingData[cat.key].length > 0
    );

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {availableCategories.map(category => (
          <Chip
            key={category.key}
            size="small"
            icon={category.icon}
            label={`${category.label} (${streamingData[category.key].length})`}
            variant="outlined"
            sx={{
              bgcolor: `${getTypeColor(category.key)}20`,
              borderColor: getTypeColor(category.key),
              color: getTypeColor(category.key)
            }}
          />
        ))}
      </Box>
    );
  }

  // Default variant - show service names
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {topProviders.map((provider, index) => (
          <Chip
            key={index}
            size="small"
            avatar={
              <Avatar 
                src={provider.logo} 
                sx={{ width: 16, height: 16 }}
              />
            }
            label={provider.service}
            variant="outlined"
            onClick={showQuickAccess ? () => handleProviderClick(provider) : undefined}
            sx={{ 
              cursor: showQuickAccess ? 'pointer' : 'default',
              '&:hover': showQuickAccess ? {
                bgcolor: 'action.hover'
              } : {}
            }}
          />
        ))}
        
        {hasMore && (
          <Chip
            size="small"
            label={`+${allProviders.length - 3} more`}
            variant="outlined"
            onClick={showQuickAccess ? handleQuickAccessClick : undefined}
            sx={{ cursor: showQuickAccess ? 'pointer' : 'default' }}
          />
        )}
      </Box>
      
      {showQuickAccess && (
        <IconButton size="small" onClick={handleQuickAccessClick}>
          <Launch fontSize="small" />
        </IconButton>
      )}
      
      {/* Quick Access Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleQuickAccessClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" fontWeight="bold">
            Watch on:
          </Typography>
        </MenuItem>
        <Divider />
        
        {allProviders.map((provider, index) => (
          <MenuItem
            key={index}
            onClick={() => handleProviderClick(provider)}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <Avatar
                src={provider.logo}
                sx={{ 
                  width: 24, 
                  height: 24,
                  bgcolor: provider.color
                }}
              >
                {provider.service.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">
                {provider.service}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTypeIcon(provider.type)}
                <Typography variant="caption" color="text.secondary">
                  {provider.type}
                  {provider.price && ` - ${provider.price}`}
                </Typography>
              </Box>
            </ListItemText>
            <Launch fontSize="small" color="action" />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default StreamingIndicator;