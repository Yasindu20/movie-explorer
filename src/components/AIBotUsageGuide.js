import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  Close,
  SmartToy,
  Chat,
  Psychology,
  AutoAwesome,
  CheckCircle,
  TipsAndUpdates
} from '@mui/icons-material';

const AIBotUsageGuide = ({ open, onClose, onStartBot }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Start the Conversation',
      description: 'Click "Start Chatting with AI" and Rex will greet you',
      icon: <Chat />,
      tip: 'Just be yourself! The AI is designed to have natural conversations.',
      example: 'Rex: "Hey! Ready to talk about this movie?"'
    },
    {
      label: 'Share Your Initial Thoughts',
      description: 'Tell the AI what you thought about the movie overall',
      icon: <Psychology />,
      tip: 'Don\'t worry about being perfect - just share your honest first impressions.',
      example: 'You: "I really enjoyed it! The action scenes were incredible."'
    },
    {
      label: 'Answer Follow-up Questions',
      description: 'The AI will ask thoughtful questions to dig deeper',
      icon: <SmartToy />,
      tip: 'The AI adapts its questions based on your responses for a personalized experience.',
      example: 'Rex: "What would you rate it from 1-10? What made those action scenes special?"'
    },
    {
      label: 'Get Your Perfect Review',
      description: 'The AI creates a polished review from your conversation',
      icon: <AutoAwesome />,
      tip: 'You can ask for changes if you want to adjust anything in the final review.',
      example: 'A well-structured review that captures your voice and opinions.'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStartBot = () => {
    onStartBot();
    onClose();
  };

  return (
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

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <SmartToy sx={{ mr: 1, fontSize: '2rem' }} />
          <Typography variant="h4" fontWeight="bold">
            How to Chat with AI
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Learn how to get the best review in just 4 simple steps
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: activeStep >= index ? 'primary.main' : 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="h6" fontWeight="bold">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Card elevation={2} sx={{ mt: 2, mb: 3 }}>
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      {step.description}
                    </Typography>

                    <Box sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      borderLeft: `4px solid ${theme.palette.info.main}`,
                      p: 2,
                      mb: 2,
                      borderRadius: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TipsAndUpdates color="info" sx={{ mr: 1, fontSize: '1.2rem' }} />
                        <Typography variant="subtitle2" fontWeight="bold">
                          Pro Tip:
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {step.tip}
                      </Typography>
                    </Box>

                    <Box sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                      borderRadius: 2,
                      p: 2
                    }}>
                      <Typography variant="caption" color="success.main" fontWeight="bold">
                        EXAMPLE:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                        {step.example}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={activeStep === steps.length - 1}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Card
            elevation={3}
            sx={{
              mt: 3,
              p: 3,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
            }}
          >
            <CheckCircle color="success" sx={{ fontSize: '3rem', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              You're Ready to Go!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Now you know how to get the most out of your AI chat experience. 
              Ready to create an amazing review?
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip icon={<Chat />} label="Natural conversation" color="primary" />
              <Chip icon={<Psychology />} label="Smart questions" color="primary" />
              <Chip icon={<AutoAwesome />} label="Perfect results" color="primary" />
            </Box>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleStartBot}
          variant="contained"
          size="large"
          startIcon={<SmartToy />}
          sx={{
            borderRadius: 2,
            px: 3,
            boxShadow: 3,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 6
            }
          }}
        >
          Start Chatting Now!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIBotUsageGuide;