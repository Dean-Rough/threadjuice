interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  source?: string;
}

interface RetryOptions {
  maxRetries: number;
  backoffMs: number;
  timeout: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  backoffMs: 1000,
  timeout: 30000
};

export class SelfHealingScraper {
  private failureLog: Map<string, number> = new Map();
  private successLog: Map<string, Date> = new Map();
  
  async scrapeWithFallback(
    url: string,
    scrapers: Array<(url: string) => Promise<any>>,
    options: Partial<RetryOptions> = {}
  ): Promise<ScrapeResult> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    
    // Try each scraper in order
    for (let i = 0; i < scrapers.length; i++) {
      const scraper = scrapers[i];
      const result = await this.tryScraperWithRetry(
        url, 
        scraper, 
        `scraper_${i}`,
        opts
      );
      
      if (result.success) {
        return result;
      }
    }
    
    // All scrapers failed - log and return error
    this.logFailure(url);
    
    return {
      success: false,
      error: 'All scraping methods failed',
      source: 'none'
    };
  }
  
  private async tryScraperWithRetry(
    url: string,
    scraper: (url: string) => Promise<any>,
    scraperName: string,
    options: RetryOptions
  ): Promise<ScrapeResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < options.maxRetries; attempt++) {
      try {
        // Add timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), options.timeout)
        );
        
        const scrapePromise = scraper(url);
        const data = await Promise.race([scrapePromise, timeoutPromise]);
        
        // Validate data
        if (this.validateScrapedData(data)) {
          this.logSuccess(url);
          return {
            success: true,
            data,
            source: scraperName
          };
        } else {
          throw new Error('Invalid data structure');
        }
        
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is recoverable
        if (this.isRecoverableError(error)) {
          // Exponential backoff
          const delay = options.backoffMs * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        } else {
          // Non-recoverable error, fail immediately
          break;
        }
      }
    }
    
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      source: scraperName
    };
  }
  
  private validateScrapedData(data: any): boolean {
    if (!data) return false;
    
    // Reddit validation
    if ('subreddit' in data) {
      return !!(data.title && data.author && data.selftext !== undefined);
    }
    
    // Twitter validation
    if ('tweet' in data || 'user' in data) {
      return !!(data.text || data.full_text || data.content);
    }
    
    // Generic validation
    return !!(data.title || data.content || data.text);
  }
  
  private isRecoverableError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    
    // Rate limits are recoverable with backoff
    if (error?.status === 429 || message.includes('rate limit')) {
      return true;
    }
    
    // Network errors are often temporary
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    ) {
      return true;
    }
    
    // Server errors might be temporary
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }
    
    return false;
  }
  
  private logFailure(url: string) {
    const failures = this.failureLog.get(url) || 0;
    this.failureLog.set(url, failures + 1);
    
    // Alert if too many failures
    if (failures > 5) {
      console.error(`CRITICAL: URL ${url} has failed ${failures} times`);
      // In production, send alert to monitoring
    }
  }
  
  private logSuccess(url: string) {
    this.successLog.set(url, new Date());
    // Reset failure count on success
    this.failureLog.delete(url);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Get scraper health metrics
  getHealthMetrics() {
    const totalFailures = Array.from(this.failureLog.values()).reduce((a, b) => a + b, 0);
    const recentSuccesses = Array.from(this.successLog.values()).filter(
      date => Date.now() - date.getTime() < 3600000 // Last hour
    ).length;
    
    return {
      totalFailures,
      recentSuccesses,
      failureRate: totalFailures / (totalFailures + this.successLog.size),
      problematicUrls: Array.from(this.failureLog.entries())
        .filter(([_, failures]) => failures > 3)
        .map(([url, failures]) => ({ url, failures }))
    };
  }
}

// Reddit scraper implementations
export const redditScrapers = [
  // Primary: Direct JSON API
  async (url: string) => {
    const jsonUrl = url.replace(/\/?$/, '.json');
    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'ThreadJuice/1.0'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return data[0]?.data?.children[0]?.data;
  },
  
  // Fallback: Old Reddit
  async (url: string) => {
    const oldRedditUrl = url.replace('www.reddit.com', 'old.reddit.com') + '.json';
    const response = await fetch(oldRedditUrl, {
      headers: {
        'User-Agent': 'ThreadJuice/1.0'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return data[0]?.data?.children[0]?.data;
  }
];

// Twitter scraper implementations  
export const twitterScrapers = [
  // Primary: Official API
  async (url: string) => {
    if (!process.env.TWITTER_BEARER_TOKEN) {
      throw new Error('Twitter API token not configured');
    }
    
    // Extract tweet ID from URL
    const tweetId = url.match(/status\/(\d+)/)?.[1];
    if (!tweetId) throw new Error('Invalid Twitter URL');
    
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=created_at,author_id,public_metrics,conversation_id&expansions=author_id`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        }
      }
    );
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return data.data;
  },
  
  // Fallback: Nitter instance (if available)
  async (url: string) => {
    const nitterUrl = url.replace('twitter.com', 'nitter.net').replace('x.com', 'nitter.net');
    const response = await fetch(nitterUrl);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    // Parse HTML for tweet content
    // This is a simplified example - real implementation would use cheerio
    const content = html.match(/<div class="tweet-content">(.*?)<\/div>/s)?.[1];
    
    return {
      text: content,
      url: url
    };
  }
];

// Factory function for creating scrapers
export function createSelfHealingScraper() {
  return new SelfHealingScraper();
}