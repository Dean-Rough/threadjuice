export interface Post {
  id: string;
  title: string;
  slug: string;
  hook: string;
  content: any; // Or a more specific type for JSONB
  persona_id: number;
  status: 'draft' | 'published';
  category: string;
  layout_style: number;
  featured: boolean;
  trending_score: number;
  view_count: number;
  share_count: number;
  event_id: string;
  reddit_thread_id: string;
  subreddit: string;
  created_at: string;
  updated_at: string;
}
