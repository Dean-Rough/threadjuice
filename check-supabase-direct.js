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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📋 Current posts in Supabase:');
    data.forEach(post => {
      console.log(`- ${post.id}: ${post.title}`);
    });
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkPosts();
