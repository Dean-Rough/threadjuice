import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { updatePostSchema, validateRequestBody } from '@/lib/validations';

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/posts/[id] - Get a single post by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format', message: 'Post ID must be a valid UUID' },
        { status: 400 }
      );
    }

    // Fetch post with related data
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        personas (
          id,
          name,
          bio,
          avatar_url,
          tone,
          specialties
        )
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Not found', message: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('posts')
      .update({ 
        view_count: (post.view_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        view_count: (post.view_count || 0) + 1,
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
 * PUT /api/posts/[id] - Update a post (requires authentication and ownership)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format', message: 'Post ID must be a valid UUID' },
        { status: 400 }
      );
    }

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Not found', message: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only update your own posts' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(updatePostSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', message: validation.error },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // If persona_id is being updated, check if it exists
    if (updateData.persona_id) {
      const { data: persona, error: personaError } = await supabase
        .from('personas')
        .select('id')
        .eq('id', updateData.persona_id)
        .single();

      if (personaError || !persona) {
        return NextResponse.json(
          { error: 'Invalid persona', message: 'Persona not found' },
          { status: 400 }
        );
      }
    }

    // Update slug if title is being updated
    let slug;
    if (updateData.title) {
      slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 100);
    }

    // Update post
    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update({
        ...updateData,
        ...(slug && { slug }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
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
 * DELETE /api/posts/[id] - Delete a post (requires authentication and ownership)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format', message: 'Post ID must be a valid UUID' },
        { status: 400 }
      );
    }

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Not found', message: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
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