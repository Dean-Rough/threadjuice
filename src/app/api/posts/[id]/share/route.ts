import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // First get current values
    const { data: post, error: fetchError } = await getSupabaseClient()
      .from('posts')
      .select('share_count, trending_score')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      throw new Error('Post not found');
    }

    // Update share count and trending score
    const { data, error } = await getSupabaseClient()
      .from('posts')
      .update({
        share_count: post.share_count + 1,
        trending_score: post.trending_score + 5, // Shares worth more
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Error updating share count:', error);
      return NextResponse.json(
        { error: 'Failed to update share count' },
        { status: 500 }
      );
    }

    // Track interaction
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await getSupabaseClient().from('user_interactions').insert({
      post_id: postId,
      interaction_type: 'share',
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      shareCount: data.share_count,
      trendingScore: data.trending_score,
    });

  } catch (error) {
    console.error('Error processing share:', error);
    return NextResponse.json(
      { error: 'Failed to process share' },
      { status: 500 }
    );
  }
}