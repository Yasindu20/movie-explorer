import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  LinearProgress,
  Card,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Fade,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  TrendingUp,
  Star,
  Refresh,
  AutoAwesome,
  ThumbUp,
  ThumbDown,
  Visibility,
  Analytics
} from '@mui/icons-material';
import axios from 'axios';

const AIReviewSynthesis = ({ movieId, movieTitle }) => {
  const theme = useTheme();
  const [synthesis, setSynthesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSynthesis = useCallback(async (force = false) => {
    try {
      setLoading(!force);
      setRefreshing(force);
      setError(null);

      const response = await axios.get(
        `/api/reviews/synthesis/${movieId}${force ? '?force=true' : ''}`
      );

      setSynthesis(response.data.data);
    } catch (err) {
      console.error('Error fetching review synthesis:', err);
      setError('Unable to load review analysis. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (movieId) {
      fetchSynthesis();
    }
  }, [movieId, fetchSynthesis]);

  const handleRefresh = () => {
    fetchSynthesis(true);
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      very_positive: '#4caf50',
      positive: '#8bc34a',
      neutral: '#ff9800',
      negative: '#f44336',
      very_negative: '#d32f2f'
    };
    return colors[sentiment] || '#gray';
  };

  const getSentimentLabel = (sentiment) => {
    const labels = {
      very_positive: 'Very Positive',
      positive: 'Positive',
      neutral: 'Mixed',
      negative: 'Negative',
      very_negative: 'Very Negative'
    };
    return labels[sentiment] || 'Unknown';
  };

  const formatAspectScore = (aspect) => {
    if (aspect.mentions === 0) return 'Not mentioned';
    
    const ratio = aspect.positiveCount / (aspect.positiveCount + aspect.negativeCount);
    const percentage = Math.round(ratio * 100);
    
    return `${percentage}% positive (${aspect.mentions} mentions)`;
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Psychology color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            AI Review Analysis
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Analyzing thousands of reviews...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button size="small" onClick={() => fetchSynthesis()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!synthesis) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)'
            : 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
          color: 'white',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(30px, -30px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesome sx={{ mr: 2, fontSize: '2rem' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                AI Review Analysis
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Analysis of {synthesis.reviewCount} reviews from multiple sources
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title="Refresh analysis">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white' }
              }}
              variant="outlined"
              size="small"
            >
              {refreshing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Summary Section */}
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Summary
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.7,
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}
            >
              {synthesis.summary}
            </Typography>
          </Box>
        </Fade>

        {/* Overall Sentiment */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Overall Sentiment
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Card 
                  elevation={2}
                  sx={{ 
                    p: 2,
                    background: `linear-gradient(135deg, ${getSentimentColor(synthesis.sentiment.overall)} 0%, ${alpha(getSentimentColor(synthesis.sentiment.overall), 0.7)} 100%)`,
                    color: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {getSentimentLabel(synthesis.sentiment.overall)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, opacity: 0.9 }}>
                    Score: {synthesis.sentiment.score?.toFixed(3)}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box>
                  {Object.entries(synthesis.sentiment.breakdown).map(([sentiment, count]) => (
                    <Box key={sentiment} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2">
                          {getSentimentLabel(sentiment)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(count / synthesis.reviewCount) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(getSentimentColor(sentiment), 0.2),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getSentimentColor(sentiment),
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* Ratings Breakdown */}
        {synthesis.ratings.totalRatings > 0 && (
          <Fade in={true} timeout={1200}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Rating Distribution
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Star sx={{ color: 'gold', fontSize: '2rem', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {synthesis.ratings.average}/10
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <Box>
                    {Object.entries(synthesis.ratings.distribution).map(([range, count]) => (
                      <Box key={range} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2">
                            {range} stars
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count} ({Math.round((count / synthesis.ratings.totalRatings) * 100)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(count / synthesis.ratings.totalRatings) * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* Detailed Analysis Accordions */}
        <Fade in={true} timeout={1400}>
          <Box>
            {/* Aspect Analysis */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Analytics sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Detailed Aspect Analysis
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(synthesis.aspects).map(([aspectName, aspect]) => (
                    aspect.mentions > 0 && (
                      <Grid item xs={12} sm={6} md={4} key={aspectName}>
                        <Card elevation={1} sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ textTransform: 'capitalize' }}>
                            {aspectName}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ThumbUp sx={{ color: 'green', mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {aspect.positiveCount}
                            </Typography>
                            <ThumbDown sx={{ color: 'red', mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="body2">
                              {aspect.negativeCount}
                            </Typography>
                          </Box>
                          
                          <LinearProgress
                            variant="determinate"
                            value={aspect.mentions > 0 ? (aspect.positiveCount / aspect.mentions) * 100 : 0}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              mb: 1,
                              bgcolor: alpha(theme.palette.error.main, 0.2),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.success.main,
                                borderRadius: 4
                              }
                            }}
                          />
                          
                          <Typography variant="caption" color="text.secondary">
                            {formatAspectScore(aspect)}
                          </Typography>
                          
                          {aspect.keywords.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {aspect.keywords.slice(0, 3).map(keyword => (
                                <Chip
                                  key={keyword}
                                  label={keyword}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    )
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Key Themes */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Key Themes & Topics
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {synthesis.themes.map((theme, index) => (
                    <Chip
                      key={index}
                      label={`${theme.theme} (${theme.count})`}
                      variant="outlined"
                      sx={{
                        fontSize: `${1 + (theme.count / Math.max(...synthesis.themes.map(t => t.count))) * 0.5}rem`,
                        height: 'auto',
                        py: 0.5
                      }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Featured Reviews */}
            {synthesis.featuredReviews && synthesis.featuredReviews.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Featured Reviews
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {synthesis.featuredReviews.map((review, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card elevation={1} sx={{ p: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              label={review.source} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip
                              label={getSentimentLabel(review.sentiment)}
                              size="small"
                              sx={{
                                bgcolor: alpha(getSentimentColor(review.sentiment), 0.1),
                                color: getSentimentColor(review.sentiment)
                              }}
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                            "{review.content}"
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              — {review.author}
                            </Typography>
                            {review.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Star sx={{ color: 'gold', fontSize: '1rem', mr: 0.5 }} />
                                <Typography variant="caption">
                                  {review.rating}/10
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Fade>

        {/* Footer Info */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Sources: {Object.entries(synthesis.sources).map(([source, count]) => 
              `${source} (${count})`
            ).join(', ')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(synthesis.lastUpdated).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AIReviewSynthesis;