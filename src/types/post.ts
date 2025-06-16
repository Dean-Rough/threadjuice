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
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  persona: Persona;
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  redditMetrics: RedditMetrics;
}
