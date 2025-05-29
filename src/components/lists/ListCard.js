import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Favorite,
  Movie,
  Public,
  Lock,
  Group,
  RemoveRedEye
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ListCard = ({ list, onClick }) => {
  const { user } = useAuth();
  const isOwner = user && list.creator._id === user.id;

  const getCategoryIcon = (category) => {
    const icons = {
      watchlist: <Movie />,
      favorites: <Favorite />,
      themed: <RemoveRedEye />,
      ranking: '🏆',
      custom: <Group />
    };
    return icons[category] || null;
  };

  // Create a collage of movie posters
  const createPosterCollage = () => {
    const posters = list.movies.slice(0, 4).map(m => m.moviePoster);
    
    if (posters.length === 0) {
      return (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover'
          }}
        >
          <Movie sx={{ fontSize: 60, color: 'text.secondary' }} />
        </Box>
      );
    }

    if (posters.length === 1) {
      return (
        <CardMedia
          component="img"
          height="200"
          image={`https://image.tmdb.org/t/p/w342${posters[0]}`}
          alt={list.name}
        />
      );
    }

    return (
      <Box
        sx={{
          height: 200,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 0.5,
          overflow: 'hidden'
        }}
      >
        {[...Array(4)].map((_, index) => (
          <Box
            key={index}
            sx={{
              backgroundImage: posters[index]
                ? `url(https://image.tmdb.org/t/p/w185${posters[index]})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              bgcolor: 'action.hover'
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme => `0 12px 24px ${alpha(theme.palette.common.black, 0.15)}`
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        {createPosterCollage()}

        <CardContent>
          {/* Title and Privacy */}
          <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 'bold',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {list.name}
            </Typography>
            <Tooltip title={list.isPublic ? 'Public' : 'Private'}>
              {list.isPublic ? (
                <Public sx={{ fontSize: 20, color: 'text.secondary' }} />
              ) : (
                <Lock sx={{ fontSize: 20, color: 'text.secondary' }} />
              )}
            </Tooltip>
          </Box>

          {/* Creator */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={list.creator.avatar}
              alt={list.creator.name}
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              {list.creator.name.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              by <strong>{list.creator.name}</strong>
              {isOwner && ' (You)'}
            </Typography>
          </Box>

          {/* Description */}
          {list.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 2
              }}
            >
              {list.description}
            </Typography>
          )}

          {/* Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                icon={getCategoryIcon(list.category)}
                label={list.category}
                size="small"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                {list.movieCount} movies
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RemoveRedEye sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                {list.views}
              </Typography>
            </Box>
          </Box>

          {/* Collaborative indicator */}
          {list.isCollaborative && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption" color="primary">
                Collaborative List
              </Typography>
              {list.collaborators && list.collaborators.length > 0 && (
                <AvatarGroup max={3} sx={{ ml: 'auto' }}>
                  {list.collaborators.map(collab => (
                    <Avatar
                      key={collab.user._id}
                      alt={collab.user.name}
                      src={collab.user.avatar}
                      sx={{ width: 24, height: 24 }}
                    >
                      {collab.user.name.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              )}
            </Box>
          )}

          {/* Tags */}
          {list.tags && list.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 2, flexWrap: 'wrap' }}>
              {list.tags.slice(0, 3).map(tag => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                />
              ))}
              {list.tags.length > 3 && (
                <Chip
                  label={`+${list.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}

          {/* Followers */}
          {list.followerCount > 0 && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <AvatarGroup max={4} sx={{ flexGrow: 1 }}>
                {[...Array(Math.min(list.followerCount, 4))].map((_, i) => (
                  <Avatar key={i} sx={{ width: 24, height: 24 }}>
                    {i + 1}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary">
                {list.followerCount} follower{list.followerCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ListCard;