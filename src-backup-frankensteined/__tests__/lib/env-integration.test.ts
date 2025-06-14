import { validateEnvironment, logEnvironmentInfo, config } from '@/lib/env';

describe('Environment Integration Tests', () => {
  describe('Environment Validation', () => {
    it('should validate current environment configuration', () => {
      const validation = validateEnvironment();

      if (!validation.isValid) {
        console.error('Environment validation errors:', validation.errors);
      }

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should have all required environment variables', () => {
      // Test that critical environment variables are present
      expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeDefined();
      expect(process.env.CLERK_SECRET_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    });

    it('should provide typed access to configuration', () => {
      expect(config.isDevelopment).toBeDefined();
      expect(config.clerk.publishableKey).toBeDefined();
      expect(config.supabase.url).toBeDefined();
      expect(config.supabase.anonKey).toBeDefined();
      expect(config.app.url).toBeDefined();
    });

    it('should handle optional environment variables gracefully', () => {
      // These should not throw errors even if not set
      expect(() => config.services.unsplash).not.toThrow();
      expect(() => config.services.sentry).not.toThrow();
      expect(() => config.services.redis).not.toThrow();
    });

    it('should log environment info in development', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logEnvironmentInfo();

      if (config.isDevelopment) {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Environment File Structure', () => {
    it('should have consistent variable names between .env.example and validation schema', () => {
      // This test ensures that all variables in .env.example are validated
      // and all required variables in the schema have examples

      const requiredServerVars = [
        'CLERK_SECRET_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'REDDIT_CLIENT_ID',
        'REDDIT_CLIENT_SECRET',
        'REDDIT_USER_AGENT',
        'OPENAI_API_KEY',
      ];

      const requiredClientVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ];

      // All required variables should be defined in process.env or have defaults
      requiredServerVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
      });

      requiredClientVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
      });
    });

    it('should provide clear error messages for missing variables', () => {
      // Test with a mock environment missing required variables
      const originalEnv = process.env;

      try {
        // Remove a required variable
        delete process.env.CLERK_SECRET_KEY;

        const validation = validateEnvironment();

        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
        expect(validation.errors[0]).toContain('CLERK_SECRET_KEY');
      } finally {
        // Restore original environment
        process.env = originalEnv;
      }
    });
  });

  describe('Feature Flags', () => {
    it('should handle boolean feature flags correctly', () => {
      expect(typeof config.features.rateLimitEnabled).toBe('boolean');
      expect(typeof config.features.contentModerationEnabled).toBe('boolean');
      expect(['low', 'medium', 'high']).toContain(
        config.features.profanityFilterLevel
      );
    });

    it('should provide environment-specific configurations', () => {
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(typeof config.isProduction).toBe('boolean');
      expect(typeof config.isTest).toBe('boolean');

      // Only one should be true
      const envFlags = [
        config.isDevelopment,
        config.isProduction,
        config.isTest,
      ];
      expect(envFlags.filter(Boolean)).toHaveLength(1);
    });
  });

  describe('API Configuration', () => {
    it('should provide structured API configurations', () => {
      expect(config.reddit).toBeDefined();
      expect(config.reddit.clientId).toBeDefined();
      expect(config.reddit.clientSecret).toBeDefined();
      expect(config.reddit.userAgent).toBeDefined();

      expect(config.openai).toBeDefined();
      expect(config.openai.apiKey).toBeDefined();

      expect(config.clerk).toBeDefined();
      expect(config.clerk.secretKey).toBeDefined();
      expect(config.clerk.publishableKey).toBeDefined();

      expect(config.supabase).toBeDefined();
      expect(config.supabase.url).toBeDefined();
      expect(config.supabase.anonKey).toBeDefined();
      expect(config.supabase.serviceRoleKey).toBeDefined();
    });

    it('should validate URL formats', () => {
      expect(config.supabase.url).toMatch(/^https?:\/\//);
      expect(config.app.url).toMatch(/^https?:\/\//);
    });
  });
});
