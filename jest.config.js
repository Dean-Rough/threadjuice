const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
    '<rootDir>/src/__tests__/mocks/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/lib/whydidyourender.ts',
    '!src/__tests__/mocks/**',
  ],
  testTimeout: 10000,
  transformIgnorePatterns: ['node_modules/(?!(msw|@mswjs)/)'],
};

module.exports = createJestConfig(customJestConfig);
