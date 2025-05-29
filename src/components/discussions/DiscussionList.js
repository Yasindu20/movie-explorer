import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Visibility,
  PushPin,
  Lock,
  Warning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { discussionApi } from '../../api/discussionApi';

const DiscussionList = ({ discussions, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const handleDiscussionClick = (discussionId) => {
    navigate(`/discussion/${discussionId}`);
  };

  const handleLikeToggle = async (e, discussionId, isLiked) => {
    e.stopPropagation();
    
    try {
      const response = await discussionApi.toggleLike(discussionId);
      if (response.success && onUpdate) {
        // Update the discussion in the list
        const updatedDiscussion = discussions.find(d => d._id === discussionId);
        if (updatedDiscussion) {
          if (response.data.isLiked) {
            updatedDiscussion.likes.push(user.id);
          } else {
            updatedDiscussion.likes = updatedDiscussion.likes.filter(id => id !== user.id);
          }
          onUpdate(updatedDiscussion);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'primary',
      review: 'secondary',
      theory: 'info',
      spoiler: 'error',
      question: 'success'
    };
    return colors[category] || 'default';
  };

  return (
    <List sx={{ width: '100%' }}>
      {discussions.map((discussion, index) => {
        const isLiked = user && discussion.likes.includes(user.id);
        
        return (
          <React.Fragment key={discussion._id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: theme.palette.action.hover
                },
                py: 2
              }}
              onClick={() => handleDiscussionClick(discussion._id)}
            >
              <ListItemAvatar>
                <Avatar
                  src={discussion.author.avatar}
                  alt={discussion.author.name}
                >
                  {discussion.author.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {discussion.isPinned && (
                      <PushPin sx={{ fontSize: 18, color: 'primary.main' }} />
                    )}
                    {discussion.isLocked && (
                      <Lock sx={{ fontSize: 18, color: 'text.secondary' }} />
                    )}
                    <Typography variant="h6" component="span">
                      {discussion.title}
                    </Typography>
                    <Chip
                      label={discussion.category}
                      size="small"
                      color={getCategoryColor(discussion.category)}
                      icon={discussion.category === 'spoiler' ? <Warning /> : null}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        mb: 1
                      }}
                    >
                      {discussion.content}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        by {discussion.author.name} • {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleLikeToggle(e, discussion._id, isLiked)}
                            disabled={!user}
                          >
                            {isLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                          </IconButton>
                          <Typography variant="caption">
                            {discussion.likes.length}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Comment fontSize="small" />
                          <Typography variant="caption">
                            {discussion.commentCount || discussion.comments?.length || 0}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Visibility fontSize="small" />
                          <Typography variant="caption">
                            {discussion.views}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    {discussion.tags && discussion.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                        {discussion.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
            {index < discussions.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default DiscussionList;