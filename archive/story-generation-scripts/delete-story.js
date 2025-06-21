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

async function deleteStoryById(storyId) {
  try {
    console.log(`🗑️  Deleting story with ID: ${storyId}`);
    
    // First check if the story exists
    const { data: checkData, error: checkError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('id', storyId);
    
    if (checkError) {
      console.error('❌ Check failed:', checkError);
      return;
    }
    
    if (!checkData || checkData.length === 0) {
      console.log('⚠️  No story found with that ID');
      return;
    }
    
    console.log(`📰 Found story: ${checkData[0].title}`);
    
    // Now delete it
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', storyId)
      .select();
    
    if (error) {
      console.error('❌ Delete failed:', error);
      return;
    }
    
    console.log('✅ Story deleted successfully!');
    console.log(`📰 Deleted: ${checkData[0].title}`);
    
  } catch (error) {
    console.error('❌ Delete failed:', error.message);
  }
}

// Get story ID from command line
const storyId = process.argv[2];
if (!storyId) {
  console.error('Usage: node delete-story.js <story-id>');
  process.exit(1);
}

deleteStoryById(storyId);