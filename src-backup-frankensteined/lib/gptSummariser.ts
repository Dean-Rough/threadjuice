/**
 * GPT-4 Content Summarizer for ThreadJuice
 * Transforms Reddit threads into engaging, persona-driven articles
 */

import OpenAI from 'openai';
import { config } from './env';
import {
  getPersonaPrompt,
  getContentGuidelines,
  type PersonaName,
} from './prompts';
import { contentValidator, type ValidationResult } from './contentValidator';
import type { RedditPost, RedditComment } from '@/types/reddit';

export interface GeneratedContent {
  hook: string;
  content: ContentBlock[];
  seoTitle: string;
  seoDescription: string;
  suggestedTags: string[];
  estimatedReadTime: number;
}

export interface ContentBlock {
  type:
    | 'paragraph'
    | 'comment_cluster'
    | 'quote_callout'
    | 'wisdom_box'
    | 'relatable_moment'
    | 'absurdity_callout'
    | 'cynic_truth'
    | 'buddy_advice';
  content: string;
  metadata?: {
    source?: string;
    author?: string;
    score?: number;
    sentiment?: number;
    highlight?: string;
  };
}

export interface SummarizationOptions {
  persona: PersonaName;
  contentType: 'article' | 'summary' | 'quiz_intro';
  targetWordCount?: number;
  includeComments?: boolean;
  maxComments?: number;
  streaming?: boolean;
  temperature?: number;
  validateContent?: boolean;
}

export interface SummarizationResult {
  content: GeneratedContent;
  validation?: ValidationResult;
  metadata: {
    tokensUsed: number;
    processingTime: number;
    model: string;
    persona: PersonaName;
  };
}

/**
 * OpenAI GPT-4 integration for content generation
 */
