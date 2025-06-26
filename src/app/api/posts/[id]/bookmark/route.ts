import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // First get current values
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('bookmark_count, trending_score')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      throw new Error('Post not found');
    }

    // Update bookmark count
    const { data, error } = await supabase
      .from('posts')
      .update({
        bookmark_count: post.bookmark_count + 1,
        trending_score: post.trending_score + 2, // Bookmarks show interest
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bookmark count:', error);
      return NextResponse.json(
        { error: 'Failed to update bookmark count' },
        { status: 500 }
      );
    }

    // Track interaction
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('user_interactions').insert({
      post_id: postId,
      interaction_type: 'bookmark',
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      bookmarkCount: data.bookmark_count,
      trendingScore: data.trending_score,
    });

  } catch (error) {
    console.error('Error processing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to process bookmark' },
      { status: 500 }
    );
  }
}