import { NextRequest, NextResponse } from 'next/server.js';
import { getSupabaseClient } from '@/lib/database';
import { normalizeContent } from '@/lib/contentAdapter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetching post with ID/slug

    // Try to fetch by ID first (UUID), then by slug
    let query = getSupabaseClient().from('posts').select(`
        *,
        personas (
          id,
          name,
          avatar_url,
          tone
        )
      `);

    // Check if it's a UUID
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      // Assume it's a slug
      query = query.eq('slug', id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      // Post not found
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Found post

    // Transform to match expected format
    const transformedPost = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.hook,
      imageUrl: data.featured_image,
      category: data.category,
      author: data.personas?.name || 'The Terry',
      viewCount: data.view_count,
      upvoteCount: Math.floor(data.view_count * 0.08),
      commentCount: Math.floor(data.view_count * 0.03),
      shareCount: data.share_count,
      bookmarkCount: Math.floor(data.view_count * 0.05),
      trending: data.trending_score >= 50,
      featured: data.featured,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      content: normalizeContent(data.content),
      persona: {
        name: data.personas?.name || 'The Terry',
        avatar:
          data.personas?.avatar_url || '/assets/img/personas/the-terry.svg',
        bio: data.personas?.tone || 'Acerbic wit and social commentary',
      },
      readingTime: Math.ceil(
        (Array.isArray(data.content) ? data.content.length : 8) * 0.5
      ),
      tags: ['viral', data.category.toLowerCase().replace(/\s+/g, '-')],
    };

    return NextResponse.json(transformedPost, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
