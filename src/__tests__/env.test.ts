/**
 * Test environment configuration
 * Verifies that mock environment variables work correctly
 */

import { env } from '../lib/env';

describe('Environment Configuration', () => {
  it('should provide mock environment variables in test mode', () => {
    expect(env.NODE_ENV).toBe('test');
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeTruthy();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeTruthy();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeTruthy();
    expect(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeTruthy();
    expect(env.CLERK_SECRET_KEY).toBeTruthy();
    expect(env.OPENAI_API_KEY).toBeTruthy();
  });

  it('should have mock values that are safe for testing', () => {
    // Verify these are clearly test values
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toContain('mock');
    expect(env.OPENAI_API_KEY).toContain('mock');
    expect(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toContain('mock');
    expect(env.CLERK_SECRET_KEY).toContain('mock');
  });

  it('should not crash when imported', () => {
    // This test verifies that importing env.ts doesn't throw errors
    expect(env).toBeDefined();
    expect(typeof env).toBe('object');
  });
});