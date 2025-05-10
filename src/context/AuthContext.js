import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const demoUser = {
  username: 'user',
  password: 'password',
  name: 'Demo User'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  // Save user to localStorage when they log in
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = (username, password) => {
    setLoading(true);
    setError(null);
    
    
    // Simulating API call with setTimeout
    setTimeout(() => {
      if (username === demoUser.username && password === demoUser.password) {
        setUser({
          username: demoUser.username,
          name: demoUser.name
        });
        setLoading(false);
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        error,
        loading,
        isAuthenticated: !!user
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