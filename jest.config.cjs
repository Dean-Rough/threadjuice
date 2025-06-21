const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
    '<rootDir>/src/__tests__/mocks/',
    '<rootDir>/src-backup-frankensteined/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/lib/whydidyourender.ts',
    '!src/__tests__/mocks/**',
  ],
  testTimeout: 30000,
  transformIgnorePatterns: ['node_modules/(?!(msw|@mswjs)/)'],
};

module.exports = createJestConfig(config);
