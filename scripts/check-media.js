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
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (error) {
    console.error('Error loading .env.local:', error.message);
  }
}

loadEnvVars();

async function checkMediaInStories() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('🔍 Checking stories for media embeds...\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching posts:', error.message);
    return;
  }

  let totalMediaEmbeds = 0;

  posts.forEach((post, index) => {
    const content =
      typeof post.content === 'string'
        ? JSON.parse(post.content)
        : post.content;
    const sections = content.sections || [];

    let mediaCount = 0;
    let mediaTypes = [];

    sections.forEach(section => {
      if (section.type === 'media_embed' && section.metadata?.media) {
        mediaCount++;
        mediaTypes.push(section.metadata.media.type);
      }
    });

    if (mediaCount > 0) {
      console.log(`📺 Story ${index + 1}: "${post.title}"`);
      console.log(`   Media embeds: ${mediaCount} (${mediaTypes.join(', ')})`);
      totalMediaEmbeds += mediaCount;
    }
  });

  console.log(
    `\n📊 Total media embeds across ${posts.length} stories: ${totalMediaEmbeds}`
  );
}

checkMediaInStories();
