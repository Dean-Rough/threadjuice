import { NextResponse } from 'next/server.js';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        persona: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        persona: post.persona?.name,
        category: post.category,
        status: post.status,
        createdAt: post.createdAt,
        url: `/posts/${post.slug}`,
      })),
    });
  } catch (error) {
    console.error('Simple posts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error.message },
      { status: 500 }
    );
  }
}
