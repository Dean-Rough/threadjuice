/**
 * OpenAI GPT Adapter for Pipeline Integration
 * 
 * Bridges the existing GPTSummariser with the pipeline architecture.
 * Handles story generation, summarization, and content enhancement.
 */

import { gptSummariser, GPTSummariser, SummarizationResult } from '@/lib/gptSummariser';
import { ProcessedRedditPost, ProcessedRedditComment } from '@/types/reddit';
import { RedditStoryContext, AIStoryContext } from '../core/PipelineContext';

export interface StoryGenerationOptions {
  personaId: string;
  temperature?: number;
  maxTokens?: number;
  includeComments?: boolean;
  validateOutput?: boolean;
}

export interface GeneratedStory {
  title: string;
  content: string;
  sections: StorySection[];
  metadata: {
    wordCount: number;
    personaId: string;
    processingTime: number;
  };
}

export interface StorySection {
  type: 'intro' | 'describe' | 'discussion' | 'commentary' | 'outro';
  title: string;
  content: string;
  wordCount?: number;
}

export class OpenAIAdapter {
  private summariser: GPTSummariser;

  constructor() {
    this.summariser = gptSummariser;
  }

  /**
   * Generate a story from Reddit content
   */
  async generateRedditStory(
    context: RedditStoryContext,
    comments: ProcessedRedditComment[],
    options: StoryGenerationOptions
  ): Promise<GeneratedStory> {
    const startTime = Date.now();

    try {
      // Use the summariser to generate content
      const result = await this.summariser.summarizePost(
        context.source.rawData,
        comments,
        {
          personaId: options.personaId,
          includeComments: options.includeComments !== false,
          maxComments: 10,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2000,
          validateOutput: options.validateOutput !== false,
        }
      );

      // Transform the result into story sections
      const sections = this.parseIntoSections(result);

      console.log(`✅ Generated story with ${sections.length} sections (${result.metadata.wordCount} words)`);

      return {
        title: result.title,
        content: result.content,
        sections,
        metadata: {
          wordCount: result.metadata.wordCount,
          personaId: result.metadata.personaId,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('❌ Story generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a story from AI prompt
   */
  async generateAIStory(
    context: AIStoryContext,
    options: StoryGenerationOptions
  ): Promise<GeneratedStory> {
    const startTime = Date.now();

    try {
      // Create a mock Reddit post structure for the summarizer
      const mockPost: ProcessedRedditPost = {
        redditId: `ai-${Date.now()}`,
        title: context.source.rawData.prompt,
        content: '', // AI will generate this
        url: '',
        permalink: '',
        subreddit: context.source.rawData.category,
        author: 'AI',
        score: 0,
        upvoteRatio: 1,
        commentCount: 0,
        createdAt: new Date(),
        isVideo: false,
        isNsfw: false,
        rawData: context.source.rawData,
      };

      const result = await this.summariser.summarizePost(
        mockPost,
        [],
        {
          personaId: options.personaId,
          temperature: options.temperature || 0.8, // Higher creativity for AI stories
          maxTokens: options.maxTokens || 3000,
          validateOutput: options.validateOutput !== false,
        }
      );

      const sections = this.parseIntoSections(result);

      console.log(`✅ Generated AI story with ${sections.length} sections`);

      return {
        title: result.title,
        content: result.content,
        sections,
        metadata: {
          wordCount: result.metadata.wordCount,
          personaId: result.metadata.personaId,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('❌ AI story generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a quiz from content
   */
  async generateQuiz(
    post: ProcessedRedditPost,
    options: { difficulty?: 'easy' | 'medium' | 'hard'; questionCount?: number } = {}
  ) {
    try {
      const quiz = await this.summariser.generateQuiz(post, options);
      console.log(`✅ Generated quiz with ${quiz.questions.length} questions`);
      return quiz;
    } catch (error) {
      console.error('❌ Quiz generation failed:', error);
      throw error;
    }
  }

  /**
   * Parse GPT content into structured sections
   */
  private parseIntoSections(result: SummarizationResult): StorySection[] {
    const sections: StorySection[] = [];
    const content = result.content;

    // Split content by double newlines or markdown headers
    const parts = content.split(/\n\n+|(?=^#{1,3}\s)/m).filter(part => part.trim());

    for (const part of parts) {
      const section = this.identifySection(part);
      if (section) {
        sections.push(section);
      }
    }

    // Ensure we have at least basic sections
    if (sections.length === 0) {
      sections.push({
        type: 'describe',
        title: 'The Story',
        content: content,
        wordCount: content.split(/\s+/).length,
      });
    }

    return sections;
  }

  /**
   * Identify section type from content
   */
  private identifySection(content: string): StorySection | null {
    // Remove markdown headers
    const cleanContent = content.replace(/^#{1,3}\s+/, '');
    const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length < 10) return null; // Skip very short sections

    // Identify section type based on content patterns
    let type: StorySection['type'] = 'describe';
    let title = 'The Story Continues';

    const lowerContent = cleanContent.toLowerCase();

    if (lowerContent.includes('began') || lowerContent.includes('started') || words.length < 50) {
      type = 'intro';
      title = 'The Setup';
    } else if (lowerContent.includes('reddit') || lowerContent.includes('comment') || lowerContent.includes('replied')) {
      type = 'discussion';
      title = 'The Internet Reacts';
    } else if (lowerContent.includes('terry') || lowerContent.includes('honestly') || lowerContent.includes('let me tell you')) {
      type = 'commentary';
      title = "The Terry's Take";
    } else if (lowerContent.includes('ended') || lowerContent.includes('finally') || lowerContent.includes('conclusion')) {
      type = 'outro';
      title = 'The Aftermath';
    }

    // Extract title from markdown headers if present
    const headerMatch = content.match(/^#{1,3}\s+(.+)$/m);
    if (headerMatch) {
      title = headerMatch[1].trim();
    }

    return {
      type,
      title,
      content: cleanContent,
      wordCount: words.length,
    };
  }

  /**
   * Batch process multiple stories
   */
  async batchGenerateStories(
    items: Array<{
      context: RedditStoryContext | AIStoryContext;
      comments?: ProcessedRedditComment[];
      options: StoryGenerationOptions;
    }>,
    concurrency: number = 2
  ): Promise<GeneratedStory[]> {
    const results: GeneratedStory[] = [];

    // Process in batches to respect rate limits
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      
      const batchPromises = batch.map(({ context, comments, options }) => {
        if (context instanceof RedditStoryContext) {
          return this.generateRedditStory(context, comments || [], options);
        } else {
          return this.generateAIStory(context as AIStoryContext, options);
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch story generation failed:', result.reason);
        }
      }

      // Rate limit between batches
      if (i + concurrency < items.length) {
        await this.delay(2000);
      }
    }

    console.log(`✅ Batch generated ${results.length}/${items.length} stories`);
    return results;
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return this.summariser.getRateLimitStatus();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const openAIAdapter = new OpenAIAdapter();