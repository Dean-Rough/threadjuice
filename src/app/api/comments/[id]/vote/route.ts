import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/database';
import { z } from 'zod';

const VoteSchema = z.object({
  type: z.enum(['upvote', 'downvote']),
  action: z.enum(['add', 'remove']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const body = await request.json();

    // Validate input
    const validation = VoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { type, action } = validation.data;
    const column = type === 'upvote' ? 'upvote_count' : 'downvote_count';
    const increment = action === 'add' ? 1 : -1;

    // First get current values
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select(column)
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      throw new Error('Comment not found');
    }

    // Update vote count
    const { data, error } = await supabase
      .from('comments')
      .update({
        [column]: (comment as any)[column] + increment,
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vote:', error);
      return NextResponse.json(
        { error: 'Failed to update vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      upvotes: data.upvote_count,
      downvotes: data.downvote_count,
    });

  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}