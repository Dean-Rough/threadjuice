/**
 * Test suite for React Query hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePosts,
  useFeaturedPosts,
  useTrendingPosts,
  usePostsByCategory,
} from '@/hooks/usePosts';
import { postService } from '@/services/postService';
import { ReactNode } from 'react';

// Mock the post service
jest.mock('@/services/postService');
const mockPostService = postService as jest.Mocked<typeof postService>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return TestWrapper;
};

describe('usePosts hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePosts', () => {
    it('should fetch posts successfully', async () => {
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

      mockPostService.getPostsWithCache.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePosts({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockPostService.getPostsWithCache).toHaveBeenCalledWith({
        limit: 10,
      });
    });

    it('should handle loading state', () => {
      mockPostService.getPostsWithCache.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => usePosts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error state', async () => {
      const error = new Error('Failed to fetch posts');
      mockPostService.getPostsWithCache.mockRejectedValue(error);

      const { result } = renderHook(() => usePosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useFeaturedPosts', () => {
    it('should fetch featured posts with correct parameters', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Featured Post',
          featured: true,
          img: 'featured.jpg',
          group: 'viral',
          trending: false,
          category: 'Viral',
          author: 'Featured Author',
          date: '2024-01-01',
        },
      ];

      mockPostService.getFeaturedPosts.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => useFeaturedPosts(3), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPosts);
      expect(mockPostService.getFeaturedPosts).toHaveBeenCalledWith(3);
    });

    it('should use default limit when not specified', async () => {
      mockPostService.getFeaturedPosts.mockResolvedValue([]);

      const { result } = renderHook(() => useFeaturedPosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPostService.getFeaturedPosts).toHaveBeenCalledWith(5);
    });
  });

  describe('useTrendingPosts', () => {
    it('should fetch trending posts with correct parameters', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Trending Post',
          trending: true,
          img: 'trending.jpg',
          group: 'gaming',
          featured: false,
          category: 'Gaming',
          author: 'Trending Author',
          date: '2024-01-01',
        },
      ];

      mockPostService.getTrendingPosts.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => useTrendingPosts(8), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPosts);
      expect(mockPostService.getTrendingPosts).toHaveBeenCalledWith(8);
    });

    it('should use default limit when not specified', async () => {
      mockPostService.getTrendingPosts.mockResolvedValue([]);

      renderHook(() => useTrendingPosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockPostService.getTrendingPosts).toHaveBeenCalledWith(12);
      });
    });
  });

  describe('usePostsByCategory', () => {
    it('should fetch posts by category when category is provided', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Tech Post',
          category: 'tech',
          img: 'tech.jpg',
          group: 'technology',
          trending: false,
          featured: false,
          author: 'Tech Author',
          date: '2024-01-01',
        },
      ];

      mockPostService.getPostsByCategory.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => usePostsByCategory('tech', 6), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPosts);
      expect(mockPostService.getPostsByCategory).toHaveBeenCalledWith(
        'tech',
        6
      );
    });

    it('should not fetch when category is empty', () => {
      const { result } = renderHook(() => usePostsByCategory('', 6), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(mockPostService.getPostsByCategory).not.toHaveBeenCalled();
    });

    it('should use default limit when not specified', async () => {
      mockPostService.getPostsByCategory.mockResolvedValue([]);

      renderHook(() => usePostsByCategory('gaming'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockPostService.getPostsByCategory).toHaveBeenCalledWith(
          'gaming',
          12
        );
      });
    });
  });

  describe('query key generation', () => {
    it('should generate unique query keys for different filters', async () => {
      mockPostService.getPostsWithCache.mockResolvedValue({
        posts: [],
        total: 0,
        hasMore: false,
        page: 1,
      });

      // Test different filter combinations
      const filters1 = { category: 'tech', limit: 5 };
      const filters2 = { featured: true, limit: 10 };
      const filters3 = { trending: true, search: 'test' };

      const { result: result1 } = renderHook(() => usePosts(filters1), {
        wrapper: createWrapper(),
      });

      const { result: result2 } = renderHook(() => usePosts(filters2), {
        wrapper: createWrapper(),
      });

      const { result: result3 } = renderHook(() => usePosts(filters3), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
        expect(result3.current.isSuccess).toBe(true);
      });

      // Each should have called the service with different parameters
      expect(mockPostService.getPostsWithCache).toHaveBeenCalledWith(filters1);
      expect(mockPostService.getPostsWithCache).toHaveBeenCalledWith(filters2);
      expect(mockPostService.getPostsWithCache).toHaveBeenCalledWith(filters3);
      expect(mockPostService.getPostsWithCache).toHaveBeenCalledTimes(3);
    });
  });

  describe('cache behavior', () => {
    it('should cache successful queries', async () => {
      const mockResponse = {
        posts: [{ id: 1, title: 'Cached Post' }],
        total: 1,
        hasMore: false,
        page: 1,
      };

      mockPostService.getPostsWithCache.mockResolvedValue(mockResponse);

      // First hook instance
      const { result: result1 } = renderHook(() => usePosts({ limit: 5 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second hook instance with same parameters should use cache
      const { result: result2 } = renderHook(() => usePosts({ limit: 5 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      // Service should only be called once due to caching
      expect(mockPostService.getPostsWithCache).toHaveBeenCalledTimes(1);
      expect(result1.current.data).toEqual(result2.current.data);
    });
  });
});
