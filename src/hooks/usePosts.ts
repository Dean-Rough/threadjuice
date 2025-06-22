/**
 * React Query hooks for post data fetching
 * Provides centralized data management with caching and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postService,
  type PostFilters,
  type Post,
  type PostDetail,
  type PostsResponse,
} from '@/services/postService';

// Query keys for consistent caching
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostFilters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...postKeys.details(), id] as const,
  featured: () => [...postKeys.all, 'featured'] as const,
  trending: () => [...postKeys.all, 'trending'] as const,
  category: (category: string) =>
    [...postKeys.all, 'category', category] as const,
  search: (query: string) => [...postKeys.all, 'search', query] as const,
};

// Main hook for fetching posts with filters
export const usePosts = (filters: PostFilters = {}) => {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => postService.getPosts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - reasonable caching
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
    refetchOnMount: false, // Only refetch if data is stale
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });
};

// Hook for fetching a single post
export const usePost = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postService.getPost(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for featured posts
export const useFeaturedPosts = (limit = 5) => {
  return useQuery({
    queryKey: postKeys.featured(),
    queryFn: () => postService.getFeaturedPosts(limit),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for trending posts
export const useTrendingPosts = (limit = 12) => {
  return useQuery({
    queryKey: postKeys.trending(),
    queryFn: () => postService.getTrendingPosts(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes for trending (more frequent updates)
  });
};

// Hook for posts by category
export const usePostsByCategory = (category: string, limit = 12) => {
  return useQuery({
    queryKey: postKeys.category(category),
    queryFn: () => postService.getPostsByCategory(category, limit),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for searching posts
export const useSearchPosts = (query: string, limit = 12) => {
  return useQuery({
    queryKey: postKeys.search(query),
    queryFn: () => postService.searchPosts(query, limit),
    enabled: !!query && query.length > 2, // Only search if query is meaningful
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for infinite loading (pagination)
export const useInfinitePosts = (filters: PostFilters = {}) => {
  return useQuery({
    queryKey: [...postKeys.list(filters), 'infinite'],
    queryFn: async () => {
      const response = await postService.getPosts({
        ...filters,
        limit: filters.limit || 12,
      });
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hook for creating posts (admin functionality)
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: Partial<Post>) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
};

// Mutation hook for updating posts
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...postData }: Partial<Post> & { id: number }) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      return response.json();
    },
    onSuccess: updatedPost => {
      // Update the post in cache
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Mutation hook for deleting posts
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      return { id };
    },
    onSuccess: deletedPost => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedPost.id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Utility hook to prefetch data
export const usePrefetchPost = () => {
  const queryClient = useQueryClient();

  return (id: string | number) => {
    queryClient.prefetchQuery({
      queryKey: postKeys.detail(id),
      queryFn: () => postService.getPost(id),
      staleTime: 10 * 60 * 1000,
    });
  };
};

// Custom hook for loading states across multiple queries
export const usePostsLoadingState = () => {
  const queryClient = useQueryClient();

  const isFetching = queryClient.isFetching({ queryKey: postKeys.all }) > 0;
  const isLoading =
    queryClient.isFetching({ queryKey: postKeys.all, type: 'active' }) > 0;

  return {
    isFetching,
    isLoading,
    hasAnyData:
      queryClient.getQueryCache().findAll({ queryKey: postKeys.all }).length >
      0,
  };
};
