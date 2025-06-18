import '@testing-library/jest-dom';
import 'jest-extended/all';

// Polyfill fetch for Node.js environment
import 'whatwg-fetch';

// Only setup MSW in test environment to avoid import issues
// Commented out temporarily to fix ReadableStream conflicts
// if (process.env.NODE_ENV === 'test') {
//   require('./src/__tests__/mocks/server');
// }

// Load environment variables for testing
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env files
loadEnvConfig(process.cwd());

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
