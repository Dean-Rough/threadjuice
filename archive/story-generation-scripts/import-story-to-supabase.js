#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function importStoryFromFile(filePath) {
  try {
    console.log(`📂 Reading story from: ${filePath}`);
    
    const fileContent = readFileSync(filePath, 'utf8');
    const story = JSON.parse(fileContent);
    
    console.log(`📰 Title: ${story.title}`);
    console.log(`👤 Author: ${story.author}`);
    
    // Transform to Supabase format
    const supabaseStory = {
      title: story.title,
      slug: story.slug,
      hook: story.excerpt,
      content: story.content,
      category: story.category,
      persona_id: 1, // The Terry's persona ID
      featured: story.featured || false,
      trending_score: story.viral_score ? Math.floor(story.viral_score * 10) : 85,
      view_count: story.viewCount || Math.floor(Math.random() * 5000) + 1000,
      share_count: story.shareCount || Math.floor(Math.random() * 300) + 25,
      featured_image: story.imageUrl,
      status: 'published'
    };
    
    console.log('💾 Saving to Supabase...');
    
    const { data, error } = await supabase
      .from('posts')
      .insert([supabaseStory])
      .select();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }
    
    console.log('✅ Story imported successfully!');
    console.log(`🆔 ID: ${data[0].id}`);
    console.log(`🔗 Slug: ${data[0].slug}`);
    console.log('🌐 View at: http://localhost:4242/blog/' + data[0].slug);
    
    return data[0];
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node import-story-to-supabase.js <path-to-story.json>');
  process.exit(1);
}

importStoryFromFile(filePath);