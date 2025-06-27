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
  try {
    const response = await fetch(`/api/posts?limit=${limit}&sortBy=views`);
    if (!response.ok) {
      console.error('Failed to fetch popular posts:', response.status, response.statusText);
      return { posts: [] }; // Return empty array instead of throwing
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return { posts: [] }; // Return empty array on network errors
  }
}

// Fetch posts sorted by share count
async function fetchMostSharedPosts(limit = 5): Promise<PopularPostsResponse> {
  try {
    const response = await fetch(`/api/posts?limit=${limit}&sortBy=shares`);
    if (!response.ok) {
      console.error('Failed to fetch most shared posts:', response.status, response.statusText);
      return { posts: [] }; // Return empty array instead of throwing
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching most shared posts:', error);
    return { posts: [] }; // Return empty array on network errors
  }
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
