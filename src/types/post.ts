import { Persona } from './persona';

export interface RedditMetrics {
  upvotes: number;
  comments: number;
  engagementRate: number;
  originalTitle: string;
  originalAuthor: string;
  sourceUrl: string;
  subreddit: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string | { sections?: any[] };
  featuredImage: string;
  category: string;
  tags: string[];
  persona?: Persona;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  views?: number;
  viewCount?: number;
  upvoteCount?: number;
  commentCount?: number;
  shareCount?: number;
  sourceUrl?: string;
  redditAuthor?: string;
  redditMetrics?: RedditMetrics;
}
