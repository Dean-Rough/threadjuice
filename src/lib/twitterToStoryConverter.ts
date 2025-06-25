/**
 * Twitter Drama to ThreadJuice Story Converter
 * Transforms Twitter drama data into our standard story format
 */

import { DramaThread, TwitterDramaData } from './twitterDramaDetector';

interface ThreadJuiceStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  author: string;
  viewCount: number;
  upvoteCount: number;
  commentCount: number;
  shareCount: number;
  bookmarkCount: number;
  trending: boolean;
  featured: boolean;
  status: 'published' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  source: 'twitter_drama';
  twitter_metadata?: {
    original_tweet_id: string;
    drama_score: number;
    controversy_indicators: string[];
    participants: string[];
    topic: string;
  };
}

interface PersonaVoice {
  id: string;
  name: string;
  slug: string;
  tone: string;
  specialties: string[];
}

class TwitterToStoryConverter {
  private personas: PersonaVoice[] = [
    {
      id: 'snarky-sage',
      name: 'The Snarky Sage',
      slug: 'the-snarky-sage',
      tone: 'sarcastic and deadpan with brutal honesty',
      specialties: [
        'tech drama',
        'work drama',
        'food debates',
        'social media fails',
      ],
    },
    {
      id: 'dry-cynic',
      name: 'The Dry Cynic',
      slug: 'the-dry-cynic',
      tone: 'bitterly hilarious with chaos-loving perspective',
      specialties: [
        'political drama',
        'celebrity feuds',
        'internet outrage',
        'culture wars',
      ],
    },
    {
      id: 'down-to-earth-buddy',
      name: 'The Down-to-Earth Buddy',
      slug: 'the-down-to-earth-buddy',
      tone: 'chill and friendly with relatable insights',
      specialties: [
        'relationship drama',
        'family feuds',
        'everyday conflicts',
        'retail drama',
      ],
    },
  ];

  /**
   * Convert Twitter drama to ThreadJuice story format
   */
  async convertDramaToStory(drama: DramaThread): Promise<ThreadJuiceStory> {
    const persona = this.selectPersonaForDrama(drama);
    const title = this.generateViralTitle(drama, persona);
    const excerpt = this.generateExcerpt(drama, persona);
    const category = this.categorizeTwitterDrama(drama);

    // Generate estimated engagement metrics based on Twitter metrics
    const estimatedMetrics = this.estimateEngagementMetrics(drama);

    const story: ThreadJuiceStory = {
      id: `twitter-${drama.original_tweet.id}`,
      title,
      slug: this.generateSlug(title),
      excerpt,
      imageUrl: await this.selectDramaImage(drama, category),
      category,
      author: persona.slug,
      ...estimatedMetrics,
      trending: drama.drama_score > 75,
      featured: drama.drama_score > 85,
      status: 'published',
      createdAt: new Date(drama.original_tweet.created_at),
      updatedAt: new Date(),
      source: 'twitter_drama',
      twitter_metadata: {
        original_tweet_id: drama.original_tweet.id,
        drama_score: drama.drama_score,
        controversy_indicators: drama.controversy_indicators,
        participants: drama.participants,
        topic: drama.topic,
      },
    };

    return story;
  }

  /**
   * Select appropriate persona based on drama type and content
   */
  private selectPersonaForDrama(drama: DramaThread): PersonaVoice {
    const text = drama.original_tweet.text.toLowerCase();

    // Check for tech/work related keywords
    if (
      text.includes('work') ||
      text.includes('boss') ||
      text.includes('job') ||
      text.includes('tech') ||
      text.includes('startup') ||
      text.includes('app')
    ) {
      return this.personas[0]; // Snarky Sage
    }

    // Check for political/celebrity drama keywords
    if (
      text.includes('politics') ||
      text.includes('election') ||
      text.includes('celebrity') ||
      drama.controversy_indicators.some(
        indicator =>
          indicator.includes('unhinged') || indicator.includes('problematic')
      )
    ) {
      return this.personas[1]; // Dry Cynic
    }

    // Default to down-to-earth for everyday drama
    return this.personas[2]; // Down-to-Earth Buddy
  }

  /**
   * Generate viral ThreadJuice-style titles
   */
  private generateViralTitle(
    drama: DramaThread,
    persona: PersonaVoice
  ): string {
    const tweet = drama.original_tweet;
    const topic = drama.topic;

    // Title templates based on persona
    const titleTemplates = {
      'snarky-sage': [
        `Twitter Collectively Lost Its Mind Over ${topic} and I Have Questions`,
        `Someone's ${topic} Take Just Broke the Internet (Spoiler: It's Bad)`,
        `The ${topic} Debate That Made Everyone Forget How to Be Normal`,
        `Twitter User's ${topic} Opinion Triggers Mass Existential Crisis`,
      ],
      'dry-cynic': [
        `${topic} Drama Proves Humanity Was a Mistake All Along`,
        `Twitter Discovers New Ways to Fight About ${topic}, Chaos Ensues`,
        `The ${topic} Controversy That Made Me Lose Faith in Everything`,
        `How a Simple ${topic} Tweet Started World War III (Online Edition)`,
      ],
      'down-to-earth-buddy': [
        `Why Everyone's Fighting About ${topic} (Spoiler: Nobody Wins)`,
        `The ${topic} Drama That United Twitter in Pure Confusion`,
        `Someone Made a ${topic} Take So Wild, Twitter Couldn't Even`,
        `${topic} Discourse Reached Peak Absurdity and We All Witnessed It`,
      ],
    };

    const templates =
      titleTemplates[persona.id as keyof typeof titleTemplates] ||
      titleTemplates['snarky-sage'];
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    return randomTemplate;
  }

