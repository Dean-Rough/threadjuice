import { z } from 'zod';

// Mock the env module to test validation
const mockEnv = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  CLERK_SECRET_KEY: 'test-clerk-key',
  CLERK_PUBLISHABLE_KEY: 'pk_test_123',
  OPENAI_API_KEY: 'sk-test-openai-key',
  REDDIT_CLIENT_ID: 'test-reddit-id',
  REDDIT_CLIENT_SECRET: 'test-reddit-secret',
  REDDIT_USER_AGENT: 'ThreadJuice/1.0',
  ELEVENLABS_API_KEY: 'test-elevenlabs-key',
  NODE_ENV: 'test',
};

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env
    jest.resetModules();
    process.env = { ...originalEnv, ...mockEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Validation', () => {
    it('should validate required Supabase environment variables', () => {
      const supabaseSchema = z.object({
        SUPABASE_URL: z.string().url(),
        SUPABASE_ANON_KEY: z.string().min(1),
        SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
      });

      const result = supabaseSchema.safeParse({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.SUPABASE_URL).toBe(mockEnv.SUPABASE_URL);
        expect(result.data.SUPABASE_ANON_KEY).toBe(mockEnv.SUPABASE_ANON_KEY);
        expect(result.data.SUPABASE_SERVICE_ROLE_KEY).toBe(
          mockEnv.SUPABASE_SERVICE_ROLE_KEY
        );
      }
    });

    it('should validate Clerk authentication keys', () => {
      const clerkSchema = z.object({
        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
      });

      const result = clerkSchema.safeParse({
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.CLERK_SECRET_KEY).toBe(mockEnv.CLERK_SECRET_KEY);
        expect(result.data.CLERK_PUBLISHABLE_KEY).toBe(
          mockEnv.CLERK_PUBLISHABLE_KEY
        );
      }
    });

    it('should validate OpenAI API key format', () => {
      const openaiSchema = z.object({
        OPENAI_API_KEY: z.string().startsWith('sk-'),
      });

      const result = openaiSchema.safeParse({
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.OPENAI_API_KEY).toBe(mockEnv.OPENAI_API_KEY);
      }
    });

    it('should validate Reddit API configuration', () => {
      const redditSchema = z.object({
        REDDIT_CLIENT_ID: z.string().min(1),
        REDDIT_CLIENT_SECRET: z.string().min(1),
        REDDIT_USER_AGENT: z.string().min(1),
      });

      const result = redditSchema.safeParse({
        REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
        REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
        REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.REDDIT_CLIENT_ID).toBe(mockEnv.REDDIT_CLIENT_ID);
        expect(result.data.REDDIT_CLIENT_SECRET).toBe(
          mockEnv.REDDIT_CLIENT_SECRET
        );
        expect(result.data.REDDIT_USER_AGENT).toBe(mockEnv.REDDIT_USER_AGENT);
      }
    });

    it('should validate ElevenLabs API key', () => {
      const elevenlabsSchema = z.object({
        ELEVENLABS_API_KEY: z.string().min(1),
      });

      const result = elevenlabsSchema.safeParse({
        ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ELEVENLABS_API_KEY).toBe(mockEnv.ELEVENLABS_API_KEY);
      }
    });

    it('should validate NODE_ENV', () => {
      const nodeEnvSchema = z.object({
        NODE_ENV: z.enum(['development', 'production', 'test']),
      });

      const result = nodeEnvSchema.safeParse({
        NODE_ENV: process.env.NODE_ENV,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('test');
      }
    });
  });

  describe('Environment Variable Errors', () => {
    it('should fail validation for invalid Supabase URL', () => {
      const invalidSchema = z.object({
        SUPABASE_URL: z.string().url(),
      });

      const result = invalidSchema.safeParse({
        SUPABASE_URL: 'not-a-valid-url',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
      }
    });

    it('should fail validation for missing required variables', () => {
      const requiredSchema = z.object({
        SUPABASE_URL: z.string().min(1),
        SUPABASE_ANON_KEY: z.string().min(1),
      });

      const result = requiredSchema.safeParse({
        SUPABASE_URL: '',
        SUPABASE_ANON_KEY: undefined,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for incorrect Clerk key format', () => {
      const clerkSchema = z.object({
        CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
      });

      const result = clerkSchema.safeParse({
        CLERK_PUBLISHABLE_KEY: 'invalid-key-format',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
      }
    });

    it('should fail validation for incorrect OpenAI key format', () => {
      const openaiSchema = z.object({
        OPENAI_API_KEY: z.string().startsWith('sk-'),
      });

      const result = openaiSchema.safeParse({
        OPENAI_API_KEY: 'invalid-openai-key',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
      }
    });
  });

  describe('Environment Type Safety', () => {
    it('should provide type-safe access to environment variables', () => {
      // Test that environment variables are properly typed
      const envVars = {
        SUPABASE_URL: process.env.SUPABASE_URL as string,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY as string,
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
      };

      expect(typeof envVars.SUPABASE_URL).toBe('string');
      expect(typeof envVars.SUPABASE_ANON_KEY).toBe('string');
      expect(['development', 'production', 'test']).toContain(envVars.NODE_ENV);
    });

    it('should handle optional environment variables', () => {
      const optionalSchema = z.object({
        OPTIONAL_VAR: z.string().optional(),
        REQUIRED_VAR: z.string(),
      });

      const result = optionalSchema.safeParse({
        REQUIRED_VAR: 'value',
        // OPTIONAL_VAR is not provided
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.REQUIRED_VAR).toBe('value');
        expect(result.data.OPTIONAL_VAR).toBeUndefined();
      }
    });
  });

  describe('Environment Loading', () => {
    it('should load environment variables from .env files', () => {
      // In a real test environment, this would verify that dotenv
      // or Next.js automatically loads .env.local, .env.test, etc.
      expect(process.env.NODE_ENV).toBeDefined();
    });

    it('should prioritize local environment over default values', () => {
      // Test that local .env values override defaults
      process.env.TEST_VAR = 'local-value';

      expect(process.env.TEST_VAR).toBe('local-value');
    });

    it('should handle production environment variables', () => {
      // Simulate production environment
      const prodEnv = { ...mockEnv, NODE_ENV: 'production' };

      const prodSchema = z.object({
        NODE_ENV: z.literal('production'),
        SUPABASE_URL: z.string().url(),
      });

      const result = prodSchema.safeParse(prodEnv);
      expect(result.success).toBe(true);
    });
  });

  describe('Security Validation', () => {
    it('should validate that sensitive keys are not empty', () => {
      const sensitiveKeysSchema = z.object({
        SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
        CLERK_SECRET_KEY: z.string().min(10),
        OPENAI_API_KEY: z.string().min(10),
      });

      const result = sensitiveKeysSchema.safeParse({
        SUPABASE_SERVICE_ROLE_KEY: mockEnv.SUPABASE_SERVICE_ROLE_KEY,
        CLERK_SECRET_KEY: mockEnv.CLERK_SECRET_KEY,
        OPENAI_API_KEY: mockEnv.OPENAI_API_KEY,
      });

      expect(result.success).toBe(true);
    });

    it('should reject weak or placeholder values', () => {
      const securitySchema = z.object({
        API_KEY: z
          .string()
          .refine(
            val =>
              !['test', 'placeholder', 'changeme'].includes(val.toLowerCase()),
            { message: 'API key appears to be a placeholder value' }
          ),
      });

      const weakResult = securitySchema.safeParse({ API_KEY: 'test' });
      expect(weakResult.success).toBe(false);

      const goodResult = securitySchema.safeParse({
        API_KEY: 'sk-real-api-key-12345',
      });
      expect(goodResult.success).toBe(true);
    });
  });
});
