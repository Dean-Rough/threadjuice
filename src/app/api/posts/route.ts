import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { createPostSchema, postQuerySchema, validateRequestBody, validateQueryParams } from '@/lib/validations';

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/posts - List posts with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = validateQueryParams(postQuerySchema as any, Object.fromEntries(searchParams));
    
    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', message: queryValidation.error },
        { status: 400 }
      );
    }

    const { page, limit, category, persona_id, published, search } = queryValidation.data as any;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        personas (
          id,
          name,
          avatar_url,
          tone
        )
      `, { count: 'exact' });

    // Apply filters
    if (category) query = query.eq('category', category);
    if (persona_id) query = query.eq('persona_id', persona_id);
    if (published !== undefined) query = query.eq('published', published);
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts - Create a new post (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(createPostSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', message: validation.error },
        { status: 400 }
      );
    }

    const postData = validation.data;

    // Check if persona exists
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('id')
      .eq('id', postData.persona_id)
      .single();

    if (personaError || !persona) {
      return NextResponse.json(
        { error: 'Invalid persona', message: 'Persona not found' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    // Create post
    const { data: post, error: createError } = await supabase
      .from('posts')
      .insert({
        ...postData,
        slug,
        author_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        personas (
          id,
          name,
          avatar_url,
          tone
        )
      `)
      .single();

    if (createError) {
      console.error('Database error:', createError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}