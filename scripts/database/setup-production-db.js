#!/usr/bin/env node

/**
 * ThreadJuice Production Database Setup
 * 
 * This script:
 * 1. Checks Supabase connection
 * 2. Creates database schema
 * 3. Migrates data from SQLite if exists
 * 4. Seeds with initial data if empty
 * 5. Verifies everything is working
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset}  ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset}  ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
};

// Check environment variables
function checkEnvironment() {
  log.header('Checking Environment Variables');
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log.error(`Missing required environment variables:`);
    missing.forEach(key => log.error(`  - ${key}`));
    log.info('\nPlease set these in your .env.local file');
    process.exit(1);
  }
  
  log.success('All required environment variables found');
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

// Initialize Supabase admin client
function initSupabase(config) {
  try {
    const supabase = createClient(config.url, config.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    log.success('Supabase client initialized');
    return supabase;
  } catch (error) {
    log.error(`Failed to initialize Supabase: ${error.message}`);
    process.exit(1);
  }
}

// Test database connection
async function testConnection(supabase) {
  log.header('Testing Database Connection');
  
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      log.warn('Posts table does not exist yet (this is normal for first setup)');
      return false;
    } else if (error) {
      throw error;
    }
    
    log.success('Database connection successful');
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    log.info('\nPossible issues:');
    log.info('1. Check if your Supabase project is active');
    log.info('2. Verify your service role key is correct');
    log.info('3. Ensure your project URL is correct');
    process.exit(1);
  }
}

// Create database schema
async function createSchema(supabase) {
  log.header('Creating Database Schema');
  
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    log.error('Schema file not found at database/schema.sql');
    process.exit(1);
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  try {
    // Execute the schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      // If RPC doesn't exist, provide manual instructions
      if (error.code === '42883') {
        log.warn('Automated schema creation not available');
        log.info('\nPlease create the schema manually:');
        log.info('1. Go to your Supabase Dashboard');
        log.info('2. Navigate to SQL Editor');
        log.info('3. Copy and paste the contents of database/schema.sql');
        log.info('4. Execute the SQL');
        log.info('5. Run this script again');
        return false;
      }
      throw error;
    }
    
    log.success('Database schema created successfully');
    return true;
  } catch (error) {
    log.error(`Schema creation failed: ${error.message}`);
    return false;
  }
}

// Check if SQLite database exists
function checkSQLiteDatabase() {
  const dbPath = path.join(__dirname, '../../prisma/dev.db');
  return fs.existsSync(dbPath);
}

// Migrate data from SQLite
async function migrateFromSQLite(supabase) {
  log.header('Migrating Data from SQLite');
  
  if (!checkSQLiteDatabase()) {
    log.info('No SQLite database found, skipping migration');
    return;
  }
  
  try {
    // Initialize Prisma client for SQLite
    const prisma = new PrismaClient({
      datasourceUrl: 'file:./prisma/dev.db'
    });
    
    // Get counts
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    
    log.info(`Found ${postCount} posts and ${commentCount} comments to migrate`);
    
    if (postCount === 0) {
      log.info('No data to migrate');
      await prisma.$disconnect();
      return;
    }
    
    // Migrate posts with all relations
    const posts = await prisma.post.findMany({
      include: {
        persona: true,
        comments: true,
        images: true,
        interactions: true,
      },
    });
    
    // Migrate in batches
    for (const post of posts) {
      // Insert post
      const { error: postError } = await supabase
        .from('posts')
        .upsert({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          image_url: post.imageUrl,
          category: post.category,
          author: post.author,
          persona_id: post.personaId,
          status: post.status,
          view_count: post.viewCount,
          upvote_count: post.upvoteCount,
          comment_count: post.commentCount,
          share_count: post.shareCount,
          bookmark_count: post.bookmarkCount,
          trending: post.trending,
          featured: post.featured,
          reddit_thread_id: post.redditThreadId,
          subreddit: post.subreddit,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
        });
      
      if (postError) {
        log.warn(`Failed to migrate post ${post.slug}: ${postError.message}`);
        continue;
      }
      
      // Migrate images
      if (post.images.length > 0) {
        const { error: imageError } = await supabase
          .from('images')
          .upsert(
            post.images.map(img => ({
              id: img.id,
              post_id: img.postId,
              url: img.url,
              alt_text: img.altText,
              caption: img.caption,
              license_type: img.licenseType,
              author: img.author,
              source_name: img.sourceName,
              source_url: img.sourceUrl,
              width: img.width,
              height: img.height,
              file_size: img.fileSize,
              position: img.position,
              created_at: img.createdAt,
            }))
          );
        
        if (imageError) {
          log.warn(`Failed to migrate images for ${post.slug}`);
        }
      }
      
      // Migrate comments
      if (post.comments.length > 0) {
        const { error: commentError } = await supabase
          .from('comments')
          .upsert(
            post.comments.map(comment => ({
              id: comment.id,
              post_id: comment.postId,
              parent_id: comment.parentId,
              user_id: comment.userId,
              author_name: comment.authorName,
              content: comment.content,
              upvote_count: comment.upvoteCount,
              downvote_count: comment.downvoteCount,
              is_reddit_excerpt: comment.isRedditExcerpt,
              reddit_comment_id: comment.redditCommentId,
              reddit_score: comment.redditScore,
              status: comment.status,
              created_at: comment.createdAt,
              updated_at: comment.updatedAt,
            }))
          );
        
        if (commentError) {
          log.warn(`Failed to migrate comments for ${post.slug}`);
        }
      }
      
      log.success(`Migrated post: ${post.title}`);
    }
    
    await prisma.$disconnect();
    log.success(`Migration completed: ${posts.length} posts migrated`);
    
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
  }
}

// Seed initial data
async function seedInitialData(supabase) {
  log.header('Seeding Initial Data');
  
  // Check if we already have data
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });
  
  if (count > 0) {
    log.info(`Database already contains ${count} posts`);
    return;
  }
  
  // Seed categories
  const categories = [
    { name: 'Family Drama', slug: 'family-drama', color: '#ef4444' },
    { name: 'Work Stories', slug: 'work-stories', color: '#3b82f6' },
    { name: 'Relationship', slug: 'relationship', color: '#ec4899' },
    { name: 'Social Media', slug: 'social-media', color: '#8b5cf6' },
    { name: 'Life Hacks', slug: 'life-hacks', color: '#10b981' },
    { name: 'Viral Trends', slug: 'viral-trends', color: '#f59e0b' },
  ];
  
  const { error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' });
  
  if (catError) {
    log.warn('Failed to seed categories');
  } else {
    log.success('Seeded categories');
  }
  
  // Seed personas
  const personas = [
    {
      name: 'The Storyteller',
      slug: 'the-storyteller',
      avatar_url: '/avatars/storyteller.png',
      tone: 'Engaging and dramatic, with a flair for building suspense',
    },
    {
      name: 'The Analyst',
      slug: 'the-analyst',
      avatar_url: '/avatars/analyst.png',
      tone: 'Thoughtful and insightful, breaking down complex situations',
    },
    {
      name: 'The Comedian',
      slug: 'the-comedian',
      avatar_url: '/avatars/comedian.png',
      tone: 'Witty and irreverent, finding humor in everyday situations',
    },
  ];
  
  const { error: personaError } = await supabase
    .from('personas')
    .upsert(personas, { onConflict: 'slug' });
  
  if (personaError) {
    log.warn('Failed to seed personas');
  } else {
    log.success('Seeded personas');
  }
  
  log.info('Initial data seeding complete');
}

// Verify setup
async function verifySetup(supabase) {
  log.header('Verifying Setup');
  
  try {
    // Check tables exist
    const tables = ['posts', 'comments', 'categories', 'personas', 'images'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        log.error(`Table '${table}' check failed: ${error.message}`);
        return false;
      }
      log.success(`Table '${table}' exists`);
    }
    
    // Get counts
    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    log.info(`\nDatabase contains:`);
    log.info(`- ${postCount || 0} posts`);
    log.info(`- ${categoryCount || 0} categories`);
    
    return true;
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
    return false;
  }
}

// Main setup function
async function main() {
  console.log(`
${colors.bright}ThreadJuice Production Database Setup${colors.reset}
=====================================
`);
  
  // Check environment
  const config = checkEnvironment();
  
  // Initialize Supabase
  const supabase = initSupabase(config);
  
  // Test connection
  const hasSchema = await testConnection(supabase);
  
  // Create schema if needed
  if (!hasSchema) {
    const schemaCreated = await createSchema(supabase);
    if (!schemaCreated) {
      log.warn('\nPlease create the schema manually and run this script again');
      process.exit(0);
    }
  }
  
  // Migrate from SQLite if exists
  await migrateFromSQLite(supabase);
  
  // Seed initial data if empty
  await seedInitialData(supabase);
  
  // Verify everything is working
  const isValid = await verifySetup(supabase);
  
  if (isValid) {
    log.header('✅ Setup Complete!');
    log.info('Your database is ready for production');
    log.info('\nNext steps:');
    log.info('1. Update your API routes to use Supabase');
    log.info('2. Test the application locally');
    log.info('3. Deploy to Vercel');
  } else {
    log.error('\nSetup completed with errors');
    log.info('Please check the errors above and try again');
  }
}

// Run the setup
main().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});