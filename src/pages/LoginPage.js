import React, { useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { MovieFilter, Login, PersonAdd } from '@mui/icons-material';

const LoginPage = () => {
  const { isAuthenticated, successMessage } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Redirect to home if already authenticated or after successful auth
  useEffect(() => {
    if (isAuthenticated) {
      setIsRedirecting(true);
      
      // Show success message briefly before redirecting
      const redirectTimer = setTimeout(() => {
        navigate('/', { replace: true });
      }, successMessage ? 2000 : 500); // Longer delay if there's a success message
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, navigate, successMessage]);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null && !isRedirecting) {
      setMode(newMode);
    }
  };

  // Show redirecting state
  if (isRedirecting) {
    return (
      <Container component="main" maxWidth="md" sx={{ py: 8 }}>
        <Fade in={true}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <MovieFilter sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Movie Explorer!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Redirecting you to your movie collection...
            </Typography>
          </Box>
        </Fade>
      </Container>
    );
  }
  
  return (
    <Container component="main" maxWidth="md" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            textAlign: 'center',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <MovieFilter sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Movie Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Discover your favorite movies, explore trending titles,
            and create your own collection of film favorites.
          </Typography>

          {/* Mode Toggle */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="authentication mode"
            sx={{ mb: 2 }}
          >
            <ToggleButton value="login" aria-label="login">
              <Login sx={{ mr: 1 }} />
              Sign In
            </ToggleButton>
            <ToggleButton value="register" aria-label="register">
              <PersonAdd sx={{ mr: 1 }} />
              Sign Up
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
        
        <Fade in={true} key={mode}>
          <Box sx={{ width: '100%' }}>
            {mode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default LoginPage;