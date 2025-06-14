import {
  RedditScraper,
  redditScraper,
  extractPostIdFromUrl,
  cleanRedditText,
} from '@/lib/redditScraper';
import {
  RedditAPIError,
  RedditAuthError,
  RedditRateLimitError,
} from '@/types/reddit';
import { logger } from '@/lib/logger';

// Mock the dependencies
jest.mock('@/lib/logger');
jest.mock('@/lib/env', () => ({
  config: {
    reddit: {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      userAgent: 'ThreadJuice/1.0 Test',
    },
  },
}));

jest.mock('@/lib/rateLimiter', () => ({
  redditRateLimiter: {
    waitForToken: jest.fn().mockResolvedValue(undefined),
    updateFromHeaders: jest.fn(),
    getStatus: jest.fn().mockReturnValue({
      tokens: 10,
      maxTokens: 15,
      canMakeRequest: true,
      nextTokenIn: 0,
    }),
  },
  redditBackoff: {
    execute: jest.fn().mockImplementation(fn => fn()),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('RedditScraper', () => {
  let scraper: RedditScraper;

  beforeEach(() => {
    jest.clearAllMocks();
    scraper = new RedditScraper();
  });

  describe('Constructor', () => {
    it('should initialize with default config', () => {
      expect(scraper).toBeInstanceOf(RedditScraper);
      expect(logger.info).toHaveBeenCalledWith('RedditScraper initialized', {
        userAgent: 'ThreadJuice/1.0 Test',
        rateLimitPerMinute: 60,
      });
    });

    it('should accept custom config', () => {
      const customScraper = new RedditScraper({
        userAgent: 'Custom/1.0',
        rateLimitPerMinute: 30,
      });

      expect(customScraper).toBeInstanceOf(RedditScraper);
      expect(logger.info).toHaveBeenCalledWith('RedditScraper initialized', {
        userAgent: 'Custom/1.0',
        rateLimitPerMinute: 30,
      });
    });
  });

  describe('Authentication', () => {
    it('should authenticate successfully', async () => {
      const mockAuthResponse = {
        access_token: 'test_token',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'read',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAuthResponse),
      });

      await scraper.authenticate();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.reddit.com/api/v1/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic '),
            'User-Agent': 'ThreadJuice/1.0 Test',
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: 'grant_type=client_credentials',
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        'Reddit authentication successful',
        {
          tokenType: 'bearer',
          expiresIn: 3600,
          scope: 'read',
        }
      );
    });

    it('should handle authentication failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue('Invalid credentials'),
      });

      await expect(scraper.authenticate()).rejects.toThrow(RedditAuthError);
      expect(logger.error).toHaveBeenCalledWith(
        'Reddit authentication failed',
        { error: expect.any(RedditAuthError) }
      );
    });

    it('should check authentication status', () => {
      expect(scraper.isAuthenticated()).toBe(false);
    });
  });

  describe('getHotPosts', () => {
    beforeEach(async () => {
      // Mock successful authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test_token',
          token_type: 'bearer',
          expires_in: 3600,
          scope: 'read',
        }),
      });
    });

    it('should fetch hot posts successfully', async () => {
      const mockPostsResponse = {
        kind: 'Listing',
        data: {
          modhash: '',
          dist: 2,
          children: [
            {
              kind: 't3',
              data: {
                id: 'test1',
                title: 'Test Post 1',
                selftext: 'This is a test post',
                author: 'testuser',
                subreddit: 'test',
                score: 100,
                num_comments: 50,
                created_utc: Date.now() / 1000,
              },
            },
            {
              kind: 't3',
              data: {
                id: 'test2',
                title: 'Test Post 2',
                selftext: 'Another test post',
                author: 'testuser2',
                subreddit: 'test',
                score: 200,
                num_comments: 75,
                created_utc: Date.now() / 1000,
              },
            },
          ],
          after: 't3_test2',
          before: null,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPostsResponse),
        headers: new Headers(),
      });

      const posts = await scraper.getHotPosts({ subreddit: 'test' });

      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('Test Post 1');
      expect(posts[1].title).toBe('Test Post 2');

      expect(logger.info).toHaveBeenCalledWith('Retrieved Reddit posts', {
        subreddit: 'test',
        sort: 'hot',
        count: 2,
        after: 't3_test2',
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Subreddit not found'),
        headers: new Headers(),
      });

      await expect(
        scraper.getHotPosts({ subreddit: 'nonexistent' })
      ).rejects.toThrow(RedditAPIError);

      expect(logger.error).toHaveBeenCalledWith('Failed to get Reddit posts', {
        subreddit: 'nonexistent',
        sort: 'hot',
        error: expect.any(RedditAPIError),
      });
    });

    it('should handle rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: jest.fn().mockResolvedValue('Rate limit exceeded'),
        headers: new Headers({
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(Date.now() + 60000),
        }),
      });

      await expect(scraper.getHotPosts({ subreddit: 'test' })).rejects.toThrow(
        RedditRateLimitError
      );
    });

    it('should use correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          kind: 'Listing',
          data: { children: [], after: null, before: null },
        }),
        headers: new Headers(),
      });

      await scraper.getHotPosts({
        subreddit: 'test',
        sort: 'top',
        time: 'week',
        limit: 50,
        after: 't3_abc123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/r/test/top?'),
        expect.any(Object)
      );

      const url = mockFetch.mock.calls[1][0] as string;
      expect(url).toContain('limit=50');
      expect(url).toContain('after=t3_abc123');
      expect(url).toContain('t=week');
    });
  });

  describe('getComments', () => {
    beforeEach(async () => {
      // Mock successful authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test_token',
          token_type: 'bearer',
          expires_in: 3600,
          scope: 'read',
        }),
      });
    });

    it('should fetch comments successfully', async () => {
      const mockCommentsResponse = [
        {
          kind: 'Listing',
          data: {
            children: [
              {
                kind: 't3',
                data: {
                  id: 'test_post',
                  title: 'Test Post',
                  selftext: 'Post content',
                  author: 'testuser',
                },
              },
            ],
          },
        },
        {
          kind: 'Listing',
          data: {
            children: [
              {
                kind: 't1',
                data: {
                  id: 'comment1',
                  body: 'First comment',
                  author: 'commenter1',
                  score: 10,
                  replies: '',
                },
              },
              {
                kind: 't1',
                data: {
                  id: 'comment2',
                  body: 'Second comment',
                  author: 'commenter2',
                  score: 5,
                  replies: {
                    kind: 'Listing',
                    data: {
                      children: [
                        {
                          kind: 't1',
                          data: {
                            id: 'reply1',
                            body: 'Reply to second comment',
                            author: 'replier1',
                            score: 2,
                            replies: '',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCommentsResponse),
        headers: new Headers(),
      });

      const result = await scraper.getComments({
        subreddit: 'test',
        postId: 'test_post',
      });

      expect(result.post.title).toBe('Test Post');
      expect(result.comments).toHaveLength(3); // 2 top-level + 1 reply
      expect(result.comments[0].body).toBe('First comment');
      expect(result.comments[1].body).toBe('Second comment');
      expect(result.comments[2].body).toBe('Reply to second comment');
      expect(result.comments[2].depth).toBe(1);

      expect(logger.info).toHaveBeenCalledWith('Retrieved Reddit comments', {
        subreddit: 'test',
        postId: 'test_post',
        commentCount: 3,
      });
    });

    it('should handle comments API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Post not found'),
        headers: new Headers(),
      });

      await expect(
        scraper.getComments({
          subreddit: 'test',
          postId: 'nonexistent',
        })
      ).rejects.toThrow(RedditAPIError);

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get Reddit comments',
        {
          subreddit: 'test',
          postId: 'nonexistent',
          error: expect.any(RedditAPIError),
        }
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should return rate limit status', () => {
      const status = scraper.getRateLimitStatus();

      expect(status).toEqual({
        remaining: 10,
        used: 5,
        resetTime: expect.any(Number),
        canMakeRequest: true,
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      // Mock successful authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test_token',
          token_type: 'bearer',
          expires_in: 3600,
          scope: 'read',
        }),
      });
    });

    it('should handle 401 errors and clear token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue('{"error": "invalid_token"}'),
        headers: new Headers(),
      });

      await expect(scraper.getHotPosts({ subreddit: 'test' })).rejects.toThrow(
        RedditAuthError
      );

      expect(scraper.isAuthenticated()).toBe(false);
    });

    it('should handle 403 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest.fn().mockResolvedValue('{"error": "private_subreddit"}'),
        headers: new Headers(),
      });

      await expect(
        scraper.getHotPosts({ subreddit: 'private' })
      ).rejects.toThrow(RedditAPIError);
    });

    it('should handle 500 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server error'),
        headers: new Headers(),
      });

      await expect(scraper.getHotPosts({ subreddit: 'test' })).rejects.toThrow(
        RedditAPIError
      );
    });
  });
});

