#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Manually load env vars from .env.local
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

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'SET ✅' : 'MISSING ❌');
console.log('Key:', supabaseAnonKey ? 'SET ✅' : 'MISSING ❌');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📡 Testing database connection...');
    
    // Check if posts table exists
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug')
      .limit(3);
    
    if (error) {
      console.log('❌ Database error:', error.message);
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "posts" does not exist')) {
        console.log('\n🔧 Posts table does not exist. Need to set up schema.');
        return 'no_schema';
      }
      return 'error';
    }
    
    console.log('✅ Posts table accessible!');
    console.log(`📊 Found ${data.length} posts in database:`);
    data.forEach(post => {
      console.log(`   - ${post.title} (${post.slug})`);
    });
    
    return 'success';
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return 'failed';
  }
}

testConnection().then(result => {
  console.log('\n🎯 Result:', result);
  process.exit(result === 'success' ? 0 : 1);
});