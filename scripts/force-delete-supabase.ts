import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceDelete() {
  console.log('🔥 Force deleting ALL posts from Supabase...\n');

  // First get all post IDs
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, title');

  if (fetchError) {
    console.error('Error fetching posts:', fetchError);
    return;
  }

  console.log(`Found ${posts?.length || 0} posts to delete\n`);

  if (!posts || posts.length === 0) {
    console.log('No posts to delete.');
    return;
  }

  // Delete each post individually
  let deleted = 0;
  for (const post of posts) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      console.error(`Failed to delete "${post.title}":`, error.message);
    } else {
      deleted++;
      console.log(`✅ Deleted: ${post.title.substring(0, 60)}...`);
    }
  }

  console.log(`\n📊 Successfully deleted ${deleted} out of ${posts.length} posts`);
  
  // Verify deletion
  const { data: remaining } = await supabase
    .from('posts')
    .select('id');

  console.log(`📊 Remaining posts: ${remaining?.length || 0}`);
}

forceDelete().catch(console.error);