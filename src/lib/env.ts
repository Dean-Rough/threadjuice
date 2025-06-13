import { z } from 'zod';

// Environment variable validation schemas
const serverEnvSchema = z.object({
  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),

  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),

  // Reddit API
  REDDIT_CLIENT_ID: z.string().min(1, 'Reddit client ID is required'),
  REDDIT_CLIENT_SECRET: z.string().min(1, 'Reddit client secret is required'),
  REDDIT_USER_AGENT: z.string().min(1, 'Reddit user agent is required'),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),

  // Optional external APIs
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  WIKIMEDIA_USER_AGENT: z.string().optional(),

  // Application config
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Analytics and monitoring
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),

  // Email service
  RESEND_API_KEY: z.string().optional(),

  // Rate limiting
  REDIS_URL: z.string().url().optional(),
  RATE_LIMIT_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  // Content moderation
  CONTENT_MODERATION_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  PROFANITY_FILTER_LEVEL: z.enum(['low', 'medium', 'high']).default('medium'),
});

const clientEnvSchema = z.object({
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'Clerk publishable key is required'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),

  // Application config
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('App URL must be a valid URL')
    .default('http://localhost:3000'),
});

// Type definitions
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// Server-side environment validation
function validateServerEnv(): ServerEnv {
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `❌ Invalid server environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env.local file.`
      );
    }
    throw error;
  }
}

// Client-side environment validation
function validateClientEnv(): ClientEnv {
  try {
    const clientEnv = {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    };

    return clientEnvSchema.parse(clientEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `❌ Invalid client environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env.local file.`
      );
    }
    throw error;
  }
}

// Validate and export environment variables
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

// Utility functions
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnvVar(
  key: string,
  defaultValue?: string
): string | undefined {
  return process.env[key] || defaultValue;
}

export function getBooleanEnvVar(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

export function getNumberEnvVar(
  key: string,
  defaultValue?: number
): number | undefined {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

// Environment-specific configurations
export const config = {
  isDevelopment: serverEnv.NODE_ENV === 'development',
  isProduction: serverEnv.NODE_ENV === 'production',
  isTest: serverEnv.NODE_ENV === 'test',

  // API configurations
  reddit: {
    clientId: serverEnv.REDDIT_CLIENT_ID,
    clientSecret: serverEnv.REDDIT_CLIENT_SECRET,
    userAgent: serverEnv.REDDIT_USER_AGENT,
  },

  openai: {
    apiKey: serverEnv.OPENAI_API_KEY,
  },

  clerk: {
    secretKey: serverEnv.CLERK_SECRET_KEY,
    publishableKey: clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },

  supabase: {
    url: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  },

  app: {
    url: clientEnv.NEXT_PUBLIC_APP_URL,
  },

  // Feature flags
  features: {
    rateLimitEnabled: serverEnv.RATE_LIMIT_ENABLED,
    contentModerationEnabled: serverEnv.CONTENT_MODERATION_ENABLED,
    profanityFilterLevel: serverEnv.PROFANITY_FILTER_LEVEL,
  },

  // Optional services
  services: {
    unsplash: serverEnv.UNSPLASH_ACCESS_KEY
      ? {
          accessKey: serverEnv.UNSPLASH_ACCESS_KEY,
        }
      : null,

    sentry: serverEnv.SENTRY_DSN
      ? {
          dsn: serverEnv.SENTRY_DSN,
        }
      : null,

    resend: serverEnv.RESEND_API_KEY
      ? {
          apiKey: serverEnv.RESEND_API_KEY,
        }
      : null,

    redis: serverEnv.REDIS_URL
      ? {
          url: serverEnv.REDIS_URL,
        }
      : null,
  },
};

// Validation helper for runtime checks
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    validateServerEnv();
    validateClientEnv();
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Development helper to log configuration
export function logEnvironmentInfo() {
  if (config.isDevelopment) {
    console.log('🔧 Environment Configuration:');
    console.log(`   NODE_ENV: ${serverEnv.NODE_ENV}`);
    console.log(`   App URL: ${config.app.url}`);
    console.log(`   Supabase URL: ${config.supabase.url}`);
    console.log(
      `   Rate Limiting: ${config.features.rateLimitEnabled ? '✅' : '❌'}`
    );
    console.log(
      `   Content Moderation: ${config.features.contentModerationEnabled ? '✅' : '❌'}`
    );
    console.log(`   Unsplash API: ${config.services.unsplash ? '✅' : '❌'}`);
    console.log(`   Sentry: ${config.services.sentry ? '✅' : '❌'}`);
    console.log(`   Redis: ${config.services.redis ? '✅' : '❌'}`);
  }
}
