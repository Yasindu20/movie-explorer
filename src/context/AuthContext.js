import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        const response = await authApi.getMe();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const register = async (userData) => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await authApi.register(userData);
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        setSuccessMessage(`Welcome to Movie Explorer, ${response.user.name}! Your account has been created successfully.`);
        setLoading(false);
        return { success: true, message: 'Account created successfully!' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await authApi.login({ username, password });
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        setSuccessMessage(`Welcome back, ${response.user.name}!`);
        setLoading(false);
        return { success: true, message: 'Login successful!' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Invalid username or password. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    clearMessages();
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authApi.updateProfile(userData);
      
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setSuccessMessage('Profile updated successfully!');
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateProfile,
        checkAuth,
        error,
        successMessage,
        loading,
        isAuthenticated,
        clearMessages
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};