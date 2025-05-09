import React, { useEffect } from 'react';
import { Container, Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import { MovieFilter } from '@mui/icons-material';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
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
          <Typography variant="body1" color="text.secondary">
            Discover your favorite movies, explore trending titles,
            and create your own collection of film favorites.
          </Typography>
        </Paper>
        
        <LoginForm />
      </Box>
    </Container>
  );
};

export default LoginPage;