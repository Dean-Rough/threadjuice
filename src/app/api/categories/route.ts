import { NextRequest, NextResponse } from 'next/server.js';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get distinct categories from posts with counts since Category table is empty
    const categories = await prisma.post.groupBy({
      by: ['category'],
      where: {
        status: 'published',
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const transformedCategories = categories.map(category => ({
      name:
        category.category.charAt(0).toUpperCase() + category.category.slice(1),
      slug: category.category,
      post_count: category._count.id,
    }));

    return NextResponse.json({
      categories: transformedCategories,
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
