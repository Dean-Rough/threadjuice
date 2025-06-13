import fs from 'fs';
import path from 'path';

describe('Database Integration', () => {
  const projectRoot = process.cwd();

  describe('Required Files Exist', () => {
    it('should have database schema file', () => {
      const schemaPath = path.join(projectRoot, 'database', 'schema.sql');
      expect(fs.existsSync(schemaPath)).toBe(true);
      
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      expect(schemaContent).toContain('CREATE TABLE posts');
      expect(schemaContent).toContain('CREATE TABLE personas');
      expect(schemaContent).toContain('CREATE TABLE categories');
      expect(schemaContent).toContain('CREATE TABLE comments');
    });

    it('should have database seed file', () => {
      const seedPath = path.join(projectRoot, 'database', 'seed.sql');
      expect(fs.existsSync(seedPath)).toBe(true);
      
      const seedContent = fs.readFileSync(seedPath, 'utf-8');
      expect(seedContent).toContain('INSERT INTO personas');
      expect(seedContent).toContain('The Snarky Sage');
      expect(seedContent).toContain('The Down-to-Earth Buddy');
      expect(seedContent).toContain('The Dry Cynic');
    });

    it('should have database client configuration', () => {
      const dbPath = path.join(projectRoot, 'src', 'lib', 'database.ts');
      expect(fs.existsSync(dbPath)).toBe(true);
      
      const dbContent = fs.readFileSync(dbPath, 'utf-8');
      expect(dbContent).toContain('createClient');
      expect(dbContent).toContain('supabase');
      expect(dbContent).toContain('Database');
    });

    it('should have TypeScript database types', () => {
      const typesPath = path.join(projectRoot, 'src', 'types', 'database.ts');
      expect(fs.existsSync(typesPath)).toBe(true);
      
      const typesContent = fs.readFileSync(typesPath, 'utf-8');
      expect(typesContent).toContain('export interface Database');
      expect(typesContent).toContain('Tables');
      expect(typesContent).toContain('posts');
      expect(typesContent).toContain('personas');
    });

    it('should have environment configuration', () => {
      const envPath = path.join(projectRoot, 'src', 'lib', 'env.ts');
      expect(fs.existsSync(envPath)).toBe(true);
      
      const envContent = fs.readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('SUPABASE_URL');
      expect(envContent).toContain('SUPABASE_ANON_KEY');
      expect(envContent).toContain('zod');
    });

    it('should have .env.example file', () => {
      const envExamplePath = path.join(projectRoot, '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
      
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      expect(envContent).toContain('SUPABASE_URL');
      expect(envContent).toContain('SUPABASE_ANON_KEY');
      expect(envContent).toContain('SUPABASE_SERVICE_ROLE_KEY');
    });
  });

  describe('Package Dependencies', () => {
    it('should have required Supabase dependencies', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);
      
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      expect(packageContent.dependencies).toHaveProperty('@supabase/supabase-js');
      expect(packageContent.dependencies).toHaveProperty('zod');
      expect(packageContent.devDependencies).toHaveProperty('supabase');
    });

    it('should have correct dependency versions', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      const supabaseVersion = packageContent.dependencies['@supabase/supabase-js'];
      const zodVersion = packageContent.dependencies['zod'];
      
      expect(supabaseVersion).toMatch(/^\^2\./); // Version 2.x
      expect(zodVersion).toMatch(/^\^3\./); // Version 3.x
    });
  });

  describe('Database Schema Validation', () => {
    it('should have proper table structure in schema', () => {
      const schemaPath = path.join(projectRoot, 'database', 'schema.sql');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      // Check for essential tables
      const requiredTables = [
        'posts',
        'personas', 
        'categories',
        'comments',
        'images',
        'quizzes',
        'quiz_responses',
        'events',
        'user_interactions'
      ];

      requiredTables.forEach(table => {
        expect(schemaContent).toContain(`CREATE TABLE ${table}`);
      });
    });

    it('should have proper indexes for performance', () => {
      const schemaPath = path.join(projectRoot, 'database', 'schema.sql');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      const expectedIndexes = [
        'idx_posts_status',
        'idx_posts_created_at',
        'idx_posts_trending_score',
        'idx_comments_post_id'
      ];

      expectedIndexes.forEach(index => {
        expect(schemaContent).toContain(index);
      });
    });

    it('should have Row Level Security policies', () => {
      const schemaPath = path.join(projectRoot, 'database', 'schema.sql');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      expect(schemaContent).toContain('ALTER TABLE');
      expect(schemaContent).toContain('ENABLE ROW LEVEL SECURITY');
      expect(schemaContent).toContain('CREATE POLICY');
    });

    it('should have database functions', () => {
      const schemaPath = path.join(projectRoot, 'database', 'schema.sql');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      const expectedFunctions = [
        'increment_view_count',
        'increment_share_count',
        'update_category_post_count'
      ];

      expectedFunctions.forEach(func => {
        expect(schemaContent).toContain(func);
      });
    });
  });

  describe('Seed Data Validation', () => {
    it('should have all required personas', () => {
      const seedPath = path.join(projectRoot, 'database', 'seed.sql');
      const seedContent = fs.readFileSync(seedPath, 'utf-8');

      const requiredPersonas = [
        'The Snarky Sage',
        'The Down-to-Earth Buddy', 
        'The Dry Cynic'
      ];

      requiredPersonas.forEach(persona => {
        expect(seedContent).toContain(persona);
      });
    });

    it('should have essential categories', () => {
      const seedPath = path.join(projectRoot, 'database', 'seed.sql');
      const seedContent = fs.readFileSync(seedPath, 'utf-8');

      const requiredCategories = [
        'TIFU',
        'AITA',
        'Public Freakouts'
      ];

      requiredCategories.forEach(category => {
        expect(seedContent).toContain(category);
      });
    });

    it('should have sample posts for testing', () => {
      const seedPath = path.join(projectRoot, 'database', 'seed.sql');
      const seedContent = fs.readFileSync(seedPath, 'utf-8');

      expect(seedContent).toContain('INSERT INTO posts');
      expect(seedContent).toContain('published');
    });
  });

  describe('TypeScript Integration', () => {
    it('should export proper database types', () => {
      const typesPath = path.join(projectRoot, 'src', 'types', 'database.ts');
      const typesContent = fs.readFileSync(typesPath, 'utf-8');

      expect(typesContent).toContain('export interface Database');
      expect(typesContent).toContain('export type Json');
      expect(typesContent).toContain('Tables');
      expect(typesContent).toContain('Insert');
      expect(typesContent).toContain('Update');
      expect(typesContent).toContain('Row');
    });

    it('should have consistent naming between schema and types', () => {
      const schemaPath = path.join(projectRoot, 'database', 'schema.sql');
      const typesPath = path.join(projectRoot, 'src', 'types', 'database.ts');
      
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      const typesContent = fs.readFileSync(typesPath, 'utf-8');

      // Extract table names from schema
      const tableMatches = schemaContent.match(/CREATE TABLE (\w+)/g);
      const tableNames = tableMatches?.map(match => match.replace('CREATE TABLE ', '')) || [];

      // Verify each table exists in types
      tableNames.forEach(tableName => {
        expect(typesContent).toContain(tableName);
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should have all required environment variables in example', () => {
      const envExamplePath = path.join(projectRoot, '.env.example');
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');

      const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'CLERK_SECRET_KEY',
        'CLERK_PUBLISHABLE_KEY',
        'OPENAI_API_KEY',
        'REDDIT_CLIENT_ID',
        'REDDIT_CLIENT_SECRET'
      ];

      requiredVars.forEach(varName => {
        expect(envContent).toContain(varName);
      });
    });

    it('should have proper environment validation', () => {
      const envPath = path.join(projectRoot, 'src', 'lib', 'env.ts');
      const envContent = fs.readFileSync(envPath, 'utf-8');

      expect(envContent).toContain('z.object');
      expect(envContent).toContain('parse');
      expect(envContent).toContain('SUPABASE_URL');
    });
  });

  describe('File Structure Compliance', () => {
    it('should have proper database directory structure', () => {
      const dbDir = path.join(projectRoot, 'database');
      expect(fs.existsSync(dbDir)).toBe(true);
      expect(fs.statSync(dbDir).isDirectory()).toBe(true);
    });

    it('should have proper lib directory structure', () => {
      const libDir = path.join(projectRoot, 'src', 'lib');
      expect(fs.existsSync(libDir)).toBe(true);
      expect(fs.statSync(libDir).isDirectory()).toBe(true);
    });

    it('should have proper types directory structure', () => {
      const typesDir = path.join(projectRoot, 'src', 'types');
      expect(fs.existsSync(typesDir)).toBe(true);
      expect(fs.statSync(typesDir).isDirectory()).toBe(true);
    });
  });
});