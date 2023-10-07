module.exports = {
    roots: ['<rootDir>/src/__tests__'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testPathIgnorePatterns: [
      '<rootDir>/src/__tests__/setup.js',
      '<rootDir>/src/__tests__/teardown.js',
    ],
  };
