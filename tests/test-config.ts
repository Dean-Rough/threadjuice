/**
 * Test Configuration for ThreadJuice E2E Tests
 * Provides mock configurations and utilities for testing
 */

/**
 * Mock environment configuration for tests
 * These values are safe to use in test environments
 */
export const TEST_ENV_CONFIG = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:4242',

  // Mock Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2siLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjQ4NDQ5OSwiZXhwIjoxOTU4MDYwNDk5fQ.mock_test_key',
  SUPABASE_SERVICE_ROLE_KEY:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2siLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQyNDg0NDk5LCJleHAiOjE5NTgwNjA0OTl9.mock_service_key',

  // Mock Clerk authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_mock_clerk_key',
  CLERK_SECRET_KEY: 'sk_test_mock_clerk_secret',

  // Mock OpenAI
  OPENAI_API_KEY: 'sk-mock_openai_key_for_tests',

  // Mock Reddit API
  REDDIT_CLIENT_ID: 'mock_reddit_client',
  REDDIT_CLIENT_SECRET: 'mock_reddit_secret',
  REDDIT_USER_AGENT: 'ThreadJuice-Test/1.0',

  // Disabled features for tests
  RATE_LIMIT_ENABLED: 'false',
  CONTENT_MODERATION_ENABLED: 'false',
};

/**
 * Mock post data for testing
 */
export function getMockPostData(slug?: string) {
  if (!slug) return null;

  return {
    id: 'mock-post-1',
    slug: slug,
    title: 'Mock Test Post for E2E Testing',
    content: JSON.stringify({
      sections: [
        {
          type: 'headline',
          content: 'Mock Test Headline',
        },
        {
          type: 'paragraph',
          content: 'This is a mock post for E2E testing purposes.',
        },
      ],
    }),
    category: 'Technology',
    tags: ['test', 'mock'],
    author_persona: 'The Snarky Sage',
    published: true,
    engagement_score: 100,
    views: 1000,
    upvotes: 50,
    comments: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Setup test environment variables
 */
export function setupTestEnvironment() {
  Object.entries(TEST_ENV_CONFIG).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

/**
 * Check if we're in a test environment
 */
export function isTestEnvironment() {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.CI === 'true'
  );
}
