import { createClient } from '@supabase/supabase-js';
import { Post } from '@/types';
import { env } from './env';

// Use environment configuration with test fallbacks
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client with error handling
let supabase: any;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.warn(
    '⚠️ Supabase client initialization failed, using mock client for tests'
  );

  // Mock Supabase client for test environment
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({
            range: () => Promise.resolve({ data: [], error: null, count: 0 }),
          }),
        }),
        order: () => ({
          range: () => Promise.resolve({ data: [], error: null, count: 0 }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }

  return data as Post;
}

export default supabase;
