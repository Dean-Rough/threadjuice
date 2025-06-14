import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database query helpers
export async function getPosts(params: {
  page: number;
  limit: number;
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  featured?: boolean;
  sortBy:
    | 'created_at'
    | 'updated_at'
    | 'view_count'
    | 'share_count'
    | 'trending_score';
  sortOrder: 'asc' | 'desc';
  search?: string;
}) {
  const page = params.page;
  const limit = params.limit;
  const offset = (page - 1) * limit;

  let query = supabase.from('posts').select(
    `
      *,
      persona:personas(*),
      category:categories(*)
    `,
    { count: 'exact' }
  );

  // Apply filters
  if (params.status) {
    query = query.eq('status', params.status);
  } else {
    query = query.eq('status', 'published');
  }

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.featured !== undefined) {
    query = query.eq('featured', params.featured);
  }

  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,hook.ilike.%${params.search}%`
    );
  }

  const { data, error, count } = await query
    .order(params.sortBy, { ascending: params.sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    posts: data || [],
    total: count || 0,
  };
}

export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      persona:personas(*),
      category:categories(*),
      comments(*),
      images(*),
      quiz:quizzes(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      persona:personas(*),
      category:categories(*),
      comments(*),
      images(*),
      quiz:quizzes(*)
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) throw error;
  return data;
}

export async function getPostsByCategory(category: string, limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      persona:personas(*),
      category:categories(*)
    `
    )
    .eq('category', category)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getFeaturedPosts(limit = 5) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      persona:personas(*),
      category:categories(*)
    `
    )
    .eq('featured', true)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getTrendingPosts(limit = 10) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      persona:personas(*),
      category:categories(*)
    `
    )
    .eq('status', 'published')
    .order('trending_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function createPost(
  post: Database['public']['Tables']['posts']['Insert']
) {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(
  id: string,
  updates: Partial<Database['public']['Tables']['posts']['Update']>
) {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string) {
  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);

  if (error) throw error;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getPersonas() {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('id');

  if (error) throw error;
  return data || [];
}

export async function incrementViewCount(postId: string) {
  const { error } = await supabase.rpc('increment_view_count', {
    post_id: postId,
  });

  if (error) throw error;
}

export async function incrementShareCount(postId: string) {
  const { error } = await supabase.rpc('increment_share_count', {
    post_id: postId,
  });

  if (error) throw error;
}
