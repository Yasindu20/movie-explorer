import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Button,
  Collapse,
  Divider,
  TextField,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  CommentOutlined,
  ExpandMore,
  ExpandLess,
  Warning,
  AutoAwesome,
  Verified
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ReviewCard = ({ review, onLike, onComment }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(review.likes?.includes(user?.id));
  const [likeCount, setLikeCount] = useState(review.likeCount || 0);

  const handleLike = async () => {
    if (!user) return;
    
    try {
      const response = await axios.put(`/api/user-reviews/${review._id}/like`);
      setLiked(response.data.data.isLiked);
      setLikeCount(response.data.data.likes);
      onLike?.(review._id, response.data.data);
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);
    try {
      const response = await axios.post(`/api/user-reviews/${review._id}/comments`, {
        content: newComment.trim()
      });
      
      setNewComment('');
      onComment?.(review._id, response.data.data);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const shouldTruncate = review.content.length > 300;

  return (
    <Card 
      elevation={2}
      sx={{ 
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      {review.spoilerWarning && (
        <Alert 
          severity="warning" 
          sx={{ 
            borderRadius: 0,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              ⚠️ This review contains spoilers
            </Typography>
            <Warning />
          </Box>
        </Alert>
      )}

      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar 
            src={review.author.avatar} 
            sx={{ mr: 2, bgcolor: 'primary.main' }}
          >
            {review.author.name?.charAt(0) || review.author.username?.charAt(0)}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {review.author.name || review.author.username}
              </Typography>
              {review.author.verified && (
                <Verified color="primary" sx={{ ml: 0.5, fontSize: '1rem' }} />
              )}
              {review.aiAssisted && (
                <Chip 
                  icon={<AutoAwesome />}
                  label="AI Assisted"
                  size="small"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating 
                value={review.ratings.overall} 
                readOnly 
                precision={0.5} 
                max={10}
                size="small" 
              />
              <Typography variant="body2" color="text.secondary">
                {review.ratings.overall}/10
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Review Title */}
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {review.title}
        </Typography>

        {/* Review Content */}
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2, 
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap' 
          }}
        >
          {expanded || !shouldTruncate ? review.content : truncateContent(review.content)}
        </Typography>

        {shouldTruncate && (
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ mb: 2 }}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </Button>
        )}

        {/* Aspect Ratings */}
        {Object.entries(review.ratings).some(([key, value]) => key !== 'overall' && value > 0) && (
          <Collapse in={expanded}>
            <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Detailed Ratings
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
                {Object.entries(review.ratings).filter(([key, value]) => key !== 'overall' && value > 0).map(([aspect, rating]) => (
                  <Box key={aspect} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize', display: 'block' }}>
                      {aspect}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {rating}/10
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>
        )}

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {review.tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={handleLike}
              disabled={!user}
              sx={{ 
                color: liked ? 'primary.main' : 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {liked ? <ThumbUp /> : <ThumbUpOutlined />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {likeCount}
            </Typography>

            <IconButton 
              onClick={() => setShowComments(!showComments)}
              sx={{ ml: 1 }}
            >
              {showComments ? <Comment /> : <CommentOutlined />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {review.commentCount || 0}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            {review.views || 0} views
          </Typography>
        </Box>

        {/* Comments Section */}
        <Collapse in={showComments}>
          <Divider sx={{ my: 2 }} />
          
          {/* Add Comment */}
          {user && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </Box>
          )}

          {/* Comments List */}
          {review.comments && review.comments.length > 0 ? (
            <Box>
              {review.comments.map((comment, index) => (
                <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar 
                    src={comment.user.avatar} 
                    sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}
                  >
                    {comment.user.name?.charAt(0) || comment.user.username?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" fontWeight="bold">
                      {comment.user.name || comment.user.username}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {comment.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;