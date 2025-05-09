module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/src/setupTests.js'
  ],
  moduleNameMapper: {
    // Add explicit mapping for react-router-dom
    '^react-router-dom$': '<rootDir>/__mocks__/react-router-dom.js',
    // Keep any other mappings you need
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ]
};