describe('Default Reddit Scraper Instance', () => {
  it('should export a default instance', () => {
    expect(redditScraper).toBeInstanceOf(RedditScraper);
  });
});

describe('Utility Functions', () => {
  describe('extractPostIdFromUrl', () => {
    it('should extract post ID from Reddit URL', () => {
      const url = 'https://www.reddit.com/r/test/comments/abc123/test_post/';
      expect(extractPostIdFromUrl(url)).toBe('abc123');
    });

    it('should return null for invalid URLs', () => {
      expect(extractPostIdFromUrl('https://example.com')).toBeNull();
      expect(extractPostIdFromUrl('https://reddit.com/r/test')).toBeNull();
    });
  });

  describe('cleanRedditText', () => {
    it('should clean HTML entities', () => {
      const text =
        'Test &amp; example &lt;tag&gt; &quot;quoted&quot; &#x27;apostrophe&#x27;';
      const cleaned = cleanRedditText(text);
      expect(cleaned).toBe('Test & example <tag> "quoted" \'apostrophe\'');
    });

    it('should reduce multiple newlines', () => {
      const text = 'Line 1\n\n\n\nLine 2\n\n\n\n\nLine 3';
      const cleaned = cleanRedditText(text);
      expect(cleaned).toBe('Line 1\n\nLine 2\n\nLine 3');
    });

    it('should trim whitespace', () => {
      const text = '  \n  Test content  \n  ';
      const cleaned = cleanRedditText(text);
      expect(cleaned).toBe('Test content');
    });
  });
});
