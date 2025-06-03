// src/components/SmartReviewComposer.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Rating,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  useTheme,
  alpha,
  Slide,
  Fade
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  Psychology,
  Lightbulb,
  Edit,
  Send,
  Star,
  ExpandMore,
  Add,
  CheckCircle,
  Movie,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SmartReviewComposer = ({ open, onClose, movie, onReviewCreated }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Choose Style', 'Write Review', 'Rate & Tag', 'Publish'];

  // Review data state
  const [reviewData, setReviewData] = useState({
    title: '',
    content: '',
    ratings: {
      overall: 0,
      plot: 0,
      acting: 0,
      direction: 0,
      visuals: 0,
      audio: 0
    },
    tags: [],
    spoilerWarning: false,
    recommendToFriends: true,
    watchedDate: new Date().toISOString().split('T')[0]
  });

  // AI assistance state
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [outline, setOutline] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [aiAssisted, setAiAssisted] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [improvingText, setImprovingText] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState(0);

  // Load AI templates on mount
  useEffect(() => {
    if (open) {
      loadTemplates();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setActiveStep(0);
    setReviewData({
      title: '',
      content: '',
      ratings: {
        overall: 0,
        plot: 0,
        acting: 0,
        direction: 0,
        visuals: 0,
        audio: 0
      },
      tags: [],
      spoilerWarning: false,
      recommendToFriends: true,
      watchedDate: new Date().toISOString().split('T')[0]
    });
    setSelectedTemplate('');
    setOutline(null);
    setSuggestions([]);
    setError('');
  };

  const loadTemplates = async () => {
    try {
      const response = await axios.get('/api/user-reviews/ai/templates');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Generate review outline based on template
  const generateOutline = async (templateType) => {
    try {
      const response = await axios.post('/api/user-reviews/ai/outline', {
        templateType,
        movieTitle: movie.title,
        userPreferences: { detailed: true }
      });
      setOutline(response.data.data);
      setAiAssisted(true);
    } catch (error) {
      console.error('Error generating outline:', error);
    }
  };

  // Get AI writing suggestions
  const getSuggestions = useCallback(async (userInput = '', aspectFocus = null) => {
    if (!movie) return;

    setLoadingSuggestions(true);
    try {
      const response = await axios.post('/api/user-reviews/ai/suggestions', {
        userInput,
        movieTitle: movie.title,
        aspectFocus
      });
      setSuggestions(response.data.data);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [movie]);

  // Improve text with AI
  const improveText = async (text, improvementType = 'clarity') => {
    setImprovingText(true);
    try {
      const response = await axios.post('/api/user-reviews/ai/improve', {
        text,
        improvementType
      });
      
      setReviewData(prev => ({
        ...prev,
        content: response.data.data.improved
      }));
      setAiAssisted(true);
    } catch (error) {
      console.error('Error improving text:', error);
    } finally {
      setImprovingText(false);
    }
  };

  // Generate tags
  const generateTags = async () => {
    try {
      const response = await axios.post('/api/user-reviews/ai/tags', {
        reviewContent: reviewData.content,
        movieId: movie.id
      });
      
      setReviewData(prev => ({
        ...prev,
        tags: [...prev.tags, ...response.data.data.filter(tag => !prev.tags.includes(tag))]
      }));
    } catch (error) {
      console.error('Error generating tags:', error);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (templateType) => {
    setSelectedTemplate(templateType);
    generateOutline(templateType);
    setActiveStep(1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const currentContent = reviewData.content;
    const newContent = currentContent + (currentContent ? '\n\n' : '') + suggestion.text;
    
    setReviewData(prev => ({
      ...prev,
      content: newContent
    }));
    
    setAiAssisted(true);
  };

  // Submit review
  const handleSubmit = async () => {
    if (!reviewData.title.trim() || !reviewData.content.trim() || reviewData.ratings.overall === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/user-reviews', {
        ...reviewData,
        movieId: movie.id,
        aiAssisted
      });

      onReviewCreated?.(response.data.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create review');
    } finally {
      setSubmitting(false);
    }
  };

  // Stepper navigation
  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Template Selection
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Your Review Style
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a template to get started, or skip to write freely
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(templates).map(([type, template]) => (
                <Grid item xs={12} sm={6} key={type}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: selectedTemplate === type ? 2 : 1,
                      borderColor: selectedTemplate === type ? 'primary.main' : 'divider',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleTemplateSelect(type)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Box>
                        {template.structure.map((section, index) => (
                          <Chip
                            key={index}
                            label={section}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(1)}
                sx={{ mr: 2 }}
              >
                Skip Template
              </Button>
            </Box>
          </Box>
        );

      case 1: // Writing
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Write Your Review
              </Typography>
              <Box>
                <Tooltip title="Get AI suggestions">
                  <IconButton
                    onClick={() => getSuggestions(reviewData.content)}
                    disabled={loadingSuggestions}
                  >
                    {loadingSuggestions ? <CircularProgress size={24} /> : <Psychology />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Improve text">
                  <IconButton
                    onClick={() => improveText(reviewData.content)}
                    disabled={!reviewData.content.trim() || improvingText}
                  >
                    {improvingText ? <CircularProgress size={24} /> : <AutoAwesome />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Review Title */}
            <TextField
              fullWidth
              label="Review Title"
              value={reviewData.title}
              onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`My thoughts on ${movie.title}...`}
              sx={{ mb: 2 }}
            />

            {/* Main Content */}
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Your Review"
              value={reviewData.content}
              onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={outline ? 
                outline.sections.map(s => `${s.title}: ${s.placeholder}`).join('\n\n') :
                `Share your thoughts about ${movie.title}...`
              }
              sx={{ mb: 2 }}
            />

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lightbulb sx={{ mr: 1, color: 'orange' }} />
                    <Typography>Writing Suggestions ({suggestions.length})</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {suggestions.map((suggestion, index) => (
                      <Card
                        key={index}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <CardContent sx={{ py: 1 }}>
                          <Typography variant="body2">
                            {suggestion.text}
                          </Typography>
                          <Chip
                            label={suggestion.category}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Quick Options */}
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reviewData.spoilerWarning}
                    onChange={(e) => setReviewData(prev => ({ 
                      ...prev, 
                      spoilerWarning: e.target.checked 
                    }))}
                  />
                }
                label="Contains Spoilers"
              />
            </Box>
          </Box>
        );

      case 2: // Ratings and Tags
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Rate & Tag Your Review
            </Typography>

            {/* Overall Rating */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Rating *
              </Typography>
              <Rating
                value={reviewData.ratings.overall}
                onChange={(_, value) => setReviewData(prev => ({
                  ...prev,
                  ratings: { ...prev.ratings, overall: value || 0 }
                }))}
                size="large"
                precision={0.5}
                max={10}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {reviewData.ratings.overall}/10
              </Typography>
            </Box>

            {/* Aspect Ratings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Detailed Ratings (Optional)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(reviewData.ratings).filter(([key]) => key !== 'overall').map(([aspect, rating]) => (
                    <Grid item xs={12} sm={6} key={aspect}>
                      <Box>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', mb: 1 }}>
                          {aspect}
                        </Typography>
                        <Rating
                          value={rating}
                          onChange={(_, value) => setReviewData(prev => ({
                            ...prev,
                            ratings: { ...prev.ratings, [aspect]: value || 0 }
                          }))}
                          precision={0.5}
                          max={10}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {rating}/10
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Tags */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Tags
                </Typography>
                <Button
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={generateTags}
                  disabled={!reviewData.content.trim()}
                >
                  Generate Tags
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {reviewData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => setReviewData(prev => ({
                      ...prev,
                      tags: prev.tags.filter((_, i) => i !== index)
                    }))}
                  />
                ))}
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Add custom tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    const newTag = e.target.value.trim().toLowerCase();
                    if (!reviewData.tags.includes(newTag)) {
                      setReviewData(prev => ({
                        ...prev,
                        tags: [...prev.tags, newTag]
                      }));
                    }
                    e.target.value = '';
                  }
                }}
              />
            </Box>

            {/* Additional Options */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="When did you watch this?"
                value={reviewData.watchedDate}
                onChange={(e) => setReviewData(prev => ({ 
                  ...prev, 
                  watchedDate: e.target.value 
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={reviewData.recommendToFriends}
                    onChange={(e) => setReviewData(prev => ({ 
                      ...prev, 
                      recommendToFriends: e.target.checked 
                    }))}
                  />
                }
                label="Would recommend to friends"
              />
            </Box>
          </Box>
        );

      case 3: // Review
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Review
            </Typography>

            <Card elevation={2} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {reviewData.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={reviewData.ratings.overall} readOnly precision={0.5} max={10} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {reviewData.ratings.overall}/10
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {reviewData.content}
                </Typography>

                {reviewData.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {reviewData.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                )}

                {reviewData.spoilerWarning && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    This review contains spoilers
                  </Alert>
                )}

                {aiAssisted && (
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    <AutoAwesome sx={{ mr: 0.5, fontSize: '1rem' }} />
                    <Typography variant="caption">
                      AI-assisted review
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={theme.breakpoints.down('sm')}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Movie sx={{ mr: 1 }} />
          <Box>
            <Typography variant="h6">
              Write Review: {movie?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Share your thoughts with the community
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} edge="end">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Stepper */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Fade in={true} key={activeStep}>
            <Box>
              {renderStepContent()}
            </Box>
          </Fade>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button 
          onClick={handleBack} 
          disabled={activeStep === 0}
        >
          Back
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 1 && (!reviewData.title.trim() || !reviewData.content.trim())}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !reviewData.title.trim() || !reviewData.content.trim() || reviewData.ratings.overall === 0}
            startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
          >
            {submitting ? 'Publishing...' : 'Publish Review'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SmartReviewComposer;