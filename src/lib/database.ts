import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post } from '@/types';

// Lazy initialization of Supabase client
let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not configured');
      throw new Error('Supabase configuration missing');
    }
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }

    return data as Post;
  } catch (e) {
    console.error('Database connection error:', e);
    return null;
  }
}

// Export getter function instead of direct client
export { getSupabaseClient };
export default getSupabaseClient;
