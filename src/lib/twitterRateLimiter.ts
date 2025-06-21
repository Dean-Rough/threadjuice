/**
 * Twitter API Rate Limiter for Free Tier
 * Manages the strict 100 API calls/month limit
 */

interface ApiCallLog {
  timestamp: Date;
  endpoint: string;
  success: boolean;
}

class TwitterRateLimiter {
  private callLog: ApiCallLog[] = [];
  private readonly FREE_TIER_MONTHLY_LIMIT = 100;
  private readonly DAILY_LIMIT = 3; // Conservative: ~90 calls/month
  
  /**
   * Check if we can make an API call within limits
   */
  canMakeCall(): { allowed: boolean; reason?: string; stats: any } {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter calls from this month
    const monthCalls = this.callLog.filter(call => call.timestamp >= monthStart);
    const todayCalls = this.callLog.filter(call => call.timestamp >= dayStart);
    
    const stats = {
      monthly_used: monthCalls.length,
      monthly_limit: this.FREE_TIER_MONTHLY_LIMIT,
      daily_used: todayCalls.length,
      daily_limit: this.DAILY_LIMIT,
      remaining_this_month: this.FREE_TIER_MONTHLY_LIMIT - monthCalls.length,
      remaining_today: this.DAILY_LIMIT - todayCalls.length
    };
    
    // Check monthly limit
    if (monthCalls.length >= this.FREE_TIER_MONTHLY_LIMIT) {
      return {
        allowed: false,
        reason: `Monthly limit exceeded (${monthCalls.length}/${this.FREE_TIER_MONTHLY_LIMIT})`,
        stats
      };
    }
    
    // Check daily limit
    if (todayCalls.length >= this.DAILY_LIMIT) {
      return {
        allowed: false,
        reason: `Daily limit exceeded (${todayCalls.length}/${this.DAILY_LIMIT})`,
        stats
      };
    }
    
    return { allowed: true, stats };
  }
  
  /**
   * Log an API call
   */
  logCall(endpoint: string, success: boolean) {
    this.callLog.push({
      timestamp: new Date(),
      endpoint,
      success
    });
    
    // Keep only last 2 months of logs
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    this.callLog = this.callLog.filter(call => call.timestamp >= twoMonthsAgo);
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const monthCalls = this.callLog.filter(call => call.timestamp >= monthStart);
    const todayCalls = this.callLog.filter(call => call.timestamp >= dayStart);
    const successfulCalls = monthCalls.filter(call => call.success);
    
    return {
      monthly: {
        used: monthCalls.length,
        limit: this.FREE_TIER_MONTHLY_LIMIT,
        remaining: this.FREE_TIER_MONTHLY_LIMIT - monthCalls.length,
        success_rate: monthCalls.length > 0 ? (successfulCalls.length / monthCalls.length) * 100 : 0
      },
      daily: {
        used: todayCalls.length,
        limit: this.DAILY_LIMIT,
        remaining: this.DAILY_LIMIT - todayCalls.length
      },
      recent_calls: this.callLog.slice(-10).map(call => ({
        endpoint: call.endpoint,
        timestamp: call.timestamp.toISOString(),
        success: call.success
      }))
    };
  }
  
  /**
   * Calculate optimal call timing
   */
  getOptimalCallTiming() {
    const stats = this.getUsageStats();
    const now = new Date();
    const daysLeftInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    
    const recommendedDailyLimit = Math.floor(stats.monthly.remaining / Math.max(daysLeftInMonth, 1));
    
    return {
      calls_remaining_this_month: stats.monthly.remaining,
      days_left_in_month: daysLeftInMonth,
      recommended_daily_limit: Math.min(recommendedDailyLimit, this.DAILY_LIMIT),
      next_reset: {
        daily: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        monthly: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      }
    };
  }
  
  /**
   * Check if we should run drama detection today
   */
  shouldRunDramaDetection(): { should_run: boolean; reason: string } {
    // TEMPORARILY DISABLED FOR TESTING
    return { should_run: true, reason: 'Rate limiting disabled for testing' };
    
    const { allowed, reason, stats } = this.canMakeCall();
    
    if (!allowed) {
      return { should_run: false, reason: reason || 'Rate limit exceeded' };
    }
    
    // Only run if we have at least 2 calls available (search + potential follow-up)
    if (stats.remaining_today < 2) {
      return { 
        should_run: false, 
        reason: `Need at least 2 API calls, only ${stats.remaining_today} remaining today` 
      };
    }
    
    // Conservative approach: save calls for end of month
    const timing = this.getOptimalCallTiming();
    if (timing.calls_remaining_this_month < 10 && timing.days_left_in_month > 5) {
      return {
        should_run: false,
        reason: `Conserving API calls: ${timing.calls_remaining_this_month} left for ${timing.days_left_in_month} days`
      };
    }
    
    return { should_run: true, reason: 'Within rate limits' };
  }
}

// Export singleton instance
export const twitterRateLimiter = new TwitterRateLimiter();
export default twitterRateLimiter;