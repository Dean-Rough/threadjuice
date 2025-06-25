#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^[\"']|[\"']$/g, '');
      }
    });
  } catch (error) {
    console.error('Error loading .env.local:', error.message);
  }
}

loadEnvVars();

async function clearAllStories() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('🗑️  Clearing all stories from database...\n');

  // First, get count
  const { count: totalCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  console.log(`Found ${totalCount} stories to delete`);

  // Delete all posts by selecting and deleting them
  const { data: posts } = await supabase.from('posts').select('id');

  if (posts && posts.length > 0) {
    // Delete in batches
    const batchSize = 100;
    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      const ids = batch.map(p => p.id);

      const { error } = await supabase.from('posts').delete().in('id', ids);

      if (error) {
        console.error('❌ Error deleting batch:', error.message);
        return;
      }

      console.log(
        `Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(posts.length / batchSize)}`
      );
    }
  }

  console.log(`✅ Successfully deleted all stories from the database`);
}

clearAllStories();
