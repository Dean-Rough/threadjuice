import '@testing-library/jest-dom';
import 'jest-extended/all';

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
