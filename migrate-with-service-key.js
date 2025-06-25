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

// You need to get the service role key from Supabase Dashboard
// Go to: Project Settings -> API -> service_role key (secret)
console.log('🔑 Need service role key for RLS bypass');
console.log(
  `📋 Get it from: ${supabaseUrl}/project/okugoocdornbiwwykube/settings/api`
);
console.log('🚨 Service role key has admin access - handle with care');

// For now, let's try a different approach - creating posts via SQL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n🔄 ThreadJuice Migration Tool (SQL Approach)');
console.log('===============================================');

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

async function generateMigrationSQL() {
  try {
    const stories = await loadGeneratedStories();

    console.log('\n🛠️  Generating SQL migration script...');

    let sql = `-- ThreadJuice Stories Migration
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Insert stories
`;

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(
        `📝 Processing story ${i + 1}/${stories.length}: "${story.title}"`
      );

      // Escape single quotes in content
      const title = story.title.replace(/'/g, "''");
      const slug = story.slug.replace(/'/g, "''");
      const hook = (story.excerpt || story.title).replace(/'/g, "''");
      const content = JSON.stringify(story.content).replace(/'/g, "''");
      const category = story.category?.replace(/'/g, "''") || 'General';
      const featuredImage = story.imageUrl?.replace(/'/g, "''") || '';

      sql += `
INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  '${title}',
  '${slug}',
  '${hook}',
  '${content}',
  '${category}',
  ${story.featured || false},
  ${Math.floor(story.viral_score || 0)},
  ${story.viewCount || 0},
  ${story.shareCount || 0},
  '${featuredImage}',
  'published',
  '${story.createdAt || new Date().toISOString()}',
  '${story.updatedAt || new Date().toISOString()}'
);
`;
    }

    sql += `
-- Re-enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Verify migration
SELECT COUNT(*) as total_posts FROM posts;
SELECT title, slug, category FROM posts ORDER BY created_at DESC;
`;

    // Write SQL file
    const fs = await import('fs');
    fs.writeFileSync('migration.sql', sql);

    console.log('\n✅ SQL migration script generated: migration.sql');
    console.log('📋 Next steps:');
    console.log('   1. Copy contents of migration.sql');
    console.log(`   2. Go to: ${supabaseUrl}/project/okugoocdornbiwwykube/sql`);
    console.log('   3. Paste and execute the SQL');
    console.log('   4. Verify stories are imported');
  } catch (error) {
    console.error('❌ Failed to generate migration SQL:', error.message);
    process.exit(1);
  }
}

generateMigrationSQL();
