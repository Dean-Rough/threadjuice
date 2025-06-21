import OpenAI from 'openai';
import { RedditPost, RedditComment } from './redditClient';
import { z } from 'zod';
import { generateContentPrompt, WRITER_PERSONAS } from './promptTemplates';

// Flexible section types for dynamic content structure
const SectionTypes = z.enum([
  'image', // Hero image with description
  'describe-1', // First descriptive narrative section
  'describe-2', // Second descriptive narrative section
  'comments-1', // First Reddit comments showcase
  'comments-2', // Second Reddit comments showcase
  'discussion', // Podcast-style conversational analysis
  'outro', // Conclusion and call-to-action
  'quiz', // Interactive quiz based on story
]);

// Schema for individual content sections
const ContentSectionSchema = z.object({
  type: SectionTypes,
  title: z.string().optional(), // Optional section heading
  content: z.string(), // Main section content
  metadata: z
    .object({
      comments: z
        .array(
          z.object({
            // For comment sections
            author: z.string(),
            content: z.string(),
            score: z.number(),
            replies: z.number().optional(),
          })
        )
        .optional(),
      quiz_data: z
        .object({
          // For quiz sections
          question: z.string(),
          options: z.array(z.string()),
          correct_answer: z.number(),
          explanation: z.string(),
        })
        .optional(),
      image_prompt: z.string().optional(), // For image sections
      discussion_participants: z.array(z.string()).optional(), // For discussion sections
    })
    .optional(),
});

// Updated schema for flexible content structure
const TransformedContentSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  category: z.string(),
  persona: z.enum([
    'the-snarky-sage',
    'the-down-to-earth-buddy',
    'the-dry-cynic',
  ]),
  content: z.object({
    sections: z.array(ContentSectionSchema).min(3).max(8), // Dynamic 3-8 sections
    story_flow: z
      .enum(['linear', 'buildup', 'revelation', 'discussion'])
      .optional(),
  }),
  tags: z.array(z.string()),
  viral_score: z.number().min(1).max(10),
  image_keywords: z.array(z.string()),
  entities: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum([
          'celebrity',
          'brand',
          'company',
          'product',
          'location',
          'person',
        ]),
        confidence: z.number().min(0).max(1),
        wikipedia_title: z.string().optional(),
      })
    )
    .optional(),
});

export type TransformedContent = z.infer<typeof TransformedContentSchema>;

interface PersonaConfig {
  name: string;
  tone: string;
  systemPrompt: string;
  categories: string[];
}

// Legacy persona configs - now using modular prompts from promptTemplates.ts
const PERSONAS: Record<string, PersonaConfig> = {
  'the-snarky-sage': {
    name: 'The Snarky Sage',
    tone: 'Sarcastic and deadpan with a love for chaos',
    categories: ['aita', 'revenge', 'malicious-compliance', 'choosing-beggars'],
    systemPrompt: '', // Now using modular prompts
  },
  'the-down-to-earth-buddy': {
    name: 'The Down-to-Earth Buddy',
    tone: 'Chill and friendly with relatable insights',
    categories: ['relationships', 'tifu', 'advice'],
    systemPrompt: '', // Now using modular prompts
  },
  'the-dry-cynic': {
    name: 'The Dry Cynic',
    tone: 'Bitterly hilarious with a chaos-loving perspective',
    categories: ['work-stories', 'entitled-parents', 'mildly-infuriating'],
    systemPrompt: '', // Now using modular prompts
  },
};

export class ContentTransformer {
  private openai: OpenAI;

