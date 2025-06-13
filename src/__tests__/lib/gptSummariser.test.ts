import { 
  GPTSummariser, 
  gptSummariser,
  GPTSummariserError,
  type SummarizationOptions,
  type GeneratedContent 
} from '@/lib/gptSummariser';
import type { RedditPost, RedditComment } from '@/types/reddit';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      },
      models: {
        list: jest.fn()
      }
    }))
  };
});

// Mock content validator
jest.mock('@/lib/contentValidator', () => ({
  contentValidator: {
    validateRedditThread: jest.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
      score: 85,
      metadata: { wordCount: 100, readabilityScore: 75, sentimentScore: 0.6, flaggedTerms: [] }
    }),
    validateContent: jest.fn().mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: [],
      score: 90,
      metadata: { wordCount: 500, readabilityScore: 80, sentimentScore: 0.7, flaggedTerms: [] }
    })
  }
}));

describe('GPTSummariser', () => {
  let summariser: GPTSummariser;
  let mockOpenAI: any;

  const mockRedditPost: RedditPost = {
    id: 'test123',
    title: 'TIFU by accidentally becoming a crypto millionaire',
    selftext: 'So there I was, trying to order pizza at 2 AM...',
    score: 1500,
    num_comments: 250,
    subreddit: 'tifu',
    author: 'testuser',
    created_utc: 1640995200,
    permalink: '/r/tifu/comments/test123/',
    url: 'https://reddit.com/r/tifu/comments/test123/',
    upvote_ratio: 0.95,
    over_18: false,
    spoiler: false,
    locked: false,
    stickied: false,
    is_self: true,
    domain: 'self.tifu',
    thumbnail: '',
    link_flair_text: null,
    link_flair_css_class: null,
    gilded: 0,
    archived: false,
    no_follow: false,
    is_crosspostable: true,
    pinned: false,
    all_awardings: [],
    media: null,
    secure_media: null,
    is_video: false,
    media_embed: {},
    secure_media_embed: {}
  };

  const mockComments: RedditComment[] = [
    {
      id: 'comment1',
      author: 'commenter1',
      body: 'This is hilarious! Thanks for sharing.',
      score: 150,
      created_utc: 1640995300,
      parent_id: 'test123',
      link_id: 'test123',
      subreddit: 'tifu',
      permalink: '/r/tifu/comments/test123/comment1/',
      depth: 0,
      is_submitter: false,
      stickied: false,
      score_hidden: false,
      locked: false,
      gilded: 0,
      archived: false,
      no_follow: false,
      send_replies: true,
      collapsed: false,
      replies: []
    }
  ];

  const mockGeneratedContent: GeneratedContent = {
    hook: "Another tale from the digital wasteland where pizza orders become life-changing financial decisions.",
    content: [
      {
        type: "paragraph",
        content: "So apparently, ordering pizza at 2 AM can accidentally make you rich. I wish I was making this up."
      },
      {
        type: "comment_cluster",
        content: "The comments section was exactly what you'd expect - a mix of disbelief and jealousy.",
        metadata: {
          highlight: "One commenter said they're switching to Bitcoin for all food orders now."
        }
      }
    ],
    seoTitle: "Redditor Accidentally Becomes Crypto Millionaire Ordering Pizza",
    seoDescription: "A hilarious TIFU story about how a late-night pizza craving turned into cryptocurrency riches through a simple mistake.",
    suggestedTags: ["crypto", "bitcoin", "tifu", "pizza", "accident"],
    estimatedReadTime: 3
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked OpenAI instance
    const OpenAI = require('openai').default;
    mockOpenAI = new OpenAI();
    
    // Set up default mock responses
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify(mockGeneratedContent)
        }
      }],
      usage: {
        total_tokens: 1500
      }
    });
    
    mockOpenAI.models.list.mockResolvedValue({
      data: [
        { id: 'gpt-4-turbo-preview' },
        { id: 'gpt-3.5-turbo' }
      ]
    });
    
    summariser = new GPTSummariser();
  });

  describe('Constructor', () => {
    it('should create a new instance', () => {
      expect(summariser).toBeInstanceOf(GPTSummariser);
    });

    it('should export a singleton instance', () => {
      expect(gptSummariser).toBeInstanceOf(GPTSummariser);
    });

    it('should accept custom API key', () => {
      const customSummariser = new GPTSummariser('custom-key');
      expect(customSummariser).toBeInstanceOf(GPTSummariser);
    });
  });

  describe('generateContent', () => {
    const defaultOptions: SummarizationOptions = {
      persona: 'The Snarky Sage',
      contentType: 'article',
      includeComments: true,
      validateContent: true
    };

    // Mock responses are set up in the main beforeEach

    it('should generate content successfully', async () => {
      const result = await summariser.generateContent(mockRedditPost, mockComments, defaultOptions);

      expect(result.content).toEqual(mockGeneratedContent);
      expect(result.metadata.tokensUsed).toBe(1500);
      expect(result.metadata.persona).toBe('The Snarky Sage');
      expect(result.validation).toBeDefined();
    });

    it('should handle different personas', async () => {
      const buddyOptions: SummarizationOptions = {
        ...defaultOptions,
        persona: 'The Down-to-Earth Buddy'
      };

      await summariser.generateContent(mockRedditPost, mockComments, buddyOptions);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Down-to-Earth Buddy')
            })
          ])
        })
      );
    });

    it('should handle different content types', async () => {
      const summaryOptions: SummarizationOptions = {
        ...defaultOptions,
        contentType: 'summary'
      };

      await summariser.generateContent(mockRedditPost, mockComments, summaryOptions);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('concise summary')
            })
          ])
        })
      );
    });

    it('should include comments when requested', async () => {
      await summariser.generateContent(mockRedditPost, mockComments, {
        ...defaultOptions,
        includeComments: true,
        maxComments: 5
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('TOP COMMENTS')
            })
          ])
        })
      );
    });

    it('should exclude comments when not requested', async () => {
      await summariser.generateContent(mockRedditPost, mockComments, {
        ...defaultOptions,
        includeComments: false
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.not.stringContaining('TOP COMMENTS')
            })
          ])
        })
      );
    });

    it('should handle custom temperature', async () => {
      await summariser.generateContent(mockRedditPost, mockComments, {
        ...defaultOptions,
        temperature: 0.9
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.9
        })
      );
    });

    it('should skip validation when disabled', async () => {
      const result = await summariser.generateContent(mockRedditPost, mockComments, {
        ...defaultOptions,
        validateContent: false
      });

      expect(result.validation).toBeUndefined();
    });

    it('should handle OpenAI API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(
        summariser.generateContent(mockRedditPost, mockComments, defaultOptions)
      ).rejects.toThrow(GPTSummariserError);
    });

    it('should handle empty OpenAI response', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [],
        usage: { total_tokens: 0 }
      });

      await expect(
        summariser.generateContent(mockRedditPost, mockComments, defaultOptions)
      ).rejects.toThrow(GPTSummariserError);
    });

    it('should handle invalid JSON response', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }],
        usage: { total_tokens: 100 }
      });

      await expect(
        summariser.generateContent(mockRedditPost, mockComments, defaultOptions)
      ).rejects.toThrow(GPTSummariserError);
    });

    it('should calculate estimated read time if not provided', async () => {
      const contentWithoutReadTime = { ...mockGeneratedContent };
      delete contentWithoutReadTime.estimatedReadTime;

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(contentWithoutReadTime)
          }
        }],
        usage: { total_tokens: 1000 }
      });

      const result = await summariser.generateContent(mockRedditPost, mockComments, defaultOptions);

      expect(result.content.estimatedReadTime).toBeGreaterThan(0);
    });
  });

  describe('generateContentStream', () => {
    const defaultOptions: SummarizationOptions = {
      persona: 'The Snarky Sage',
      contentType: 'article'
    };

    it('should handle streaming responses', async () => {
      const chunks = [
        { choices: [{ delta: { content: '{"hook": "' } }] },
        { choices: [{ delta: { content: 'Test hook' } }] },
        { choices: [{ delta: { content: '", "content": []}' } }] },
        { choices: [{ delta: { content: '' } }], usage: { total_tokens: 500 } }
      ];

      mockOpenAI.chat.completions.create.mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of chunks) {
            yield chunk;
          }
        }
      });

      const onChunk = jest.fn();
      
      await expect(
        summariser.generateContentStream(mockRedditPost, [], defaultOptions, onChunk)
      ).rejects.toThrow(); // Will fail due to incomplete JSON, but tests the streaming logic
      
      expect(onChunk).toHaveBeenCalledWith('Test hook');
    });

    it('should handle streaming errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('Streaming Error'));

      const onChunk = jest.fn();

      await expect(
        summariser.generateContentStream(mockRedditPost, [], defaultOptions, onChunk)
      ).rejects.toThrow(GPTSummariserError);
    });
  });

  describe('Prompt Building', () => {
    it('should build system prompts correctly', async () => {
      await summariser.generateContent(mockRedditPost, [], {
        persona: 'The Dry Cynic',
        contentType: 'article'
      });

      const systemPrompt = mockOpenAI.chat.completions.create.mock.calls[0][0].messages[0].content;
      
      expect(systemPrompt).toContain('Dry Cynic');
      expect(systemPrompt).toContain('deadpan');
      expect(systemPrompt).toContain('JSON');
    });

    it('should build user prompts with Reddit data', async () => {
      await summariser.generateContent(mockRedditPost, mockComments, {
        persona: 'The Snarky Sage',
        contentType: 'article',
        includeComments: true
      });

      const userPrompt = mockOpenAI.chat.completions.create.mock.calls[0][0].messages[1].content;
      
      expect(userPrompt).toContain(mockRedditPost.title);
      expect(userPrompt).toContain(mockRedditPost.subreddit);
      expect(userPrompt).toContain(mockRedditPost.selftext);
      expect(userPrompt).toContain('commenter1');
    });

    it('should filter comments by score', async () => {
      const lowScoreComments: RedditComment[] = [
        { ...mockComments[0], score: 5 },
        { ...mockComments[0], id: 'comment2', score: 50 }
      ];

      await summariser.generateContent(mockRedditPost, lowScoreComments, {
        persona: 'The Snarky Sage',
        contentType: 'article',
        includeComments: true
      });

      const userPrompt = mockOpenAI.chat.completions.create.mock.calls[0][0].messages[1].content;
      
      // Should only include the comment with score > 10
      expect(userPrompt).toContain('comment2');
      expect(userPrompt).not.toContain('5 points');
    });
  });

  describe('Content Validation Integration', () => {
    it('should validate Reddit threads before processing', async () => {
      const { contentValidator } = require('@/lib/contentValidator');
      contentValidator.validateRedditThread.mockReturnValue({
        isValid: false,
        errors: ['Invalid thread'],
        warnings: [],
        score: 0,
        metadata: { wordCount: 0, readabilityScore: 0, sentimentScore: 0, flaggedTerms: [] }
      });

      await expect(
        summariser.generateContent(mockRedditPost, [], {
          persona: 'The Snarky Sage',
          contentType: 'article'
        })
      ).rejects.toThrow('Invalid Reddit thread');
    });

    it('should validate generated content', async () => {
      const { contentValidator } = require('@/lib/contentValidator');
      
      const result = await summariser.generateContent(mockRedditPost, [], {
        persona: 'The Snarky Sage',
        contentType: 'article',
        validateContent: true
      });

      expect(contentValidator.validateContent).toHaveBeenCalled();
      expect(result.validation).toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    it('should get available models', async () => {
      mockOpenAI.models.list.mockResolvedValue({
        data: [
          { id: 'gpt-4-turbo-preview' },
          { id: 'gpt-3.5-turbo' },
          { id: 'text-davinci-003' }
        ]
      });

      const models = await summariser.getAvailableModels();

      expect(models).toContain('gpt-4-turbo-preview');
      expect(models).toContain('gpt-3.5-turbo');
      expect(models).not.toContain('text-davinci-003'); // Filtered out
    });

    it('should test connection successfully', async () => {
      mockOpenAI.models.list.mockResolvedValue({ data: [] });

      const isConnected = await summariser.testConnection();

      expect(isConnected).toBe(true);
    });

    it('should handle connection test failure', async () => {
      mockOpenAI.models.list.mockRejectedValue(new Error('Connection failed'));

      const isConnected = await summariser.testConnection();

      expect(isConnected).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should create GPTSummariserError with context', () => {
      const error = new GPTSummariserError(
        'Test error',
        'TEST_ERROR',
        { context: 'test' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toEqual({ context: 'test' });
      expect(error.name).toBe('GPTSummariserError');
    });

    it('should handle malformed content structure', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              hook: 'Test hook'
              // Missing required fields
            })
          }
        }],
        usage: { total_tokens: 100 }
      });

      await expect(
        summariser.generateContent(mockRedditPost, [], {
          persona: 'The Snarky Sage',
          contentType: 'article'
        })
      ).rejects.toThrow(GPTSummariserError);
    });

    it('should handle invalid content blocks', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              hook: 'Test hook',
              content: [
                { type: 'paragraph' } // Missing content field
              ],
              seoTitle: 'Test',
              seoDescription: 'Test',
              suggestedTags: [],
              estimatedReadTime: 1
            })
          }
        }],
        usage: { total_tokens: 100 }
      });

      await expect(
        summariser.generateContent(mockRedditPost, [], {
          persona: 'The Snarky Sage',
          contentType: 'article'
        })
      ).rejects.toThrow(GPTSummariserError);
    });
  });

  describe('Performance', () => {
    it('should track processing time', async () => {
      const result = await summariser.generateContent(mockRedditPost, [], {
        persona: 'The Snarky Sage',
        contentType: 'article'
      });

      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(typeof result.metadata.processingTime).toBe('number');
    });

    it('should handle large comment sets efficiently', async () => {
      const manyComments = Array(100).fill(mockComments[0]).map((comment, index) => ({
        ...comment,
        id: `comment${index}`,
        score: Math.floor(Math.random() * 100)
      }));

      const startTime = Date.now();
      await summariser.generateContent(mockRedditPost, manyComments, {
        persona: 'The Snarky Sage',
        contentType: 'article',
        includeComments: true,
        maxComments: 10
      });
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
}); 