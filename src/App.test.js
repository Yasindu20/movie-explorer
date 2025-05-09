// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the context providers
jest.mock('./context/MovieContext', () => ({
  useMovieContext: () => ({
    darkMode: false,
    toggleDarkMode: jest.fn(),
  }),
}));

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}));

test('renders login page when user is not authenticated', () => {
  // Using try/catch to provide better error messages
  try {
    render(<App />);
    // Add more resilient test assertions
    const loginElements = screen.getAllByText(/login/i);
    expect(loginElements.length).toBeGreaterThan(0);
  } catch (error) {
    console.error('Test failed with error:', error);
    throw error;
  }
});