import '@testing-library/jest-dom';

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Mock react-youtube
jest.mock('react-youtube', () => () => <div>YouTube Video</div>);