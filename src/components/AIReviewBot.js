import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Rating,
  Slide,
  Fade,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  SmartToy,
  Send,
  Close,
  AutoAwesome,
  CheckCircle,
  Psychology
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AIReviewBot = ({ open, onClose, movie, onReviewGenerated }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('intro');
  const [botPersonality, setBotPersonality] = useState('friendly'); // friendly, professional, casual
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Review data collection
  const [reviewData, setReviewData] = useState({
    title: '',
    content: '',
    overallRating: 0,
    aspectRatings: {},
    tags: [],
    spoilerWarning: false,
    watchedWhen: '',
    recommend: null,
    favoriteScene: '',
    leastFavorite: '',
    emotions: [],
    comparisons: []
  });

  // Initialize bot conversation
  const initializeBot = useCallback(() => {
    const getBotGreeting = () => {
      const greetings = {
        friendly: `Hey ${user?.name || 'there'}! 👋 I'm Rex, your movie review buddy! I'm here to help you create an awesome review for "${movie.title}". Ready to dive in?`,
        professional: `Hello ${user?.name || 'User'}. I'm your AI Review Assistant. I'll guide you through creating a comprehensive review for "${movie.title}". Shall we begin?`,
        casual: `Yo! 🎬 Ready to talk about "${movie.title}"? I'm your AI movie buddy and I'm pumped to help you write something epic!`
      };
      return greetings[botPersonality];
    };

    setMessages([]);
    setCurrentStep('intro');
    setShowSuccessMessage(false);
    setReviewData({
      title: '',
      content: '',
      overallRating: 0,
      aspectRatings: {},
      tags: [],
      spoilerWarning: false,
      watchedWhen: '',
      recommend: null,
      favoriteScene: '',
      leastFavorite: '',
      emotions: [],
      comparisons: []
    });

    // Start conversation
    setTimeout(() => {
      addBotMessage(getBotGreeting());
    }, 500);
  }, [movie, user?.name, botPersonality]);

  useEffect(() => {
    if (open && movie) {
      initializeBot();
    }
  }, [open, movie, initializeBot]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text, options = {}) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: text,
        timestamp: new Date(),
        ...options
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Realistic typing delay
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }]);
  };

  const handleUserResponse = async (input) => {
    if (!input.trim()) return;

    addUserMessage(input);
    setUserInput('');
    
    // Process user input and generate bot response
    await processUserInput(input);
  };

  const processUserInput = async (input) => {
    const response = await generateBotResponse(input, currentStep);
    
    // Update review data based on current step
    updateReviewData(input, currentStep);
    
    // Add bot response
    addBotMessage(response.message, response.options);
    
    // Move to next step if needed
    if (response.nextStep) {
      setCurrentStep(response.nextStep);
    }
  };

  const generateBotResponse = async (userInput, step) => {
    // This is where the magic happens - contextual AI responses
    const responses = await getContextualResponse(userInput, step);
    return responses;
  };

  const getContextualResponse = async (input, step) => {
    const inputLower = input.toLowerCase();
    
    switch (step) {
      case 'intro':
        if (inputLower.includes('yes') || inputLower.includes('ready') || inputLower.includes('sure')) {
          return {
            message: `Awesome! So, you watched "${movie.title}". What was your first impression? Did it grab you right away or take some time to get into?`,
            nextStep: 'initial_thoughts'
          };
        } else {
          return {
            message: `No worries! Take your time. When you're ready to chat about "${movie.title}", just let me know! 😊`,
            nextStep: 'intro'
          };
        }

      case 'initial_thoughts':
        // Analyze sentiment of their response
        const sentiment = await analyzeSentiment(input);
        let response = '';
        
        if (sentiment > 0.3) {
          response = `I can tell you really enjoyed it! ${getRandomPositiveFollowUp()} Now, on a scale of 1-10, what would you rate "${movie.title}" overall?`;
        } else if (sentiment < -0.3) {
          response = `Sounds like it wasn't quite your cup of tea. That's totally valid! Even when we don't love a movie, there's usually something worth discussing. What would you rate it overall from 1-10?`;
        } else {
          response = `Interesting perspective! Mixed feelings can make for the best reviews actually. What overall rating would you give "${movie.title}" from 1-10?`;
        }
        
        return {
          message: response,
          nextStep: 'overall_rating',
          options: { showRatingButtons: true }
        };

      case 'overall_rating':
        // Extract rating from input
        const rating = extractRating(input);
        if (rating) {
          const ratingResponse = getRatingResponse(rating);
          return {
            message: `${ratingResponse} Let's dig deeper! What did you think about the story/plot? Did it keep you engaged?`,
            nextStep: 'detailed_aspects'
          };
        } else {
          return {
            message: `I didn't catch a specific number there. Could you give me a rating from 1-10? You can just say the number! 🔢`,
            nextStep: 'overall_rating',
            options: { showRatingButtons: true }
          };
        }

      case 'detailed_aspects':
        if (inputLower.includes('plot') || inputLower.includes('story')) {
          return {
            message: `${getAcknowledgment(input)} How about the acting? Any standout performances that caught your attention?`,
            nextStep: 'detailed_aspects'
          };
        } else {
          return {
            message: `Got it! What about the visual aspects - cinematography, effects, overall look of the movie? Anything that stood out?`,
            nextStep: 'specific_elements'
          };
        }

      case 'specific_elements':
        return {
          message: `Excellent insights! Now for the fun part - what was your absolute favorite scene or moment? The one that really stuck with you?`,
          nextStep: 'emotional_response'
        };

      case 'emotional_response':
        return {
          message: `Love that! And how did the movie make you feel overall? Excited, emotional, thoughtful, entertained? Help me understand the vibe!`,
          nextStep: 'recommendation'
        };

      case 'recommendation':
        return {
          message: `Perfect! Last question: Would you recommend "${movie.title}" to others? And if so, what type of person would enjoy it most?`,
          nextStep: 'final_review'
        };

      case 'final_review':
        // Generate the actual review
        const generatedReview = await generateFinalReview();
        return {
          message: `Amazing! Based on our conversation, I've crafted a review for you. Take a look and let me know if you'd like me to adjust anything!`,
          nextStep: 'complete',
          options: { showGeneratedReview: true, review: generatedReview }
        };

      default:
        return {
          message: `That's really interesting! Tell me more about that.`,
          nextStep: step
        };
    }
  };

  const analyzeSentiment = async (text) => {
    // Simple sentiment analysis using keywords
    const positiveWords = ['amazing', 'great', 'excellent', 'loved', 'fantastic', 'awesome', 'brilliant', 'perfect', 'wonderful'];
    const negativeWords = ['terrible', 'awful', 'hate', 'boring', 'bad', 'worst', 'disappointed', 'horrible'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return score / words.length; // Normalize
  };

  const extractRating = (input) => {
    const numbers = input.match(/\b([1-9]|10)\b/);
    return numbers ? parseInt(numbers[0]) : null;
  };

  const getRatingResponse = (rating) => {
    if (rating >= 8) return `${rating}/10! That's a high rating - clearly made an impact! ⭐`;
    if (rating >= 6) return `${rating}/10, solid middle ground! There's definitely some good stuff to unpack here.`;
    if (rating >= 4) return `${rating}/10, so mixed feelings but that can lead to really thoughtful reviews!`;
    return `${rating}/10, ouch! But hey, sometimes the most entertaining reviews are about movies that didn't work.`;
  };

  const getRandomPositiveFollowUp = () => {
    const followUps = [
      `That enthusiasm is contagious! 🔥`,
      `Your excitement is really coming through!`,
      `I can feel the movie magic in your words!`,
      `Sounds like it was quite the experience!`
    ];
    return followUps[Math.floor(Math.random() * followUps.length)];
  };

  const getAcknowledgment = (input) => {
    const acknowledgments = [
      `Great point about that!`,
      `Really insightful observation!`,
      `I love that perspective!`,
      `That's exactly the kind of detail that makes reviews helpful!`
    ];
    return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
  };

  const updateReviewData = (input, step) => {
    switch (step) {
      case 'initial_thoughts':
        setReviewData(prev => ({ ...prev, content: prev.content + input + '\n\n' }));
        break;
      case 'overall_rating':
        const rating = extractRating(input);
        if (rating) {
          setReviewData(prev => ({ ...prev, overallRating: rating }));
        }
        break;
      case 'specific_elements':
        setReviewData(prev => ({ ...prev, favoriteScene: input }));
        break;
      case 'emotional_response':
        setReviewData(prev => ({ ...prev, emotions: [...prev.emotions, input] }));
        break;
      case 'recommendation':
        setReviewData(prev => ({ ...prev, recommend: input }));
        break;
      default:
        // No action needed for other steps
        break;
    }
  };

  const generateFinalReview = async () => {
    // Compile all the conversation data into a coherent review
    const reviewText = `
${movie.title} - A ${reviewData.overallRating}/10 Experience

${reviewData.content}

${reviewData.favoriteScene ? `One moment that really stood out was: ${reviewData.favoriteScene}` : ''}

${reviewData.emotions.length > 0 ? `The movie left me feeling ${reviewData.emotions.join(', ')}.` : ''}

${reviewData.recommend ? `Would I recommend it? ${reviewData.recommend}` : ''}

Overall Rating: ${reviewData.overallRating}/10
    `.trim();

    const generatedReview = {
      title: `My thoughts on ${movie.title}`,
      content: reviewText,
      rating: reviewData.overallRating,
      tags: await generateSmartTags(reviewText),
      aiAssisted: true
    };

    return generatedReview;
  };

  const generateSmartTags = async (content) => {
    // Simple tag generation based on content analysis
    const tags = [];
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('amazing') || contentLower.includes('excellent')) tags.push('must-watch');
    if (contentLower.includes('action') || contentLower.includes('fight')) tags.push('action-packed');
    if (contentLower.includes('emotional') || contentLower.includes('cry')) tags.push('emotional');
    if (contentLower.includes('funny') || contentLower.includes('laugh')) tags.push('comedy');
    if (contentLower.includes('visual') || contentLower.includes('effects')) tags.push('visually-stunning');
    
    return tags;
  };

  const handleQuickResponse = (response) => {
    handleUserResponse(response);
  };

  const handleRatingClick = (rating) => {
    handleUserResponse(rating.toString());
  };

  const handleUseReview = (review) => {
    onReviewGenerated(review);
    setShowSuccessMessage(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const renderMessage = (message) => {
    if (message.type === 'bot') {
      return (
        <Fade in={true} key={message.id}>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                mr: 2,
                animation: 'pulse 2s infinite'
              }}
            >
              <SmartToy />
            </Avatar>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                maxWidth: '80%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '18px 18px 18px 4px'
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
              
              {/* Quick Response Buttons */}
              {message.options?.showRatingButtons && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(rating => (
                    <Button
                      key={rating}
                      size="small"
                      variant="outlined"
                      onClick={() => handleRatingClick(rating)}
                      sx={{ 
                        minWidth: 40,
                        borderRadius: '20px',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2
                        }
                      }}
                    >
                      {rating}
                    </Button>
                  ))}
                </Box>
              )}
              
              {/* Generated Review Display */}
              {message.options?.showGeneratedReview && message.options?.review && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    mt: 2, 
                    p: 3, 
                    bgcolor: 'background.paper',
                    border: `2px solid ${theme.palette.primary.main}`,
                    borderRadius: 3
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      📝 Your AI-Generated Review:
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {message.options.review.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating 
                      value={message.options.review.rating} 
                      readOnly 
                      max={10}
                      sx={{ mr: 2 }}
                    />
                    <Chip
                      icon={<AutoAwesome />}
                      label="AI Assisted"
                      size="small"
                      color="primary"
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2, lineHeight: 1.6 }}>
                    {message.options.review.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                    {message.options.review.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<CheckCircle />}
                      onClick={() => handleUseReview(message.options.review)}
                      sx={{ 
                        borderRadius: 3,
                        px: 3,
                        boxShadow: 3,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      Use This Review
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<Psychology />}
                      onClick={() => handleUserResponse("Let's refine this")}
                      sx={{ borderRadius: 3, px: 3 }}
                    >
                      Make Changes
                    </Button>
                  </Box>
                </Paper>
              )}
            </Paper>
          </Box>
        </Fade>
      );
    } else {
      return (
        <Fade in={true} key={message.id}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                maxWidth: '80%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '18px 18px 4px 18px'
              }}
            >
              <Typography variant="body1">
                {message.content}
              </Typography>
            </Paper>
          </Box>
        </Fade>
      );
    }
  };

  const renderTypingIndicator = () => (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
        <SmartToy />
      </Avatar>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: '18px 18px 18px 4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={16} sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Rex is thinking...
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={theme.breakpoints.down('sm')}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            height: { xs: '100%', sm: '85vh' },
            maxHeight: { xs: '100%', sm: '700px' },
            borderRadius: { xs: 0, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)'
            : 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToy sx={{ mr: 1, fontSize: '1.5rem' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                AI Review Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Let's chat about {movie?.title}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Tooltip title="Change personality">
              <IconButton 
                onClick={() => setBotPersonality(
                  botPersonality === 'friendly' ? 'professional' : 
                  botPersonality === 'professional' ? 'casual' : 'friendly'
                )}
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              >
                <AutoAwesome />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <Box sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflowY: 'auto',
            maxHeight: '500px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}>
            {messages.map(renderMessage)}
            {isTyping && renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your response..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUserResponse(userInput);
                  }
                }}
                multiline
                maxRows={3}
                disabled={isTyping}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
              />
              <IconButton 
                color="primary" 
                onClick={() => handleUserResponse(userInput)}
                disabled={!userInput.trim() || isTyping}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.1)'
                  },
                  '&:disabled': {
                    bgcolor: 'action.disabled'
                  }
                }}
              >
                <Send />
              </IconButton>
            </Box>
            
            {/* Quick Response Suggestions */}
            {currentStep === 'intro' && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip 
                  label="Yes, let's start!" 
                  onClick={() => handleQuickResponse("Yes, let's start!")}
                  clickable
                  size="small"
                  sx={{ borderRadius: 3 }}
                />
                <Chip 
                  label="I'm ready!" 
                  onClick={() => handleQuickResponse("I'm ready!")}
                  clickable
                  size="small"
                  sx={{ borderRadius: 3 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessMessage(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Review created successfully! 🎉
        </Alert>
      </Snackbar>
    </>
  );
};

export default AIReviewBot;