  /**
   * Generate engaging excerpt that captures the drama
   */
  private generateExcerpt(drama: DramaThread, persona: PersonaVoice): string {
    const tweet = drama.original_tweet;
    const metrics = tweet.metrics;

    const excerptTemplates = {
      'snarky-sage': [
        `What started as a simple tweet about ${drama.topic} somehow escalated into ${metrics.replies} replies of pure chaos. The internet never disappoints.`,
        `One person's hot take managed to generate ${metrics.quotes} quote tweets of increasingly unhinged responses. Peak Twitter energy right here.`,
        `${metrics.likes} people liked this take, ${metrics.replies} people lost their minds over it. The math checks out for modern discourse.`,
      ],
      'dry-cynic': [
        `Another day, another Twitter meltdown over ${drama.topic}. ${metrics.replies} replies later, nobody learned anything and everyone's angrier.`,
        `Watching ${metrics.quotes} quote tweets tear apart one person's opinion about ${drama.topic} reminds me why I love watching civilization crumble.`,
        `The ${metrics.likes} likes vs ${metrics.replies} replies ratio tells you everything about how this absolute trainwreck unfolded.`,
      ],
      'down-to-earth-buddy': [
        `Sometimes Twitter drama gives us a glimpse into the human condition. This ${drama.topic} debate with ${metrics.replies} replies is one of those times.`,
        `What happens when ${metrics.quotes} people quote tweet the same controversial ${drama.topic} opinion? Exactly what you'd expect, honestly.`,
        `${metrics.likes} people agreed, ${metrics.replies} people didn't, and somehow we all learned something about online discourse today.`,
      ],
    };

    const templates =
      excerptTemplates[persona.id as keyof typeof excerptTemplates] ||
      excerptTemplates['snarky-sage'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Categorize Twitter drama into ThreadJuice categories
   */
  private categorizeTwitterDrama(drama: DramaThread): string {
    const text = drama.original_tweet.text.toLowerCase();
    const topic = drama.topic.toLowerCase();

    // Map Twitter content to our categories
    if (
      text.includes('work') ||
      text.includes('job') ||
      text.includes('boss') ||
      text.includes('office')
    ) {
      return 'Work Drama';
    }

    if (
      text.includes('food') ||
      text.includes('pizza') ||
      text.includes('restaurant') ||
      text.includes('cooking')
    ) {
      return 'Food Wars';
    }

    if (
      text.includes('dating') ||
      text.includes('relationship') ||
      text.includes('marriage') ||
      text.includes('boyfriend')
    ) {
      return 'Dating Disasters';
    }

    if (
      text.includes('family') ||
      text.includes('parent') ||
      text.includes('mom') ||
      text.includes('dad')
    ) {
      return 'Family Drama';
    }

    if (
      text.includes('tech') ||
      text.includes('app') ||
      text.includes('phone') ||
      text.includes('social media')
    ) {
      return 'Tech Nightmares';
    }

    if (
      text.includes('retail') ||
      text.includes('customer') ||
      text.includes('service') ||
      text.includes('store')
    ) {
      return 'Public Freakouts';
    }

    // Default category for general Twitter drama
    return 'Social Media Chaos';
  }

  /**
   * Estimate engagement metrics based on Twitter data
   */
  private estimateEngagementMetrics(drama: DramaThread) {
    const twitter_metrics = drama.original_tweet.metrics;

    // Convert Twitter engagement to ThreadJuice metrics with realistic scaling
    const scale_factor = 0.1; // Assume 10% of Twitter engagement translates to site engagement

    return {
      viewCount: Math.round(
        (twitter_metrics.likes +
          twitter_metrics.retweets +
          twitter_metrics.replies) *
          2
      ),
      upvoteCount: Math.round(twitter_metrics.likes * scale_factor),
      commentCount: Math.round(twitter_metrics.replies * scale_factor),
      shareCount: Math.round(twitter_metrics.retweets * scale_factor),
      bookmarkCount: Math.round(twitter_metrics.likes * scale_factor * 0.3),
    };
  }

  /**
   * Generate URL slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60)
      .replace(/-$/, '');
  }

  /**
   * Select appropriate image for drama type
   */
  private async selectDramaImage(
    drama: DramaThread,
    category: string
  ): Promise<string> {
    // Map categories to appropriate Unsplash images
    const imageMap: Record<string, string[]> = {
      'Work Drama': [
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800', // Office
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', // Meeting
      ],
      'Food Wars': [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', // Pizza
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800', // Food
      ],
      'Tech Nightmares': [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', // Phone
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800', // Social media
      ],
      'Social Media Chaos': [
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', // Social media
        'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800', // Chaos/argument
      ],
    };

    const images = imageMap[category] || imageMap['Social Media Chaos'];
    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * Convert multiple drama threads to stories
   */
  async convertMultipleDramas(
    dramas: DramaThread[]
  ): Promise<ThreadJuiceStory[]> {
    const stories = await Promise.all(
      dramas.map(drama => this.convertDramaToStory(drama))
    );

    return stories.filter(story => story.twitter_metadata!.drama_score >= 60);
  }
}

// Export singleton instance
export const twitterToStoryConverter = new TwitterToStoryConverter();
export default twitterToStoryConverter;
