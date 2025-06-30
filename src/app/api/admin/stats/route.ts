import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const secretPath = request.nextUrl.pathname.includes('tj-control-x7j9k');
    if (!secretPath) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get daily traffic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todaysPosts } = await getSupabaseClient()
      .from('posts')
      .select('view_count')
      .gte('created_at', today.toISOString());
    
    const dailyTraffic = todaysPosts?.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0) || 0;

    // Get AI search traffic percentage
    // This would normally track referrers, but we'll estimate based on patterns
    const { data: recentViews } = await getSupabaseClient()
      .from('posts')
      .select('view_count, title')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('view_count', { ascending: false })
      .limit(20);

    // Estimate AI traffic based on viral patterns (posts with sudden spikes)
    const totalViews = recentViews?.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0) || 1;
    const aiPatternViews = recentViews?.filter((post: any) => 
      post.view_count > 1000 && // High traffic
      post.title.length < 100 // Concise titles (AI prefers)
    ).reduce((sum: number, post: any) => sum + (post.view_count || 0), 0) || 0;
    
    const aiSearchTraffic = Math.round((aiPatternViews / totalViews) * 100);

    // Calculate viral score
    const { data: topPosts } = await getSupabaseClient()
      .from('posts')
      .select('upvote_count, view_count, share_count, comment_count')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('trending_score', { ascending: false })
      .limit(10);

    const viralScore = topPosts?.length ? 
      Math.round(
        topPosts.reduce((sum: number, post: any) => 
          sum + (post.upvote_count || 0) * 3 + 
          (post.share_count || 0) * 5 + 
          (post.comment_count || 0) * 2 + 
          (post.view_count || 0) * 0.01
        , 0) / topPosts.length
      ) : 0;

    // Get total posts
    const { count: totalPosts } = await getSupabaseClient()
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // Get last generated post
    const { data: lastPost } = await getSupabaseClient()
      .from('posts')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get top performer
    const { data: topPerformer } = await getSupabaseClient()
      .from('posts')
      .select('title, view_count')
      .order('view_count', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      dailyTraffic,
      aiSearchTraffic,
      viralScore: Math.min(viralScore, 100), // Cap at 100
      totalPosts: totalPosts || 0,
      lastGenerated: lastPost?.created_at || null,
      topPerformer: topPerformer ? {
        title: topPerformer.title,
        views: topPerformer.view_count || 0
      } : null
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({
      dailyTraffic: 0,
      aiSearchTraffic: 0,
      viralScore: 0,
      totalPosts: 0,
      lastGenerated: null,
      topPerformer: null
    });
  }
}