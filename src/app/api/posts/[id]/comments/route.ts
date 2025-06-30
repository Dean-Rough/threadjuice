import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/database';
import { z } from 'zod';

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  authorName: z.string().min(1).max(100),
  parentId: z.string().uuid().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    
    // First, try to get comments from the database
    const { data: dbComments, error: dbError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!dbError && dbComments && dbComments.length > 0) {
      // Format comments for frontend
      const formattedComments = dbComments.map((comment: any) => ({
        id: comment.id,
        postId: comment.post_id,
        parentId: comment.parent_id,
        author: comment.author_name,
        content: comment.content,
        upvotes: comment.upvote_count,
        downvotes: comment.downvote_count,
        timestamp: new Date(comment.created_at).toISOString(),
        isReddit: comment.is_reddit_excerpt,
        redditScore: comment.reddit_score,
        replies: [],
      }));

      // Build comment tree
      const commentMap = new Map();
      const rootComments: any[] = [];

      formattedComments.forEach((comment: any) => {
        commentMap.set(comment.id, comment);
        if (!comment.parentId) {
          rootComments.push(comment);
        }
      });

      formattedComments.forEach((comment: any) => {
        if (comment.parentId && commentMap.has(comment.parentId)) {
          const parent = commentMap.get(comment.parentId);
          parent.replies.push(comment);
        }
      });

      return NextResponse.json({
        comments: rootComments,
        total: dbComments.length,
      });
    }

    // If no comments in database, try to get from post content (Reddit comments)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('content')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({
        comments: [],
        total: 0,
      });
    }

    // Extract Reddit comments from post content sections
    const sections = post.content?.sections || [];
    const redditComments: any[] = [];

    sections.forEach((section: any) => {
      if (section.type === 'comments-1' && section.comments) {
        section.comments.forEach((comment: any, index: number) => {
          redditComments.push({
            id: `reddit-${postId}-${index}`,
            postId: postId,
            parentId: null,
            author: comment.author || 'Anonymous',
            content: comment.content || comment.text,
            upvotes: comment.upvotes || comment.score || 0,
            downvotes: 0,
            timestamp: comment.timestamp || new Date().toISOString(),
            isReddit: true,
            redditScore: comment.upvotes || comment.score,
            replies: [],
          });
        });
      }
    });

    // Save Reddit comments to database for future use
    if (redditComments.length > 0) {
      const commentsToInsert = redditComments.map(comment => ({
        post_id: postId,
        author_name: comment.author,
        content: comment.content,
        upvote_count: comment.upvotes,
        is_reddit_excerpt: true,
        reddit_score: comment.redditScore,
        status: 'active',
      }));

      await supabase.from('comments').insert(commentsToInsert);
    }

    return NextResponse.json({
      comments: redditComments,
      total: redditComments.length,
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();

    // Validate input
    const validation = CreateCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { content, authorName, parentId } = validation.data;

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        parent_id: parentId,
        author_name: authorName,
        content: content,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Update post comment count
    const { data: postData } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', postId)
      .single();

    if (postData) {
      await supabase
        .from('posts')
        .update({ comment_count: postData.comment_count + 1 })
        .eq('id', postId);
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        postId: comment.post_id,
        parentId: comment.parent_id,
        author: comment.author_name,
        content: comment.content,
        upvotes: 0,
        downvotes: 0,
        timestamp: comment.created_at,
        isReddit: false,
        replies: [],
      },
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}