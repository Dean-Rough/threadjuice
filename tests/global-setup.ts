import { FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright E2E tests
 * Sets up test environment variables and mocks external services
 */
async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up E2E test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:4242';
  
  // Mock Supabase configuration for tests
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2siLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjQ4NDQ5OSwiZXhwIjoxOTU4MDYwNDk5fQ.mock_test_key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2siLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQyNDg0NDk5LCJleHAiOjE5NTgwNjA0OTl9.mock_service_key';
  
  // Mock Clerk authentication for tests
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_clerk_key';
  process.env.CLERK_SECRET_KEY = 'sk_test_mock_clerk_secret';
  
  // Mock OpenAI for content generation tests
  process.env.OPENAI_API_KEY = 'sk-mock_openai_key_for_tests';
  
  // Optional service mocks
  process.env.REDDIT_CLIENT_ID = 'mock_reddit_client';
  process.env.REDDIT_CLIENT_SECRET = 'mock_reddit_secret';
  process.env.REDDIT_USER_AGENT = 'ThreadJuice-Test/1.0';
  
  console.log('✅ E2E test environment configured');
}

export default globalSetup;