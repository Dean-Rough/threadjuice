#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

// Load environment variables
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For migration, we need to bypass RLS. In production you'd use service role key
// For now, let's use anon key and handle the RLS issue
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔄 ThreadJuice Migration Tool');
console.log('==============================');

async function loadGeneratedStories() {
  const storiesDir = 'data/generated-stories';
  const files = readdirSync(storiesDir).filter(file => file.endsWith('.json'));

  const stories = files.map(file => {
    const content = readFileSync(path.join(storiesDir, file), 'utf-8');
    return JSON.parse(content);
  });

  console.log(`📚 Loaded ${stories.length} generated stories`);
  return stories;
}

async function migrateStories() {
  try {
    const stories = await loadGeneratedStories();

    console.log('\n🚀 Starting migration to Supabase...');

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(
        `\n📝 Migrating story ${i + 1}/${stories.length}: "${story.title}"`
      );

      // Transform the story data to match Supabase schema
      const postData = {
        // Generate new UUID for Supabase (old IDs aren't UUID format)
        title: story.title,
        slug: story.slug,
        hook: story.excerpt || story.title,
        content: story.content,
        status: 'published',
        category: story.category,
        featured: story.featured || false,
        trending_score: Math.floor(story.viral_score || 0),
        view_count: story.viewCount || 0,
        share_count: story.shareCount || 0,
        reddit_thread_id: story.redditSource?.threadUrl,
        subreddit: story.redditSource?.subreddit,
        featured_image: story.imageUrl,
        created_at: story.createdAt || new Date().toISOString(),
        updated_at: story.updatedAt || new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select();

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);

        // If it's a table doesn't exist error, provide guidance
        if (error.message.includes('relation "public.posts" does not exist')) {
          console.log('\n🔧 DATABASE SCHEMA NOT SET UP!');
          console.log('📋 Please run the schema setup first:');
          console.log('   1. Go to Supabase Dashboard SQL Editor');
          console.log('   2. Copy contents of database/schema.sql');
          console.log('   3. Execute the SQL');
          console.log('   4. Re-run this migration');
          console.log(
            `🔗 Dashboard: ${supabaseUrl}/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql`
          );
          process.exit(1);
        }

        continue;
      }

      console.log(`   ✅ Success: ${data[0].id}`);
    }

    console.log('\n🎉 Migration complete!');
    console.log(`✅ Migrated ${stories.length} stories to Supabase`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Try to read from posts table
    const { data, error } = await supabase
      .from('posts')
      .select('id, title')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.posts" does not exist')) {
        console.log('⚠️  Posts table does not exist');
        console.log(
          '📋 Schema setup required. Run database/schema.sql in Supabase Dashboard'
        );
        return false;
      }
      console.log('❌ Database error:', error.message);
      return false;
    }

    console.log('✅ Database connected and ready');
    console.log(`📊 Current posts in database: ${data.length}`);
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const isReady = await testConnection();

  if (!isReady) {
    console.log('\n🛠️  Database setup required before migration');
    process.exit(1);
  }

  await migrateStories();
}

main();
