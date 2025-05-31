import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert, 
  InputAdornment, 
  IconButton,
  CircularProgress,
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, error, successMessage, loading, clearMessages } = useAuth();

  // Clear messages when component mounts or when switching forms
  useEffect(() => {
    clearMessages();
    return () => clearMessages();
  }, [clearMessages]);

  // Show success message if login is successful
  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true);
      // Hide success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    
    // Attempt login
    const result = await login(username, password);
    
    if (result.success) {
      // Clear form on successful login
      setUsername('');
      setPassword('');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setUsername('demo_user');
    setPassword('password123');
    clearMessages();
  };

  // Clear error when user starts typing
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (formErrors.username) {
      setFormErrors(prev => ({ ...prev, username: '' }));
    }
    if (error) clearMessages();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: '' }));
    }
    if (error) clearMessages();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        mx: 'auto',
        mt: 2,
        borderRadius: 2
      }}
    >
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        Welcome Back
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Sign in to access your movie collection
      </Typography>
      
      {/* Success Message */}
      <Collapse in={showSuccess}>
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          icon={<CheckCircle />}
        >
          {successMessage}
        </Alert>
      </Collapse>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={handleUsernameChange}
          error={!!formErrors.username}
          helperText={formErrors.username}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={handlePasswordChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={fillDemoCredentials}
          sx={{ mb: 2 }}
          disabled={loading}
        >
          Use Demo Credentials
        </Button>
        
        {onSwitchToRegister && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button
                variant="text"
                onClick={onSwitchToRegister}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          For demo purposes, use: username "demo_user" and password "password123"
        </Typography>
      </Box>
    </Paper>
  );
};

export default LoginForm;