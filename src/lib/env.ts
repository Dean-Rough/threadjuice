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

  // Content Ingestion - Reddit API (required in production, optional in development)
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(), 
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
 * Validates and parses environment variables with graceful fallbacks
 * Provides warnings for missing optional variables instead of crashing
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Separate critical errors from warnings
      const criticalErrors: string[] = [];
      const warnings: string[] = [];
      
      error.errors.forEach(err => {
        const fieldPath = err.path.join('.');
        const message = `${fieldPath}: ${err.message}`;
        
        // Define critical fields that should crash the app
        const criticalFields = [
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          'SUPABASE_SERVICE_ROLE_KEY',
          'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
          'CLERK_SECRET_KEY',
          'NEXT_PUBLIC_APP_URL'
        ];
        
        if (criticalFields.includes(fieldPath)) {
          criticalErrors.push(message);
        } else {
          warnings.push(message);
        }
      });
      
      // Log warnings but don't crash
      if (warnings.length > 0) {
        console.warn(
          `⚠️ Environment warnings (app will continue with defaults):\n${warnings.join('\n')}`
        );
      }
      
      // Only crash on critical errors
      if (criticalErrors.length > 0) {
        throw new Error(
          `❌ Critical environment validation failed:\n${criticalErrors.join('\n')}\n\n` +
          `💡 Check your .env.local file and ensure all required variables are set.\n` +
          `📋 Copy .env.example to .env.local as a starting point.`
        );
      }
      
      // Return parsed environment with defaults for warnings
      return envSchema.parse({
        ...process.env,
        // Provide safe defaults for non-critical fields
        RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED || 'false',
        CONTENT_MODERATION_ENABLED: process.env.CONTENT_MODERATION_ENABLED || 'false',
        REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT || 'ThreadJuice/1.0',
        WIKIMEDIA_USER_AGENT: process.env.WIKIMEDIA_USER_AGENT || 'ThreadJuice/1.0',
      });
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