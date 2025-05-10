import React from 'react';
import { render, screen } from '@testing-library/react';

test('basic rendering test', () => {
  render(<div>Login</div>);
  const loginElement = screen.getByText(/login/i);
  expect(loginElement).toBeInTheDocument();
});