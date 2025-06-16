import { z } from 'zod';

/**
 * Environment Variable Validation Schema
 * Validates all required environment variables using Zod
 */
const envSchema = z.object({
  // Application Config
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4242'),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Authentication - Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),

  // Database - Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // AI & Content Generation - OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required').startsWith('sk-', 'OpenAI API key must start with sk-'),

  // Content Ingestion - Reddit API
  REDDIT_CLIENT_ID: z.string().min(1, 'Reddit client ID is required'),
  REDDIT_CLIENT_SECRET: z.string().min(1, 'Reddit client secret is required'),
  REDDIT_USER_AGENT: z.string().default('ThreadJuice/1.0'),

  // External Media APIs (Optional)
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  WIKIMEDIA_USER_AGENT: z.string().default('ThreadJuice/1.0'),

  // Rate Limiting & Moderation (Optional)
  RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('false'),
  CONTENT_MODERATION_ENABLED: z.string().transform(val => val === 'true').default('false'),

  // Analytics & Monitoring (Optional)
  VERCEL_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // Email Service (Optional)
  RESEND_API_KEY: z.string().optional(),

  // Redis Cache (Optional)
  REDIS_URL: z.string().url().optional(),
});

/**
 * Validates and parses environment variables
 * Throws detailed error messages for missing or invalid variables
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Environment validation failed:\n${missingVars.join('\n')}\n\n` +
        `💡 Check your .env.local file and ensure all required variables are set.\n` +
        `📋 Copy .env.example to .env.local as a starting point.`
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper functions for specific environment checks
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Database helpers
export const getSupabaseConfig = () => ({
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
});

// Reddit API helpers
export const getRedditConfig = () => ({
  clientId: env.REDDIT_CLIENT_ID,
  clientSecret: env.REDDIT_CLIENT_SECRET,
  userAgent: env.REDDIT_USER_AGENT,
});

// OpenAI helpers
export const getOpenAIConfig = () => ({
  apiKey: env.OPENAI_API_KEY,
});

// Feature flags
export const isRateLimitingEnabled = () => env.RATE_LIMIT_ENABLED;
export const isContentModerationEnabled = () => env.CONTENT_MODERATION_ENABLED;