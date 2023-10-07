module.exports = {
    roots: ['<rootDir>/src/__tests__'],
    testTimeout: 60000,
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)", "**/*.teste.*"],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    globalSetup: '<rootDir>/src/__tests__/setup.ts',
    testPathIgnorePatterns: ["<rootDir>/src/__tests__/setup.ts"],
  };
