import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createPost, getPosts } from '@/lib/database';
import {
  CreatePostSchema,
  PostQuerySchema,
  validateRequestBody,
} from '@/lib/validations';
import type { CreatePostInput, PostQueryInput } from '@/lib/validations';

// GET /api/posts - Fetch posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters with defaults applied
    const validatedQuery = PostQuerySchema.parse(queryParams);

    // Fetch posts from database
    const result = await getPosts(validatedQuery);

    return NextResponse.json({
      items: result.posts,
      meta: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / validatedQuery.limit),
      },
    });
  } catch (error) {
    console.error('GET /api/posts error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post (requires authentication)
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
    const validatedData = CreatePostSchema.parse(body);

    // Create post in database
    const postData = {
      ...validatedData,
      author_id: userId,
    };

    const newPost = await createPost(postData);

    return NextResponse.json(
      { success: true, message: 'Post created successfully', data: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/posts error:', error);

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
      { error: 'Internal Server Error', message: 'Failed to create post' },
      { status: 500 }
    );
  }
}
