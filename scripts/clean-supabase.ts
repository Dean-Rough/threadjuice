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

async function cleanSupabase() {
  console.log('🧹 Cleaning Supabase database...\n');

  // First, let's see what's in there
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, title, created_at')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('Error fetching posts:', fetchError);
    return;
  }

  console.log(`Found ${posts?.length || 0} posts in Supabase:\n`);
  
  posts?.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title.substring(0, 60)}...`);
    console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`);
  });

  if (!posts || posts.length === 0) {
    console.log('No posts to delete.');
    return;
  }

  console.log('\n⚠️  Deleting ALL posts from Supabase...\n');

  // Delete all posts
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)

  if (deleteError) {
    console.error('Error deleting posts:', deleteError);
    return;
  }

  console.log(`✅ Successfully deleted all posts from Supabase`);
  
  // Verify deletion
  const { data: remaining, error: verifyError } = await supabase
    .from('posts')
    .select('id')
    .limit(1);

  if (!verifyError) {
    console.log(`\n📊 Remaining posts: ${remaining?.length || 0}`);
  }
}

cleanSupabase().catch(console.error);