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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...');

  // Check personas table
  console.log('\n👤 Checking personas table:');
  const { data: personas, error: personasError } = await supabase
    .from('personas')
    .select('*');
  if (personasError) {
    console.error('❌ Personas error:', personasError.message);
  } else {
    console.log(`✅ Found ${personas.length} personas:`);
    personas.forEach(p => console.log(`  - ${p.name} (${p.slug})`));
  }

  // Check posts table structure
  console.log('\n📝 Checking posts table structure:');
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, persona_id')
    .limit(3);
  if (postsError) {
    console.error('❌ Posts error:', postsError.message);
  } else {
    console.log(`✅ Found ${posts.length} posts:`);
    posts.forEach(p =>
      console.log(`  - "${p.title}" (persona_id: ${p.persona_id})`)
    );
  }
}

testSupabase();
