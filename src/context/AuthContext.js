import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(userData);
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({ username, password });
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Invalid credentials';
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
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authApi.updateProfile(userData);
      
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
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
        loading,
        isAuthenticated
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