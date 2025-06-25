#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !key.startsWith('#')) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearPosts() {
  console.log('🗑️  Clearing all posts from Supabase...');
  console.log(`🔗 Connecting to: ${supabaseUrl}`);
  console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);

  try {
    // First, let's see what's in there (get ALL posts)
    const { data: existingPosts, error: selectError } = await supabase
      .from('posts')
      .select('id, title');

    if (selectError) {
      console.error('❌ Error reading posts:', selectError.message);
      return;
    }

    console.log(`📊 Found ${existingPosts.length} posts in database:`);
    existingPosts.forEach(post => console.log(`  - ${post.title}`));

    // Try to delete posts one by one (in case RLS is blocking bulk deletion)
    let deletedCount = 0;
    for (const post of existingPosts) {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (deleteError) {
        console.log(
          `❌ Failed to delete "${post.title}": ${deleteError.message}`
        );
      } else {
        deletedCount++;
        console.log(`✅ Deleted: ${post.title}`);
      }
    }

    console.log(
      `✅ Successfully deleted ${deletedCount} out of ${existingPosts.length} posts from database!`
    );

    // Verify deletion
    const { data: remainingPosts, error: verifyError } = await supabase
      .from('posts')
      .select('id');

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError.message);
      return;
    }

    console.log(`📈 Remaining posts: ${remainingPosts.length}`);
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

clearPosts();
