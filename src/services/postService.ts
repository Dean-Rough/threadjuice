/**
 * Post Service - Centralized data fetching for posts
 * Replaces client-side data processing with proper API integration
 */

export interface PostFilters {
  category?: string;
  author?: string;
  featured?: boolean;
  trending?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  category: string;
  author: string;
  view_count: number;
  upvote_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  trending: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostDetail extends Post {
  content?: any;
  persona?: {
    id: number;
    name: string;
    slug: string;
    bio: string;
    avatar_url: string;
    tone: string;
    story_count: number;
    rating: number;
  };
  stats: {
    view_count: number;
    upvote_count: number;
    comment_count: number;
    share_count: number;
    bookmark_count: number;
  };
  reddit_source?: {
    thread_id: string;
    subreddit: string;
    original_url: string;
  };
}

export interface PostsResponse {
  posts: Post[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class PostService {
  private baseUrl = '/api/posts';

  async getPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.author) params.set('author', filters.author);
    if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
    if (filters.trending !== undefined) params.set('trending', filters.trending.toString());
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', filters.search);
    
    // Add cache buster
    params.set('_t', Date.now().toString());

    const url = `${this.baseUrl}?${params.toString()}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return response.json();
  }

  async getPost(id: string): Promise<{ post: PostDetail }> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    return response.json();
  }

  async getFeaturedPosts(limit = 5): Promise<Post[]> {
    const response = await this.getPosts({ featured: true, limit });
    return response.posts;
  }

  async getTrendingPosts(limit = 12): Promise<Post[]> {
    const response = await this.getPosts({ trending: true, limit });
    return response.posts;
  }

  async getPostsByCategory(category: string, limit = 12): Promise<Post[]> {
    const response = await this.getPosts({ category, limit });
    return response.posts;
  }

  async searchPosts(query: string, limit = 12): Promise<Post[]> {
    const response = await this.getPosts({ search: query, limit });
    return response.posts;
  }

  // Cache management
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(filters: PostFilters): string {
    return JSON.stringify(filters);
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getPostsWithCache(filters: PostFilters = {}): Promise<PostsResponse> {
    const cacheKey = this.getCacheKey(filters);
    const cached = this.getCachedData<PostsResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = await this.getPosts(filters);
    this.setCachedData(cacheKey, data);
    return data;
  }
}

// Export singleton instance
export const postService = new PostService();
export default postService;