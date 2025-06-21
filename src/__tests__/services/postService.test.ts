/**
 * Test suite for PostService data layer
 */

import { postService, type PostFilters } from '@/services/postService';

// Mock fetch globally
global.fetch = jest.fn();

describe('PostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache between tests
    postService['cache'].clear();
  });

  describe('getPosts', () => {
    it('should fetch posts with default parameters', async () => {
      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Test Post',
            img: 'test.jpg',
            group: 'tech',
            trending: true,
            category: 'Technology',
            author: 'Test Author',
            date: '2024-01-01',
          },
        ],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await postService.getPosts();

      expect(fetch).toHaveBeenCalledWith('/api/posts?');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch posts with filters', async () => {
      const filters: PostFilters = {
        category: 'tech',
        featured: true,
        limit: 5,
      };

      const mockResponse = {
        posts: [],
        total: 0,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await postService.getPosts(filters);

      expect(fetch).toHaveBeenCalledWith(
        '/api/posts?category=tech&featured=true&limit=5'
      );
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(postService.getPosts()).rejects.toThrow(
        'Failed to fetch posts: Internal Server Error'
      );
    });
  });

  describe('getPost', () => {
    it('should fetch a single post by ID', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        img: 'test.jpg',
        group: 'tech',
        trending: true,
        category: 'Technology',
        author: 'Test Author',
        date: '2024-01-01',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await postService.getPost(1);

      expect(fetch).toHaveBeenCalledWith('/api/posts/1');
      expect(result).toEqual(mockPost);
    });

    it('should handle 404 errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(postService.getPost(999)).rejects.toThrow('Post not found');
    });
  });

  describe('getFeaturedPosts', () => {
    it('should fetch featured posts', async () => {
      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Featured Post',
            featured: true,
          },
        ],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await postService.getFeaturedPosts(3);

      expect(fetch).toHaveBeenCalledWith('/api/posts?featured=true&limit=3');
      expect(result).toEqual(mockResponse.posts);
    });
  });

  describe('getTrendingPosts', () => {
    it('should fetch trending posts', async () => {
      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Trending Post',
            trending: true,
          },
        ],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await postService.getTrendingPosts(10);

      expect(fetch).toHaveBeenCalledWith('/api/posts?trending=true&limit=10');
      expect(result).toEqual(mockResponse.posts);
    });
  });

  describe('getPostsByCategory', () => {
    it('should fetch posts by category', async () => {
      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Tech Post',
            category: 'tech',
          },
        ],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await postService.getPostsByCategory('tech', 8);

      expect(fetch).toHaveBeenCalledWith('/api/posts?category=tech&limit=8');
      expect(result).toEqual(mockResponse.posts);
    });
  });

  describe('searchPosts', () => {
    it('should search posts with query', async () => {
      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Search Result',
            content: 'This matches the search query',
          },
        ],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await postService.searchPosts('search query', 15);

      expect(fetch).toHaveBeenCalledWith(
        '/api/posts?limit=15&search=search+query'
      );
      expect(result).toEqual(mockResponse.posts);
    });
  });

  describe('caching', () => {
    it('should cache successful responses', async () => {
      const mockResponse = {
        posts: [{ id: 1, title: 'Cached Post' }],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // First call should fetch from API
      const result1 = await postService.getPostsWithCache({ limit: 5 });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockResponse);

      // Second call should return cached data
      const result2 = await postService.getPostsWithCache({ limit: 5 });
      expect(fetch).toHaveBeenCalledTimes(1); // Still only called once
      expect(result2).toEqual(mockResponse);
    });

    it('should expire cache after timeout', async () => {
      const mockResponse = {
        posts: [{ id: 1, title: 'Fresh Post' }],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Mock cache timeout to be 0 for testing
      const originalTimeout = postService['cacheTimeout'];
      postService['cacheTimeout'] = 0;

      // First call
      await postService.getPostsWithCache({ limit: 5 });
      expect(fetch).toHaveBeenCalledTimes(1);

      // Wait for cache to expire and call again
      await new Promise(resolve => setTimeout(resolve, 1));
      await postService.getPostsWithCache({ limit: 5 });
      expect(fetch).toHaveBeenCalledTimes(2);

      // Restore original timeout
      postService['cacheTimeout'] = originalTimeout;
    });

    it('should use different cache keys for different filters', async () => {
      const mockResponse = {
        posts: [{ id: 1, title: 'Post' }],
        total: 1,
        hasMore: false,
        page: 1,
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Different filters should result in different API calls
      await postService.getPostsWithCache({ category: 'tech' });
      await postService.getPostsWithCache({ category: 'gaming' });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, '/api/posts?category=tech');
      expect(fetch).toHaveBeenNthCalledWith(2, '/api/posts?category=gaming');
    });
  });
});
