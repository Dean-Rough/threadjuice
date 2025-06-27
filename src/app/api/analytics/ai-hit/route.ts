import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/database';
import { PerformanceTracker } from '@/lib/analytics/performance-tracker';

export async function POST(request: NextRequest) {
  try {
    const { postSlug, source, userAgent } = await request.json();
    
    // Get post ID from slug
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', postSlug)
      .single();
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Track the AI hit
    const tracker = PerformanceTracker.getInstance();
    await tracker.trackAISearchHit(post.id, source);
    
    // Log for analysis
    await supabase.from('ai_crawler_logs').insert({
      post_id: post.id,
      source,
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to track AI hit:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}