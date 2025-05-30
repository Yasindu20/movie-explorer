import React, { useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { MovieFilter, Login, PersonAdd } from '@mui/icons-material';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };
  
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
            mb: 4
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
        
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;