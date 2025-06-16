import { Configuration, OpenAIApi } from 'openai';
import { env } from './env';
import { openaiRateLimiter } from './rateLimiter';
import { generateContentPrompt, getPersonaPrompt } from './prompts';
import { contentValidator, type ContentValidationResult } from './contentValidator';
import type { ProcessedRedditPost, ProcessedRedditComment } from '@/types/reddit';

/**
 * GPT-4 content summarizer with persona-based prompts
 */

export interface SummarizationOptions {
  personaId: string;
  includeComments?: boolean;
  maxComments?: number;
  temperature?: number;
  maxTokens?: number;
  validateOutput?: boolean;
}

export interface SummarizationResult {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  validation?: ContentValidationResult;
  metadata: {
    personaId: string;
    wordCount: number;
    processingTime: number;
    model: string;
    temperature: number;
  };
}

export class GPTSummariser {
  private openai: OpenAIApi;
  private defaultModel = 'gpt-4-turbo-preview';

  constructor() {
    const configuration = new Configuration({
      apiKey: env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Summarize Reddit post with persona-based voice
   */
  async summarizePost(
    post: ProcessedRedditPost,
    comments: ProcessedRedditComment[] = [],
    options: SummarizationOptions
  ): Promise<SummarizationResult> {
    const startTime = Date.now();

    try {
      // Validate persona
      const persona = getPersonaPrompt(options.personaId);
      if (!persona) {
        throw new Error(`Unknown persona: ${options.personaId}`);
      }

      // Prepare comment data
      const topComments = comments
        .sort((a, b) => b.score - a.score)
        .slice(0, options.maxComments || 10)
        .map(comment => ({
          author: comment.author,
          content: comment.content,
          score: comment.score,
        }));

      // Generate content prompt
      const prompt = generateContentPrompt(options.personaId, {
        title: post.title,
        content: post.content,
        comments: topComments,
        subreddit: post.subreddit,
        score: post.score,
      });

      console.log(`🤖 Generating content with ${persona.name} for "${post.title}"`);

      // Make OpenAI request with rate limiting
      const completion = await openaiRateLimiter.executeWithBackoff(async () => {
        return this.openai.createChatCompletion({
          model: this.defaultModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.1,
        });
      });

      const rawContent = completion.data.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('OpenAI returned empty content');
      }

      // Parse and structure the content
      const structuredContent = this.parseGeneratedContent(rawContent, post.title);

      // Validate content if requested
      let validation: ContentValidationResult | undefined;
      if (options.validateOutput !== false) {
        validation = contentValidator.validate(structuredContent.content, structuredContent.title);
        
        if (!validation.isValid) {
          console.warn(`⚠️ Content validation failed for "${post.title}":`, validation.issues);
        }
      }

      const processingTime = Date.now() - startTime;

      console.log(`✅ Generated ${structuredContent.wordCount} words in ${processingTime}ms`);

      return {
        ...structuredContent,
        validation,
        metadata: {
          personaId: options.personaId,
          wordCount: structuredContent.wordCount,
          processingTime,
          model: this.defaultModel,
          temperature: options.temperature || 0.7,
        },
      };

    } catch (error) {
      console.error('❌ GPT summarization failed:', error);
      throw error;
    }
  }

  /**
   * Generate quiz questions for a post
   */
  async generateQuiz(
    post: ProcessedRedditPost,
    options: { questionCount?: number; difficulty?: 'easy' | 'medium' | 'hard' } = {}
  ): Promise<{
    title: string;
    description: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  }> {
    const { questionCount = 5, difficulty = 'medium' } = options;

    const prompt = `Create a fun quiz based on this Reddit post. Make it engaging and test readers' understanding of the story and social dynamics.

POST TITLE: ${post.title}
POST CONTENT: ${post.content}
SUBREDDIT: r/${post.subreddit}

Generate a JSON response with:
- title: Catchy quiz title
- description: Brief description of what the quiz tests
- questions: Array of ${questionCount} multiple choice questions

Each question should:
- Be interesting and test comprehension
- Have 4 answer options
- Include the correct answer index (0-3)
- Have a brief explanation of the correct answer

Difficulty level: ${difficulty}
Make it fun but informative!`;

    try {
      const completion = await openaiRateLimiter.executeWithBackoff(async () => {
        return this.openai.createChatCompletion({
          model: this.defaultModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 1500,
        });
      });

      const rawContent = completion.data.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('OpenAI returned empty quiz content');
      }

      return JSON.parse(rawContent);
    } catch (error) {
      console.error('❌ Quiz generation failed:', error);
      throw error;
    }
  }

  /**
   * Parse generated content into structured format
   */
  private parseGeneratedContent(content: string, originalTitle: string): {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
    wordCount: number;
  } {
    // Try to extract title from content if it starts with a headline
    let title = originalTitle;
    let mainContent = content;

    const titleMatch = content.match(/^#\s*(.+?)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      mainContent = content.replace(/^#\s*.+$/m, '').trim();
    }

    // Generate excerpt (first paragraph or first 200 characters)
    const firstParagraph = mainContent.split('\n\n')[0];
    const excerpt = firstParagraph.length > 200 
      ? firstParagraph.substring(0, 197) + '...'
      : firstParagraph;

    // Generate tags based on content analysis
    const tags = this.extractTags(mainContent, title);

    // Generate SEO optimized title and description
    const seoTitle = title.length <= 60 ? title : title.substring(0, 57) + '...';
    const seoDescription = excerpt.length <= 160 ? excerpt : excerpt.substring(0, 157) + '...';

    const wordCount = mainContent.split(/\s+/).filter(word => word.length > 0).length;

    return {
      title,
      content: mainContent,
      excerpt,
      tags,
      seoTitle,
      seoDescription,
      wordCount,
    };
  }

  /**
   * Extract relevant tags from content
   */
  private extractTags(content: string, title: string): string[] {
    const text = (content + ' ' + title).toLowerCase();
    const tags: string[] = [];

    // Predefined tag categories
    const tagCategories = {
      platforms: ['reddit', 'tiktok', 'instagram', 'twitter', 'facebook', 'youtube'],
      relationships: ['relationship', 'dating', 'marriage', 'family', 'friendship', 'roommate'],
      work: ['work', 'job', 'office', 'boss', 'colleague', 'career', 'workplace'],
      drama: ['drama', 'conflict', 'argument', 'fight', 'confrontation'],
      emotions: ['wholesome', 'heartwarming', 'frustrating', 'hilarious', 'shocking'],
      topics: ['aita', 'tifu', 'confession', 'advice', 'story', 'update'],
    };

    // Check for category matches
    Object.entries(tagCategories).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          tags.push(keyword);
        }
      });
    });

    // Remove duplicates and limit to 5 tags
    return [...new Set(tags)].slice(0, 5);
  }

  /**
   * Batch summarize multiple posts
   */
  async summarizeBatch(
    posts: Array<{
      post: ProcessedRedditPost;
      comments: ProcessedRedditComment[];
      options: SummarizationOptions;
    }>,
    batchOptions: { concurrency?: number; delayBetween?: number } = {}
  ): Promise<SummarizationResult[]> {
    const { concurrency = 3, delayBetween = 1000 } = batchOptions;
    const results: SummarizationResult[] = [];

    console.log(`🔄 Batch processing ${posts.length} posts with concurrency ${concurrency}`);

    // Process in batches to respect rate limits
    for (let i = 0; i < posts.length; i += concurrency) {
      const batch = posts.slice(i, i + concurrency);
      
      const batchPromises = batch.map(({ post, comments, options }) =>
        this.summarizePost(post, comments, options)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`❌ Failed to process post ${i + index}:`, result.reason);
        }
      });

      // Delay between batches to respect rate limits
      if (i + concurrency < posts.length && delayBetween > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetween));
      }
    }

    console.log(`✅ Batch processing complete: ${results.length}/${posts.length} successful`);
    return results;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus() {
    return openaiRateLimiter.getStatus();
  }
}

// Export singleton instance
export const gptSummariser = new GPTSummariser();