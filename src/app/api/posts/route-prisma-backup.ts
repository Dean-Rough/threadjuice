import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const PostQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(50))
    .optional(),
  category: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  trending: z
    .string()
    .nullable()
    .transform(val => val === 'true')
    .optional(),
  featured: z
    .string()
    .nullable()
    .transform(val => val === 'true')
    .optional(),
  search: z.string().nullable().optional(),
  sortBy: z
    .enum(['views', 'shares', 'comments', 'latest', 'trending'])
    .nullable()
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Validate query parameters
    const result = PostQuerySchema.safeParse(queryParams);
    if (!result.success) {
      return NextResponse.json(
        { error: 'INVALID_QUERY', details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      page = 1,
      limit = 12,
      category,
      author,
      trending,
      featured,
      search,
      sortBy = 'latest',
    } = result.data;

    // Build where clause
    const where: any = {
      status: 'published',
    };

    if (category) {
      where.category = category;
    }

    if (author) {
      where.author = author;
    }

    if (trending === true) {
      where.trending = true;
    }

    if (featured === true) {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'shares':
        orderBy = { shareCount: 'desc' };
        break;
      case 'comments':
        orderBy = { commentCount: 'desc' };
        break;
      case 'trending':
        orderBy = { viewCount: 'desc' }; // or trending score if available
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Get total count for pagination
    const total = await prisma.post.count({ where });

    // Get posts with pagination
    const skip = (page - 1) * limit;
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        persona: true,
      },
    });

    // Transform posts to API format
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
      category: post.category,
      author: post.author,
      viewCount: post.viewCount || 0,
      upvoteCount: post.upvoteCount || 0,
      commentCount: post.commentCount || 0,
      shareCount: post.shareCount || 0,
      bookmarkCount: post.bookmarkCount || 0,
      trending: post.trending || false,
      featured: post.featured || false,
      status: post.status || 'published',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      readingTime: post.readingTime || 5,
      persona: post.persona ? {
        name: post.persona.name,
        avatar: post.persona.avatarUrl,
        bio: post.persona.bio
      } : {
        name: post.author || 'The Terry',
        avatar: '/assets/img/personas/the-terry.svg',
        bio: 'Acerbic wit and social commentary'
      }
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      posts: transformedPosts,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        source: 'prisma-local',
      },
    });

  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch posts',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}

// POST endpoint for creating new posts (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'slug', 'content', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: 'MISSING_FIELD', field },
          { status: 400 }
        );
      }
    }

    // Create post in local database
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || body.title,
        content: body.content,
        category: body.category,
        author: body.author || 'The Terry',
        imageUrl: body.imageUrl,
        featured: body.featured || false,
        trending: body.trending || false,
        viewCount: 0,
        shareCount: 0,
        commentCount: 0,
        upvoteCount: 0,
        bookmarkCount: 0,
        status: 'published',
        personaId: body.personaId || 1, // Default to first persona
      },
    });

    return NextResponse.json({ post }, { status: 201 });

  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Failed to create post' },
      { status: 500 }
    );
  }
}