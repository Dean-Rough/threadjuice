import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getPostById, updatePost, deletePost } from '@/lib/database';
import { UpdatePostSchema, validateRequestBody } from '@/lib/validations';
import type { UpdatePostInput } from '@/lib/validations';

// GET /api/posts/[id] - Fetch a single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Fetch post from database
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post (requires authentication)
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

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Check if post exists and get current data
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user owns the post (only post author can update)
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only update your own posts' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData: UpdatePostInput = validateRequestBody(
      UpdatePostSchema,
      {
        ...body,
        id, // Ensure ID matches route parameter
      }
    );

    // Update post in database
    const updatedPost = await updatePost(id, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    console.error('PUT /api/posts/[id] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid post data',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post (requires authentication)
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

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user owns the post (only post author can delete)
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete post from database
    await deletePost(id);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
