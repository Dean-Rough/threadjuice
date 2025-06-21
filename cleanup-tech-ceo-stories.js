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

async function deleteTechCeoStories() {
  try {
    console.log('🗑️  Finding and deleting all Tech CEO stories...');
    
    // Find all stories with "Tech CEO" in the title
    const { data: stories, error: findError } = await supabase
      .from('posts')
      .select('id, title')
      .like('title', '%Tech CEO%');
    
    if (findError) {
      console.error('❌ Find failed:', findError);
      return;
    }
    
    if (!stories || stories.length === 0) {
      console.log('✅ No Tech CEO stories found');
      return;
    }
    
    console.log(`📰 Found ${stories.length} Tech CEO stories:`);
    stories.forEach(story => {
      console.log(`- ${story.id}: ${story.title}`);
    });
    
    // Delete all of them
    for (const story of stories) {
      console.log(`\n🗑️  Deleting: ${story.title}`);
      
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', story.id);
      
      if (deleteError) {
        console.error(`❌ Failed to delete ${story.id}:`, deleteError);
      } else {
        console.log(`✅ Deleted: ${story.title}`);
      }
    }
    
    console.log('\n🎉 Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

deleteTechCeoStories();