  constructor() {
    // Import env dynamically to avoid circular dependency
    const { env } = require('./env');
    
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Select the best persona for the content based on subreddit and content tone
   */
  private selectPersona(post: RedditPost): keyof typeof WRITER_PERSONAS {
    const subreddit = post.subreddit.toLowerCase();

    // Map subreddits to personas using modular persona data
    if (
      [
        'aita',
        'choosingbeggars',
        'pettyrevenge',
        'maliciouscompliance',
      ].includes(subreddit)
    ) {
      return 'the-snarky-sage';
    }

    if (
      ['relationship_advice', 'tifu', 'advice', 'relationships'].includes(
        subreddit
      )
    ) {
      return 'the-down-to-earth-buddy';
    }

    if (
      ['antiwork', 'entitledparents', 'mildlyinfuriating', 'facepalm'].includes(
        subreddit
      )
    ) {
      return 'the-dry-cynic';
    }

    // Default based on content sentiment
    const title = post.title.toLowerCase();
    if (
      title.includes('aita') ||
      title.includes('am i') ||
      title.includes('wrong')
    ) {
      return 'the-snarky-sage';
    }

    return 'the-down-to-earth-buddy'; // Default persona
  }

  /**
   * Determine category based on subreddit and content
   */
  private determineCategory(post: RedditPost): string {
    const subreddit = post.subreddit.toLowerCase();

    const categoryMap: Record<string, string> = {
      aita: 'aita',
      amittheasshole: 'aita',
      pettyrevenge: 'revenge',
      prorevenge: 'revenge',
      maliciouscompliance: 'malicious-compliance',
      relationship_advice: 'relationships',
      relationships: 'relationships',
      tifu: 'funny',
      entitledparents: 'work-stories',
      antiwork: 'work-stories',
      choosingbeggars: 'funny',
      bridezillas: 'relationships',
      mildlyinfuriating: 'news',
      facepalm: 'funny',
    };

    return categoryMap[subreddit] || 'news';
  }

  /**
   * Generate viral headline with emoji
   */
  private async generateViralHeadline(
    post: RedditPost,
    persona: PersonaConfig
  ): Promise<string> {
    const prompt = `Transform this Reddit title into a viral ThreadJuice headline in ${persona.name}'s voice:

Original: "${post.title}"

Requirements:
- Start with a relevant emoji (🚨, 😱, 💀, 🤡, etc.)
- Make it clickbait but not misleading
- Use ${persona.tone} tone
- Keep under 100 characters
- Make it shareable and engaging

Return ONLY the headline, nothing else.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 100,
    });

    return response.choices[0]?.message?.content?.trim() || post.title;
  }

  /**
   * Transform Reddit post and comments into ThreadJuice content
   */
  async transformContent(
    post: RedditPost,
    comments: RedditComment[]
  ): Promise<TransformedContent> {
    const personaKey = this.selectPersona(post);
    const persona = PERSONAS[personaKey];
    const category = this.determineCategory(post);

    // Generate modular prompt using new system
    const prompt = generateContentPrompt(personaKey, category, post, comments);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('No content generated from OpenAI');
      }

      // Parse and validate the JSON response
      const parsed = JSON.parse(content);
      const validated = TransformedContentSchema.parse(parsed);

      // Generate slug if not provided or invalid
      if (!validated.slug || validated.slug.length < 5) {
        validated.slug = validated.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 100);
      }

      return validated;
    } catch (error) {
      console.error('Content transformation failed:', error);

      // Fallback to basic transformation
      return this.createFallbackContent(post, personaKey, category);
    }
  }

  /**
   * Create fallback content if GPT transformation fails
   */
  private createFallbackContent(
    post: RedditPost,
    personaKey: string,
    category: string
  ): TransformedContent {
    const persona = PERSONAS[personaKey];

    const title = `🚨 ${post.title}`;
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    return {
      title,
      slug,
      excerpt: `A wild story from r/${post.subreddit} that you have to read to believe.`,
      category,
      persona: personaKey as any,
      content: {
        sections: [
          {
            type: 'image',
            content: `A dramatic scene capturing the essence of this wild Reddit story`,
            metadata: {
              image_prompt: `${category} drama story reddit ${post.subreddit}`,
            },
          },
          {
            type: 'describe-1',
            content: `Here's a story that's been trending on Reddit that'll make you question everything. ${post.selftext || 'This story has everyone talking...'}`,
          },
          {
            type: 'outro',
            content: `What do you think about this situation? Share your thoughts and let us know if you've ever been in a similar position!`,
          },
        ],
        story_flow: 'linear',
      },
      tags: [category, post.subreddit, 'viral', 'reddit'],
      viral_score: Math.min(Math.floor(post.score / 200) + 3, 10),
      image_keywords: [category, post.subreddit, 'drama', 'story'],
      entities: [], // No entity detection for fallback content
    };
  }

  /**
   * Batch transform multiple posts
   */
  async transformMultiplePosts(
    postsWithComments: Array<{ post: RedditPost; comments: RedditComment[] }>
  ): Promise<TransformedContent[]> {
    const results: TransformedContent[] = [];

    for (const { post, comments } of postsWithComments) {
      try {
        const transformed = await this.transformContent(post, comments);
        results.push(transformed);

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to transform post ${post.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Validate content quality before publishing
   */
  validateContent(content: TransformedContent): boolean {
    // Quality checks
    const hasGoodTitle =
      content.title.length > 10 && content.title.length < 150;
    const hasExcerpt = content.excerpt.length > 20;
    const hasContent = content.content.sections.length >= 3;
    const hasViralPotential = content.viral_score >= 5;

    return hasGoodTitle && hasExcerpt && hasContent && hasViralPotential;
  }
}

// Export singleton
export const contentTransformer = new ContentTransformer();
