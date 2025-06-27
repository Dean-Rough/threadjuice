import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/database';
import { z } from 'zod';

const VoteSchema = z.object({
  type: z.enum(['upvote', 'downvote']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();

    // Validate input
    const validation = VoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { type } = validation.data;
    const column = type === 'upvote' ? 'upvote_count' : 'downvote_count';

    // First get current values
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select(`${column}, trending_score`)
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Database error: ${fetchError.message}`);
    }
    
    if (!post) {
      throw new Error('Post not found');
    }

    // Update with incremented values (handle null counts)
    const currentCount = post[column] || 0;
    const currentScore = post.trending_score || 0;
    
    const { data, error } = await supabase
      .from('posts')
      .update({
        [column]: currentCount + 1,
        trending_score: currentScore + (type === 'upvote' ? 3 : -1),
      })
      .eq('id', postId)
      .select();

    if (error || !data || data.length === 0) {
      console.error('Error updating vote:', error);
      throw new Error('Failed to update vote');
    }

    const updatedPost = data[0];

    // Track interaction
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('user_interactions').insert({
      post_id: postId,
      interaction_type: type,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      upvotes: updatedPost.upvote_count || 0,
      downvotes: updatedPost.downvote_count || 0,
      trendingScore: updatedPost.trending_score || 0,
    });

  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}