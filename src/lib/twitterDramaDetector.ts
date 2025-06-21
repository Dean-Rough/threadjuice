/**
 * Twitter Drama Detection Service
 * Proof of concept for identifying viral Twitter drama and converting to ThreadJuice stories
 */

export interface TwitterDramaData {
  id: string;
  text: string;
  author: {
    username: string;
    name: string;
    verified: boolean;
    follower_count: number;
  };
  metrics: {
    retweets: number;
    likes: number;
    replies: number;
    quotes: number;
    impressions?: number;
  };
  created_at: string;
  context_annotations?: {
    domain: { name: string; description: string };
    entity: { name: string; description: string };
  }[];
  referenced_tweets?: {
    type: 'replied_to' | 'quoted' | 'retweeted';
    id: string;
  }[];
}

export interface DramaThread {
  original_tweet: TwitterDramaData;
  replies: TwitterDramaData[];
  quotes: TwitterDramaData[];
  related_tweets: TwitterDramaData[];
  drama_score: number;
  controversy_indicators: string[];
  topic: string;
  participants: string[];
}

export interface DramaDetectionConfig {
  min_engagement_ratio: number; // quotes/retweets ratio indicating controversy
  min_reply_count: number;
  min_follower_threshold: number;
  controversy_keywords: string[];
  time_window_hours: number;
}

class TwitterDramaDetector {
  private config: DramaDetectionConfig = {
    min_engagement_ratio: 0.3, // 30% quote rate suggests drama
    min_reply_count: 50,
    min_follower_threshold: 1000,
    controversy_keywords: [
      'ratio', 'this you', 'tell me you', 'imagine thinking',
      'yikes', 'problematic', 'not a good look', 'delete this',
      'wrong take', 'bad faith', 'strawman', 'cope', 'L take',
      'unhinged', 'deranged', 'unreal', 'wild take'
    ],
    time_window_hours: 6
  };

  /**
   * Analyze tweet metrics to detect potential drama
   */
  calculateDramaScore(tweet: TwitterDramaData): number {
    const { retweets, likes, replies, quotes } = tweet.metrics;
    const total_engagement = retweets + likes + replies + quotes;
    
    if (total_engagement < 100) return 0; // Not enough engagement
    
    let score = 0;
    
    // High quote-to-retweet ratio indicates controversy
    const quote_ratio = quotes / (retweets + 1);
    if (quote_ratio > this.config.min_engagement_ratio) {
      score += 40;
    }
    
    // High reply-to-like ratio suggests heated discussion
    const reply_ratio = replies / (likes + 1);
    if (reply_ratio > 0.2) {
      score += 30;
    }
    
    // Check for controversy keywords in text
    const controversy_words = this.config.controversy_keywords.filter(keyword =>
      tweet.text.toLowerCase().includes(keyword.toLowerCase())
    );
    score += controversy_words.length * 10;
    
    // Verified accounts or high followers get drama boost
    if (tweet.author.verified || tweet.author.follower_count > 10000) {
      score += 20;
    }
    
    // Context annotations for trending topics
    if (tweet.context_annotations?.length) {
      score += 15;
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Detect drama patterns in trending topics
   */
  analyzeTrendingTopics(tweets: TwitterDramaData[]): DramaThread[] {
    const potential_drama: DramaThread[] = [];
    
    for (const tweet of tweets) {
      const drama_score = this.calculateDramaScore(tweet);
      
      if (drama_score >= 60) { // High drama threshold
        const thread: DramaThread = {
          original_tweet: tweet,
          replies: [],
          quotes: [],
          related_tweets: [],
          drama_score,
          controversy_indicators: this.identifyControversyIndicators(tweet),
          topic: this.extractTopic(tweet),
          participants: [tweet.author.username]
        };
        
        potential_drama.push(thread);
      }
    }
    
    return potential_drama.sort((a, b) => b.drama_score - a.drama_score);
  }

  /**
   * Identify specific controversy indicators
   */
  private identifyControversyIndicators(tweet: TwitterDramaData): string[] {
    const indicators: string[] = [];
    const text = tweet.text.toLowerCase();
    
    // Quote tweet drama patterns
    if (tweet.metrics.quotes > tweet.metrics.retweets) {
      indicators.push('High quote-to-retweet ratio');
    }
    
    // Reply storm indicators
    if (tweet.metrics.replies > tweet.metrics.likes * 0.3) {
      indicators.push('Reply storm detected');
    }
    
    // Controversy keyword detection
    const found_keywords = this.config.controversy_keywords.filter(keyword =>
      text.includes(keyword.toLowerCase())
    );
    if (found_keywords.length > 0) {
      indicators.push(`Controversy keywords: ${found_keywords.join(', ')}`);
    }
    
    // Engagement velocity (would need timestamp analysis)
    if (tweet.metrics.likes + tweet.metrics.retweets > 1000) {
      indicators.push('High engagement velocity');
    }
    
    return indicators;
  }

  /**
   * Extract main topic from tweet and context
   */
  private extractTopic(tweet: TwitterDramaData): string {
    // Use context annotations if available
    if (tweet.context_annotations?.length) {
      return tweet.context_annotations[0].entity.name;
    }
    
    // Extract hashtags
    const hashtags = tweet.text.match(/#\w+/g);
    if (hashtags?.length) {
      return hashtags[0].replace('#', '');
    }
    
    // Fall back to first few words
    return tweet.text.split(' ').slice(0, 3).join(' ') + '...';
  }

  /**
   * Mock Twitter API response for testing
   */
  generateMockDramaData(): TwitterDramaData[] {
    return [
      {
        id: '1',
        text: 'Just saw someone say pineapple on pizza is a crime against humanity. Imagine being this wrong about food in 2024.',
        author: {
          username: 'foodie_takes',
          name: 'Sarah Chen',
          verified: false,
          follower_count: 5432
        },
        metrics: {
          retweets: 45,
          likes: 234,
          replies: 89,
          quotes: 67 // High quote ratio = drama
        },
        created_at: '2024-06-20T14:30:00Z',
        context_annotations: [
          {
            domain: { name: 'Food & Dining', description: 'Food discussions' },
            entity: { name: 'Pizza', description: 'Pizza debates' }
          }
        ]
      },
      {
        id: '2',
        text: 'Tell me you\'ve never worked retail without telling me you\'ve never worked retail. This take is unhinged.',
        author: {
          username: 'retail_reality',
          name: 'Marcus Johnson',
          verified: true,
          follower_count: 15670
        },
        metrics: {
          retweets: 123,
          likes: 890,
          replies: 234,
          quotes: 156 // Very high engagement + controversy keywords
        },
        created_at: '2024-06-20T13:45:00Z'
      },
      {
        id: '3',
        text: 'Normal tweet about the weather today. Nothing controversial here.',
        author: {
          username: 'weather_person',
          name: 'Weather Update',
          verified: false,
          follower_count: 234
        },
        metrics: {
          retweets: 5,
          likes: 23,
          replies: 2,
          quotes: 1 // Low engagement, no drama
        },
        created_at: '2024-06-20T15:00:00Z'
      }
    ];
  }
}

// Export singleton instance
export const twitterDramaDetector = new TwitterDramaDetector();
export default twitterDramaDetector;