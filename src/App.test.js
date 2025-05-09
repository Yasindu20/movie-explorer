import { render, screen } from '@testing-library/react';
import App from './App';

// Mock your components and context
jest.mock('./context/MovieContext', () => ({
  useMovieContext: () => ({ darkMode: false }),
}));

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

jest.mock('./components/Header', () => () => <div data-testid="header-mock">Header</div>);
jest.mock('./pages/LoginPage', () => () => <div data-testid="login-page-mock">Login Page</div>);

test('renders without crashing', () => {
  render(<App />);
  expect(screen.getByTestId('login-page-mock')).toBeInTheDocument();
});