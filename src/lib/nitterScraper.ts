/**
 * Nitter Twitter Scraper for Drama Detection
 * Scrapes Twitter data via Nitter instances (no API limits)
 */

import { TwitterDramaData } from './twitterDramaDetector';

export interface NitterConfig {
  instances: string[];
  timeout: number;
  retries: number;
  userAgent: string;
}

export interface NitterSearchOptions {
  query: string;
  maxResults?: number;
  since?: string;
  until?: string;
}

class NitterScraper {
  private config: NitterConfig = {
    instances: [
      'https://nitter.privacydev.net',
      'https://nitter.unixfox.eu',
      'https://nitter.catalyst.sx', 
      'https://nitter.net',
      'https://nitter.it'
    ],
    timeout: 10000,
    retries: 3,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  /**
   * Search for tweets with drama potential
   */
  async searchDramaTweets(options: NitterSearchOptions): Promise<TwitterDramaData[]> {
    const { query, maxResults = 20 } = options;
    
    console.log(`🎭 Searching Nitter for: "${query}"`);
    
    // Try multiple Nitter instances until one works
    for (const instance of this.config.instances) {
      try {
        console.log(`   Trying instance: ${instance}`);
        
        const tweets = await this.scrapeNitterSearch(instance, query, maxResults);
        
        if (tweets.length > 0) {
          console.log(`✅ Found ${tweets.length} tweets from ${instance}`);
          return tweets;
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${instance} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }
    
    throw new Error('All Nitter instances failed');
  }

  /**
   * Scrape a specific Nitter instance
   */
  private async scrapeNitterSearch(instance: string, query: string, maxResults: number): Promise<TwitterDramaData[]> {
    const searchUrl = `${instance}/search?f=tweets&q=${encodeURIComponent(query)}&e-nativeretweets=on`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive'
      },
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return this.parseNitterHTML(html, maxResults);
  }

  /**
   * Parse Nitter HTML to extract tweet data
   */
  private parseNitterHTML(html: string, maxResults: number): TwitterDramaData[] {
    const tweets: TwitterDramaData[] = [];
    
    // Basic HTML parsing for Nitter structure
    // Note: This is simplified - in production you'd want a proper HTML parser
    const tweetMatches = html.match(/<div class="timeline-item[^>]*>[\s\S]*?<\/div>/g) || [];
    
    for (let i = 0; i < Math.min(tweetMatches.length, maxResults); i++) {
      const tweetHtml = tweetMatches[i];
      
      try {
        const tweet = this.parseTweetFromHTML(tweetHtml, i);
        if (tweet) {
          tweets.push(tweet);
        }
      } catch (error) {
        console.log(`   ⚠️ Failed to parse tweet ${i}: ${error}`);
        continue;
      }
    }
    
    return tweets;
  }

  /**
   * Parse individual tweet from HTML
   */
  private parseTweetFromHTML(html: string, index: number): TwitterDramaData | null {
    // Extract tweet text
    const textMatch = html.match(/<div class="tweet-content[^>]*>([\s\S]*?)<\/div>/);
    if (!textMatch) return null;
    
    const text = this.cleanHtmlText(textMatch[1]);
    if (!text || text.length < 10) return null;
    
    // Extract username
    const usernameMatch = html.match(/<a class="username"[^>]*>@([^<]+)<\/a>/);
    const username = usernameMatch ? usernameMatch[1] : `user_${index}`;
    
    // Extract display name
    const nameMatch = html.match(/<a class="fullname"[^>]*>([^<]+)<\/a>/);
    const displayName = nameMatch ? this.cleanHtmlText(nameMatch[1]) : username;
    
    // Extract engagement metrics (Nitter shows these as text)
    const repliesMatch = html.match(/(\d+)\s*replies?/i);
    const retweetsMatch = html.match(/(\d+)\s*retweets?/i);
    const likesMatch = html.match(/(\d+)\s*likes?/i);
    const quotesMatch = html.match(/(\d+)\s*quotes?/i);
    
    // Check for verification badge
    const isVerified = html.includes('icon-verified') || html.includes('verified');
    
    // Generate realistic follower count based on engagement
    const likes = parseInt(likesMatch?.[1] || '0');
    const estimatedFollowers = this.estimateFollowerCount(likes, isVerified);
    
    return {
      id: `nitter_${Date.now()}_${index}`,
      text: text,
      author: {
        username: username,
        name: displayName,
        verified: isVerified,
        follower_count: estimatedFollowers
      },
      metrics: {
        retweets: parseInt(retweetsMatch?.[1] || '0'),
        likes: likes,
        replies: parseInt(repliesMatch?.[1] || '0'), 
        quotes: parseInt(quotesMatch?.[1] || '0')
      },
      created_at: new Date().toISOString(), // Nitter doesn't always show exact timestamps
      context_annotations: this.inferContextFromText(text)
    };
  }

  /**
   * Clean HTML text content
   */
  private cleanHtmlText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Estimate follower count based on engagement
   */
  private estimateFollowerCount(likes: number, isVerified: boolean): number {
    // Rough estimation: 1-3% engagement rate is typical
    let baseFollowers = likes * 50; // Conservative estimate
    
    if (isVerified) {
      baseFollowers = Math.max(baseFollowers, 10000); // Verified accounts usually have 10k+
    }
    
    // Add some randomness to make it realistic
    const variance = 0.3;
    const multiplier = 1 + (Math.random() - 0.5) * variance;
    
    return Math.floor(baseFollowers * multiplier);
  }

  /**
   * Infer context annotations from tweet text
   */
  private inferContextFromText(text: string): any[] {
    const contexts = [];
    const lowerText = text.toLowerCase();
    
    // Food topics
    if (/pizza|food|restaurant|cooking|chef|recipe|meal/.test(lowerText)) {
      contexts.push({
        domain: { name: 'Food & Dining', description: 'Food discussions' },
        entity: { name: 'Food', description: 'Food and dining' }
      });
    }
    
    // Work topics  
    if (/work|job|boss|office|meeting|salary|career/.test(lowerText)) {
      contexts.push({
        domain: { name: 'Business & Finance', description: 'Work discussions' },
        entity: { name: 'Work', description: 'Work and career' }
      });
    }
    
    // Tech topics
    if (/tech|startup|coding|developer|app|software|ai/.test(lowerText)) {
      contexts.push({
        domain: { name: 'Technology', description: 'Tech discussions' },
        entity: { name: 'Technology', description: 'Technology and software' }
      });
    }
    
    // Relationship topics
    if (/dating|relationship|marriage|boyfriend|girlfriend|partner/.test(lowerText)) {
      contexts.push({
        domain: { name: 'Relationships', description: 'Relationship discussions' },
        entity: { name: 'Dating', description: 'Dating and relationships' }
      });
    }
    
    return contexts;
  }

  /**
   * Get trending topics from Nitter
   */
  async getTrendingTopics(): Promise<string[]> {
    for (const instance of this.config.instances) {
      try {
        const response = await fetch(`${instance}/explore/tabs/trending`, {
          headers: { 'User-Agent': this.config.userAgent },
          signal: AbortSignal.timeout(this.config.timeout)
        });
        
        if (!response.ok) continue;
        
        const html = await response.text();
        const trends = this.extractTrendsFromHTML(html);
        
        if (trends.length > 0) {
          return trends;
        }
        
      } catch (error) {
        continue;
      }
    }
    
    // Fallback trending topics for drama detection
    return [
      'unpopular opinion',
      'controversial take', 
      'hot take',
      'ratio',
      'drama',
      'problematic',
      'toxic',
      'red flag'
    ];
  }

  /**
   * Extract trending topics from Nitter HTML
   */
  private extractTrendsFromHTML(html: string): string[] {
    const trends: string[] = [];
    const trendMatches = html.match(/<span class="trend-name"[^>]*>([^<]+)<\/span>/g) || [];
    
    for (const match of trendMatches) {
      const trendMatch = match.match(/>([^<]+)</);
      if (trendMatch) {
        trends.push(trendMatch[1].trim());
      }
    }
    
    return trends.slice(0, 10); // Top 10 trends
  }

  /**
   * Search for drama using multiple strategies
   */
  async findDramaContent(): Promise<TwitterDramaData[]> {
    const dramaQueries = [
      'unpopular opinion',
      'tell me you without telling me you',
      'ratio',
      'controversial take',
      'hot take',
      'problematic',
      'red flag'
    ];
    
    const allTweets: TwitterDramaData[] = [];
    
    // Try each drama query
    for (const query of dramaQueries) {
      try {
        const tweets = await this.searchDramaTweets({ 
          query, 
          maxResults: 5 // Small batches to avoid overwhelming
        });
        
        allTweets.push(...tweets);
        
        // Add delay between searches to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ⚠️ Failed query "${query}": ${error}`);
        continue;
      }
    }
    
    // Remove duplicates and return best candidates
    const uniqueTweets = this.removeDuplicateTweets(allTweets);
    return uniqueTweets.slice(0, 20); // Return top 20 for drama analysis
  }

  /**
   * Remove duplicate tweets
   */
  private removeDuplicateTweets(tweets: TwitterDramaData[]): TwitterDramaData[] {
    const seen = new Set<string>();
    return tweets.filter(tweet => {
      const key = `${tweet.author.username}:${tweet.text.substring(0, 50)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Check if Nitter instances are working
   */
  async checkInstanceHealth(): Promise<{ instance: string; working: boolean; responseTime: number }[]> {
    const results = [];
    
    for (const instance of this.config.instances) {
      const start = Date.now();
      try {
        const response = await fetch(instance, {
          headers: { 'User-Agent': this.config.userAgent },
          signal: AbortSignal.timeout(5000)
        });
        
        const responseTime = Date.now() - start;
        results.push({
          instance,
          working: response.ok,
          responseTime
        });
        
      } catch (error) {
        results.push({
          instance,
          working: false,
          responseTime: Date.now() - start
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const nitterScraper = new NitterScraper();
export default nitterScraper;