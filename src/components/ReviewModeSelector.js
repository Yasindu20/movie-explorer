import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Grid,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close,
  SmartToy,
  Speed,
  Assignment
} from '@mui/icons-material';
import SmartReviewComposer from './SmartReviewComposer';
import AIReviewBot from './AIReviewBot';

const ReviewModeSelector = ({ open, onClose, movie }) => {
  const theme = useTheme();
  // Removed unused selectedMode state
  const [composerOpen, setComposerOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);

  const reviewModes = [
    {
      id: 'structured',
      title: 'Structured Review',
      subtitle: 'Professional writing assistant',
      description: 'Perfect for detailed, comprehensive reviews with AI assistance',
      icon: <Assignment sx={{ fontSize: '3rem' }} />,
      features: [
        'Step-by-step guidance',
        'Template selection',
        'Aspect-based ratings',
        'AI text improvement',
        'Professional results'
      ],
      time: '5-10 minutes',
      difficulty: 'Easy',
      bestFor: 'First-time reviewers, detailed analysis',
      color: 'primary'
    },
    {
      id: 'conversational',
      title: 'Chat with AI Bot',
      subtitle: 'Natural conversation experience',
      description: 'Talk naturally about the movie and let AI create your review',
      icon: <SmartToy sx={{ fontSize: '3rem' }} />,
      features: [
        'Natural conversation',
        'Adaptive questions',
        'Personalized experience',
        'Fun and engaging',
        'Context-aware responses'
      ],
      time: '3-7 minutes',
      difficulty: 'Super Easy',
      bestFor: 'Casual reviewers, quick thoughts',
      color: 'secondary'
    }
  ];

  const handleModeSelect = (mode) => {
    if (mode === 'structured') {
      setComposerOpen(true);
    } else if (mode === 'conversational') {
      setBotOpen(true);
    }
    onClose();
  };

  const handleReviewCreated = (review) => {
    console.log('Review created:', review);
    setComposerOpen(false);
    setBotOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)'
            : 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3,
          position: 'relative'
        }}>
          <IconButton
            onClick={onClose}
            sx={{ 
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(255,255,255,0.8)'
            }}
          >
            <Close />
          </IconButton>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            How would you like to write your review?
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Choose the experience that fits your style
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {reviewModes.map((mode) => (
              <Grid item xs={12} md={6} key={mode.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      borderColor: `${mode.color}.main`
                    }
                  }}
                  onClick={() => handleModeSelect(mode.id)}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon and Header */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Box 
                        sx={{ 
                          color: `${mode.color}.main`,
                          mb: 2
                        }}
                      >
                        {mode.icon}
                      </Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {mode.title}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {mode.subtitle}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
                      {mode.description}
                    </Typography>

                    {/* Quick Stats */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                          icon={<Speed />}
                          label={mode.time}
                          size="small"
                          color={mode.color}
                          variant="outlined"
                        />
                        <Chip 
                          label={mode.difficulty}
                          size="small"
                          color={mode.color}
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Best for: {mode.bestFor}
                      </Typography>
                    </Box>

                    {/* Features */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Features:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {mode.features.map((feature, index) => (
                          <Typography 
                            key={index}
                            variant="body2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              '&::before': {
                                content: '"✓"',
                                color: `${mode.color}.main`,
                                fontWeight: 'bold',
                                mr: 1
                              }
                            }}
                          >
                            {feature}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* CTA Button */}
                    <Button
                      variant="contained"
                      color={mode.color}
                      fullWidth
                      size="large"
                      onClick={() => handleModeSelect(mode.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      {mode.id === 'structured' ? 'Start Writing' : 'Start Chatting'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Additional Info */}
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: alpha(theme.palette.info.main, 0.1),
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h6" gutterBottom>
              🎬 About "{movie?.title}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Either way you choose, you'll create a great review! Both modes use AI to help you 
              express your thoughts clearly and engagingly.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Render the selected mode components */}
      <SmartReviewComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        movie={movie}
        onReviewCreated={handleReviewCreated}
      />

      <AIReviewBot
        open={botOpen}
        onClose={() => setBotOpen(false)}
        movie={movie}
        onReviewGenerated={handleReviewCreated}
      />
    </>
  );
};

export default ReviewModeSelector;