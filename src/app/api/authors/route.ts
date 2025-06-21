import { NextRequest, NextResponse } from 'next/server.js';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authors = await prisma.persona.findMany({
      orderBy: [{ storyCount: 'desc' }, { rating: 'desc' }],
    });

    const transformedAuthors = authors.map(author => ({
      id: author.id,
      name: author.name,
      slug: author.slug,
      bio: author.bio,
      avatar_url: author.avatarUrl,
      tone: author.tone,
      story_count: author.storyCount,
      rating: Number(author.rating),
      created_at: author.createdAt.toISOString(),
    }));

    return NextResponse.json({
      authors: transformedAuthors,
    });
  } catch (error) {
    console.error('Authors API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch authors',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
