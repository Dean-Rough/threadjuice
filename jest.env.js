/**
 * Jest Environment Setup
 * Sets up environment variables for Jest unit tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:4242';

// Mock Supabase configuration for unit tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key_for_jest_tests';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key_for_jest_tests';

// Mock Clerk authentication
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_clerk_key_jest';
process.env.CLERK_SECRET_KEY = 'sk_test_mock_clerk_secret_jest';

// Mock OpenAI
process.env.OPENAI_API_KEY = 'sk-mock_openai_key_for_jest_tests';

// Mock Reddit API
process.env.REDDIT_CLIENT_ID = 'mock_reddit_client_jest';
process.env.REDDIT_CLIENT_SECRET = 'mock_reddit_secret_jest';
process.env.REDDIT_USER_AGENT = 'ThreadJuice-Jest/1.0';

// Disable features that require external services
process.env.RATE_LIMIT_ENABLED = 'false';
process.env.CONTENT_MODERATION_ENABLED = 'false';

// Mock other optional services
process.env.UNSPLASH_ACCESS_KEY = 'mock_unsplash_key_jest';
process.env.WIKIMEDIA_USER_AGENT = 'ThreadJuice-Jest/1.0';