import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import supabase from '@/lib/database';

/**
 * Cron job to update trending scores
 * Runs every 6 hours (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting trending score update...');

    // Get all posts from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, view_count, upvote_count, share_count, comment_count, created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      throw error;
    }

    let updated = 0;

    // Calculate trending scores
    for (const post of posts) {
      const ageInHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      
      // Trending score algorithm
      // Weights: views=1, upvotes=3, shares=5, comments=2
      const engagementScore = 
        (post.view_count * 1) +
        (post.upvote_count * 3) +
        (post.share_count * 5) +
        (post.comment_count * 2);
      
      // Apply time decay (half-life of 24 hours)
      const timeDecay = Math.pow(0.5, ageInHours / 24);
      const trendingScore = Math.round(engagementScore * timeDecay);

      // Update the score
      const { error: updateError } = await supabase
        .from('posts')
        .update({ 
          trending_score: trendingScore,
          trending: trendingScore > 50, // Mark as trending if score > 50
        })
        .eq('id', post.id);

      if (!updateError) {
        updated++;
      }
    }

    // Clean up old posts (remove trending flag from posts older than 7 days)
    await supabase
      .from('posts')
      .update({ trending: false, trending_score: 0 })
      .lt('created_at', sevenDaysAgo.toISOString());

    return NextResponse.json({
      success: true,
      message: `Updated trending scores for ${updated} posts`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Trending update cron failed:', error);
    return NextResponse.json(
      { 
        error: 'Trending update failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}