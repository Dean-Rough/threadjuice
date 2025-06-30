import { getSupabaseClient } from '@/lib/database';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface ContentPerformance {
  postId: string;
  viewVelocity: number; // Views per hour
  engagementRate: number; // (likes + comments + shares) / views
  viralPotential: number; // Predicted viral score
  aiSearchAppearances: number;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  
  static getInstance(): PerformanceTracker {
    if (!this.instance) {
      this.instance = new PerformanceTracker();
    }
    return this.instance;
  }
  
  // Track Core Web Vitals
  async trackWebVitals(metrics: Partial<PerformanceMetrics>) {
    try {
      await getSupabaseClient().from('performance_metrics').insert({
        ...metrics,
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      });
    } catch (error) {
      console.error('Failed to track web vitals:', error);
    }
  }
  
  // Track content performance
  async trackContentPerformance(postId: string) {
    try {
      // Get current stats
      const { data: post } = await getSupabaseClient()
        .from('posts')
        .select('view_count, upvote_count, comment_count, share_count, created_at')
        .eq('id', postId)
        .single();
      
      if (!post) return;
      
      // Calculate metrics
      const ageInHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      const viewVelocity = ageInHours > 0 ? post.view_count / ageInHours : 0;
      
      const totalEngagements = (post.upvote_count || 0) + 
                               (post.comment_count || 0) + 
                               (post.share_count || 0);
      const engagementRate = post.view_count > 0 ? totalEngagements / post.view_count : 0;
      
      // Predict viral potential based on early signals
      const viralPotential = this.calculateViralPotential({
        viewVelocity,
        engagementRate,
        ageInHours,
        currentViews: post.view_count
      });
      
      // Update post with performance data
      await getSupabaseClient()
        .from('posts')
        .update({
          view_velocity: viewVelocity,
          engagement_rate: engagementRate,
          viral_potential: viralPotential,
          performance_updated_at: new Date().toISOString()
        })
        .eq('id', postId);
      
      // Auto-boost if high potential
      if (viralPotential > 80 && ageInHours < 24) {
        await this.boostContent(postId);
      }
      
    } catch (error) {
      console.error('Failed to track content performance:', error);
    }
  }
  
  // Calculate viral potential score (0-100)
  private calculateViralPotential(metrics: {
    viewVelocity: number;
    engagementRate: number;
    ageInHours: number;
    currentViews: number;
  }): number {
    let score = 0;
    
    // View velocity scoring (0-40 points)
    if (metrics.viewVelocity > 1000) score += 40;
    else if (metrics.viewVelocity > 500) score += 30;
    else if (metrics.viewVelocity > 100) score += 20;
    else if (metrics.viewVelocity > 50) score += 10;
    
    // Engagement rate scoring (0-30 points)
    if (metrics.engagementRate > 0.15) score += 30;
    else if (metrics.engagementRate > 0.10) score += 20;
    else if (metrics.engagementRate > 0.05) score += 10;
    
    // Early momentum bonus (0-20 points)
    if (metrics.ageInHours < 2 && metrics.currentViews > 100) score += 20;
    else if (metrics.ageInHours < 6 && metrics.currentViews > 500) score += 15;
    else if (metrics.ageInHours < 12 && metrics.currentViews > 1000) score += 10;
    
    // Freshness bonus (0-10 points)
    if (metrics.ageInHours < 24) score += 10;
    else if (metrics.ageInHours < 48) score += 5;
    
    return Math.min(score, 100);
  }
  
  // Auto-boost high-potential content
  private async boostContent(postId: string) {
    try {
      await getSupabaseClient()
        .from('posts')
        .update({
          boosted: true,
          boost_multiplier: 2.0,
          boosted_at: new Date().toISOString()
        })
        .eq('id', postId);
      
      console.log(`Auto-boosted high-potential post: ${postId}`);
    } catch (error) {
      console.error('Failed to boost content:', error);
    }
  }
  
  // Track AI search appearances
  async trackAISearchHit(postId: string, source: 'perplexity' | 'chatgpt' | 'claude' | 'other') {
    try {
      // Increment AI search counter
      const { data: post } = await getSupabaseClient()
        .from('posts')
        .select('ai_search_hits')
        .eq('id', postId)
        .single();
      
      const hits = post?.ai_search_hits || {};
      hits[source] = (hits[source] || 0) + 1;
      hits.total = (hits.total || 0) + 1;
      
      await getSupabaseClient()
        .from('posts')
        .update({ ai_search_hits: hits })
        .eq('id', postId);
      
    } catch (error) {
      console.error('Failed to track AI search hit:', error);
    }
  }
  
  // Get performance insights
  async getPerformanceInsights() {
    try {
      // Top performing content
      const { data: topPosts } = await getSupabaseClient()
        .from('posts')
        .select('id, title, view_count, engagement_rate, viral_potential')
        .order('viral_potential', { ascending: false })
        .limit(10);
      
      // AI search performance
      const { data: aiSearchPosts } = await getSupabaseClient()
        .from('posts')
        .select('id, title, ai_search_hits')
        .not('ai_search_hits', 'is', null)
        .order('ai_search_hits->total', { ascending: false })
        .limit(10);
      
      // Category performance
      const { data: categoryStats } = await getSupabaseClient()
        .from('posts')
        .select('category, view_count, engagement_rate')
        .not('category', 'is', null);
      
      const categoryPerformance = this.aggregateCategoryStats(categoryStats || []);
      
      return {
        topPerformingPosts: topPosts || [],
        aiSearchLeaders: aiSearchPosts || [],
        categoryPerformance,
        recommendations: this.generateRecommendations({
          topPosts: topPosts || [],
          categoryPerformance
        })
      };
      
    } catch (error) {
      console.error('Failed to get performance insights:', error);
      return null;
    }
  }
  
  private aggregateCategoryStats(posts: any[]) {
    const stats: Record<string, any> = {};
    
    posts.forEach(post => {
      if (!stats[post.category]) {
        stats[post.category] = {
          totalViews: 0,
          totalPosts: 0,
          avgEngagement: 0
        };
      }
      
      stats[post.category].totalViews += post.view_count || 0;
      stats[post.category].totalPosts += 1;
      stats[post.category].avgEngagement += post.engagement_rate || 0;
    });
    
    // Calculate averages
    Object.keys(stats).forEach(category => {
      stats[category].avgEngagement /= stats[category].totalPosts;
      stats[category].avgViews = stats[category].totalViews / stats[category].totalPosts;
    });
    
    return stats;
  }
  
  private generateRecommendations(data: any) {
    const recommendations = [];
    
    // Check for viral patterns
    const viralPosts = data.topPosts.filter((p: any) => p.viral_potential > 70);
    if (viralPosts.length > 0) {
      recommendations.push({
        type: 'viral_pattern',
        message: `${viralPosts.length} posts showing viral potential. Consider creating similar content.`,
        priority: 'high'
      });
    }
    
    // Category recommendations
    const bestCategory = Object.entries(data.categoryPerformance)
      .sort((a: any, b: any) => b[1].avgEngagement - a[1].avgEngagement)[0];
      
    if (bestCategory) {
      recommendations.push({
        type: 'category_focus',
        message: `"${bestCategory[0]}" category has highest engagement. Increase content in this category.`,
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
}

// Client-side Web Vitals tracking
export function initializeWebVitalsTracking() {
  if (typeof window === 'undefined') return;
  
  const tracker = PerformanceTracker.getInstance();
  
  // Track LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    tracker.trackWebVitals({
      largestContentfulPaint: lastEntry.startTime
    });
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // Track FID
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      tracker.trackWebVitals({
        firstInputDelay: entry.processingStart - entry.startTime
      });
    });
  }).observe({ entryTypes: ['first-input'] });
  
  // Track CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    tracker.trackWebVitals({
      cumulativeLayoutShift: clsValue
    });
  }).observe({ entryTypes: ['layout-shift'] });
}