export class GPTSummariser {
  private openai: OpenAI;
  private readonly defaultModel = 'gpt-4-turbo-preview';
  private readonly maxTokens = 4000;
  private readonly defaultTemperature = 0.7;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || config.openai.apiKey,
    });
  }

  /**
   * Generate content from Reddit thread data
   */
  async generateContent(
    redditPost: RedditPost,
    comments: RedditComment[] = [],
    options: SummarizationOptions
  ): Promise<SummarizationResult> {
    const startTime = Date.now();

    try {
      // Validate input data
      const threadValidation =
        contentValidator.validateRedditThread(redditPost);
      if (!threadValidation.isValid) {
        throw new Error(
          `Invalid Reddit thread: ${threadValidation.errors.join(', ')}`
        );
      }

      // Prepare the prompt
      const systemPrompt = this.buildSystemPrompt(options);
      const userPrompt = this.buildUserPrompt(redditPost, comments, options);

      // Generate content using OpenAI
      const completion = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.maxTokens,
        temperature: options.temperature || this.defaultTemperature,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the generated content
      const generatedContent = this.parseGeneratedContent(response);

      // Validate generated content if requested
      let validation: ValidationResult | undefined;
      if (options.validateContent !== false) {
        const contentText = this.extractTextFromContent(generatedContent);
        validation = await contentValidator.validateContent(contentText, {
          minWordCount: options.targetWordCount
            ? options.targetWordCount * 0.8
            : 400,
          maxWordCount: options.targetWordCount
            ? options.targetWordCount * 1.2
            : 1500,
        });
      }

      const processingTime = Date.now() - startTime;

      return {
        content: generatedContent,
        validation,
        metadata: {
          tokensUsed: completion.usage?.total_tokens || 0,
          processingTime,
          model: this.defaultModel,
          persona: options.persona,
        },
      };
    } catch (error) {
      throw new GPTSummariserError(
        `Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_FAILED',
        { redditPostId: redditPost.id, persona: options.persona }
      );
    }
  }

  /**
   * Generate content with streaming support
   */
  async generateContentStream(
    redditPost: RedditPost,
    comments: RedditComment[] = [],
    options: SummarizationOptions,
    onChunk: (chunk: string) => void
  ): Promise<SummarizationResult> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.buildSystemPrompt(options);
      const userPrompt = this.buildUserPrompt(redditPost, comments, options);

      const stream = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.maxTokens,
        temperature: options.temperature || this.defaultTemperature,
        response_format: { type: 'json_object' },
        stream: true,
      });

      let fullResponse = '';
      let tokensUsed = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }

        if (chunk.usage) {
          tokensUsed = chunk.usage.total_tokens;
        }
      }

      const generatedContent = this.parseGeneratedContent(fullResponse);
      const processingTime = Date.now() - startTime;

      return {
        content: generatedContent,
        metadata: {
          tokensUsed,
          processingTime,
          model: this.defaultModel,
          persona: options.persona,
        },
      };
    } catch (error) {
      throw new GPTSummariserError(
        `Streaming generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STREAMING_FAILED',
        { redditPostId: redditPost.id }
      );
    }
  }

  /**
   * Build system prompt based on persona and content type
   */
  private buildSystemPrompt(options: SummarizationOptions): string {
    const personaPrompt = getPersonaPrompt(options.persona);
    const contentGuidelines = getContentGuidelines(
      options.persona,
      options.contentType
    );

    return `${contentGuidelines}

${personaPrompt.contentStructure}

RESPONSE FORMAT:
You must respond with valid JSON in this exact structure:
{
  "hook": "Engaging opening line that captures the essence of the story",
  "content": [
    {
      "type": "paragraph",
      "content": "Main content text"
    },
    {
      "type": "comment_cluster",
      "content": "Commentary on Reddit reactions",
      "metadata": {
        "highlight": "Most interesting comment or reaction"
      }
    }
  ],
  "seoTitle": "SEO-optimized title (60 chars max)",
  "seoDescription": "Meta description (160 chars max)",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "estimatedReadTime": 3
}

IMPORTANT: 
- Always respond with valid JSON only
- Include at least 3 content blocks
- Make the hook compelling and persona-appropriate
- Ensure content flows naturally between blocks
- Include relevant metadata for comment clusters`;
  }

  /**
   * Build user prompt with Reddit thread data
   */
  private buildUserPrompt(
    redditPost: RedditPost,
    comments: RedditComment[],
    options: SummarizationOptions
  ): string {
    let prompt = `Transform this Reddit thread into engaging content:

THREAD DETAILS:
Title: ${redditPost.title}
Subreddit: r/${redditPost.subreddit}
Score: ${redditPost.score} upvotes
Comments: ${redditPost.num_comments}

CONTENT:
${redditPost.selftext || 'No text content - this is a link post'}`;

    if (redditPost.url && redditPost.url !== redditPost.permalink) {
      prompt += `\nURL: ${redditPost.url}`;
    }

    // Add top comments if requested
    if (options.includeComments && comments.length > 0) {
      const topComments = comments
        .filter(c => c.score > 10) // Only include well-received comments
        .sort((a, b) => b.score - a.score)
        .slice(0, options.maxComments || 5);

      if (topComments.length > 0) {
        prompt += '\n\nTOP COMMENTS:\n';
        topComments.forEach((comment, index) => {
          prompt += `${index + 1}. u/${comment.author} (${comment.score} points): ${comment.body}\n`;
        });
      }
    }

    // Add specific instructions based on content type
    if (options.contentType === 'article') {
      prompt += `\n\nCreate a full article (${options.targetWordCount || 800}-word target) that tells this story in an engaging way.`;
    } else if (options.contentType === 'summary') {
      prompt +=
        '\n\nCreate a concise summary that captures the key drama and entertainment value.';
    } else if (options.contentType === 'quiz_intro') {
      prompt +=
        '\n\nCreate an introduction that sets up a quiz about this content.';
    }

    return prompt;
  }

  /**
   * Parse the generated JSON content
   */
  private parseGeneratedContent(response: string): GeneratedContent {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.hook || !parsed.content || !Array.isArray(parsed.content)) {
        throw new Error('Invalid content structure');
      }

      // Ensure all content blocks have required fields
      parsed.content.forEach((block: any, index: number) => {
        if (!block.type || !block.content) {
          throw new Error(`Invalid content block at index ${index}`);
        }
      });

      // Calculate estimated read time if not provided
      if (!parsed.estimatedReadTime) {
        const wordCount =
          this.extractTextFromContent(parsed).split(/\s+/).length;
        parsed.estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute
      }

      return parsed as GeneratedContent;
    } catch (error) {
      throw new GPTSummariserError(
        `Failed to parse generated content: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        'PARSE_ERROR',
        { response: response.substring(0, 500) }
      );
    }
  }

  /**
   * Extract plain text from generated content for validation
   */
  private extractTextFromContent(content: GeneratedContent): string {
    let text = content.hook + '\n\n';

    content.content.forEach(block => {
      text += block.content + '\n\n';
    });

    return text;
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await this.openai.models.list();
      return models.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id)
        .sort();
    } catch (error) {
      throw new GPTSummariserError(
        'Failed to fetch available models',
        'API_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Test the connection to OpenAI
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Custom error class for GPT Summariser
 */
export class GPTSummariserError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'GPTSummariserError';
  }
}

// Export singleton instance
export const gptSummariser = new GPTSummariser();
