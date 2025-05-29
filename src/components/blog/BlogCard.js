import React from 'react';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  alpha
} from '@mui/material';
import {
  ThumbUp,
  Comment,
  Visibility,
  CalendarToday,
  Category
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${blog.slug}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      review: 'primary',
      news: 'error',
      analysis: 'secondary',
      list: 'info',
      opinion: 'warning',
      interview: 'success'
    };
    return colors[category] || 'default';
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
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1 }}>
        {blog.featuredImage && (
          <CardMedia
            component="img"
            height="200"
            image={blog.featuredImage}
            alt={blog.title}
            sx={{
              objectFit: 'cover'
            }}
          />
        )}

        <CardContent>
          {/* Category & Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              label={blog.category}
              size="small"
              color={getCategoryColor(blog.category)}
              icon={<Category />}
            />
            <Typography variant="caption" color="text.secondary">
              <CalendarToday sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {formatDistanceToNow(new Date(blog.publishedAt || blog.createdAt), { addSuffix: true })}
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            gutterBottom
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 1,
              minHeight: '3.6em'
            }}
          >
            {blog.title}
          </Typography>

          {/* Excerpt */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 2,
              minHeight: '4.5em'
            }}
          >
            {blog.excerpt}
          </Typography>

          {/* Author */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={blog.author.avatar}
              alt={blog.author.name}
              sx={{ width: 32, height: 32, mr: 1 }}
            >
              {blog.author.name.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              by <strong>{blog.author.name}</strong>
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThumbUp sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="caption">
                  {blog.likeCount || blog.likes?.length || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Comment sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="caption">
                  {blog.commentCount || blog.comments?.length || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Visibility sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="caption">
                  {blog.views}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 2, flexWrap: 'wrap' }}>
              {blog.tags.slice(0, 3).map(tag => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                />
              ))}
              {blog.tags.length > 3 && (
                <Chip
                  label={`+${blog.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BlogCard;