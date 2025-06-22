import { useQuery } from '@tanstack/react-query';

interface PopularPost {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  shareCount: number;
}

interface PopularPostsResponse {
  posts: PopularPost[];
}

// Fetch posts sorted by view count
async function fetchPopularPosts(limit = 5): Promise<PopularPostsResponse> {
  const response = await fetch(`/api/posts?limit=${limit}&sortBy=views`);
  if (!response.ok) {
    throw new Error('Failed to fetch popular posts');
  }
  return response.json();
}

// Fetch posts sorted by share count
async function fetchMostSharedPosts(limit = 5): Promise<PopularPostsResponse> {
  const response = await fetch(`/api/posts?limit=${limit}&sortBy=shares`);
  if (!response.ok) {
    throw new Error('Failed to fetch most shared posts');
  }
  return response.json();
}

export function usePopularPosts(limit = 5) {
  return useQuery({
    queryKey: ['posts', 'popular', limit],
    queryFn: () => fetchPopularPosts(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useMostSharedPosts(limit = 5) {
  return useQuery({
    queryKey: ['posts', 'most-shared', limit],
    queryFn: () => fetchMostSharedPosts(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}
