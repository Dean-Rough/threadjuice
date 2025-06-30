import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const secretPath = request.nextUrl.pathname.includes('tj-control-x7j9k');
    if (!secretPath) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const errors = [];
    const metrics = {
      contentGeneration: true,
      databaseHealth: true,
      apiHealth: true,
      cronJobs: true
    };

    // Check database health
    try {
      const { error } = await supabase.from('posts').select('id').limit(1);
      if (error) {
        metrics.databaseHealth = false;
        errors.push({
          type: 'database',
          message: error.message,
          timestamp: new Date()
        });
      }
    } catch (e) {
      metrics.databaseHealth = false;
      errors.push({
        type: 'database',
        message: 'Failed to connect to database',
        timestamp: new Date()
      });
    }

    // Check content generation (last post)
    const { data: lastPost } = await supabase
      .from('posts')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastPost) {
      const hoursSinceLastPost = (Date.now() - new Date(lastPost.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastPost > 24) {
        metrics.contentGeneration = false;
        errors.push({
          type: 'content',
          message: `No content generated in ${Math.floor(hoursSinceLastPost)} hours`,
          timestamp: new Date()
        });
      }
    }

    // Check API health (Reddit/Twitter endpoints)
    try {
      const testUrls = [
        'https://www.reddit.com/r/AskReddit.json',
        process.env.TWITTER_BEARER_TOKEN ? 'https://api.twitter.com/2/users/by/username/elonmusk' : null
      ].filter((url): url is string => url !== null);

      for (const url of testUrls) {
        try {
          const response = await fetch(url, {
            headers: url.includes('twitter') ? {
              'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            } : {}
          });
          
          if (!response.ok && response.status !== 429) {
            metrics.apiHealth = false;
            errors.push({
              type: 'api',
              message: `${url.includes('reddit') ? 'Reddit' : 'Twitter'} API returned ${response.status}`,
              timestamp: new Date()
            });
          }
        } catch (e) {
          // API check failed
        }
      }
    } catch (e) {
      // Skip API checks if they fail
    }

    // Check cron jobs (recent runs)
    const { data: recentCrons } = await supabase
      .from('posts')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (!recentCrons || recentCrons.length === 0) {
      metrics.cronJobs = false;
      errors.push({
        type: 'cron',
        message: 'No automated content generated in 48 hours',
        timestamp: new Date()
      });
    }

    // Determine overall status
    const criticalFailures = !metrics.databaseHealth;
    const warnings = !metrics.contentGeneration || !metrics.cronJobs;
    
    const status = criticalFailures ? 'critical' : warnings ? 'warning' : 'healthy';

    return NextResponse.json({
      status,
      lastCheck: new Date(),
      errors: errors.slice(0, 10), // Limit to 10 most recent
      metrics
    });

  } catch (error) {
    return NextResponse.json({
      status: 'critical',
      lastCheck: new Date(),
      errors: [{
        type: 'system',
        message: 'Health check failed',
        timestamp: new Date()
      }],
      metrics: {
        contentGeneration: false,
        databaseHealth: false,
        apiHealth: false,
        cronJobs: false
      }
    });
  }
}