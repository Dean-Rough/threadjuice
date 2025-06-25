/**
 * Reddit API Response Types
 * Based on Reddit's JSON API structure
 */

// Base Reddit response structure
export interface RedditResponse<T> {
  kind: string;
  data: T;
}

// Reddit listing (used for posts, comments, etc.)
export interface RedditListing {
  modhash: string;
  dist: number;
  children: RedditResponse<any>[];
  after: string | null;
  before: string | null;
}

// Reddit post/submission data
export interface RedditPost {
  id: string;
  name: string; // fullname (e.g., "t3_abc123")
  title: string;
  selftext: string;
  selftext_html: string | null;
  url: string;
  permalink: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  author: string;
  author_fullname: string;
  created: number;
  created_utc: number;
  score: number;
  upvote_ratio: number;
  ups: number;
  downs: number;
  num_comments: number;
  thumbnail: string;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
      resolutions: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    }>;
  };
  media?: {
    reddit_video?: {
      fallback_url: string;
      height: number;
      width: number;
      scrubber_media_url: string;
      dash_url: string;
      duration: number;
      hls_url: string;
      is_gif: boolean;
      transcoding_status: string;
    };
  };
  is_video: boolean;
  is_self: boolean;
  is_nsfw: boolean;
  spoiler: boolean;
  locked: boolean;
  archived: boolean;
  stickied: boolean;
  distinguished: string | null;
  link_flair_text: string | null;
  link_flair_css_class: string | null;
  author_flair_text: string | null;
  author_flair_css_class: string | null;
  gilded: number;
  total_awards_received: number;
  all_awardings: any[];
  treatment_tags: any[];
}

// Reddit comment data
export interface RedditComment {
  id: string;
  name: string; // fullname (e.g., "t1_abc123")
  body: string;
  body_html: string;
  author: string;
  author_fullname: string;
  parent_id: string;
  link_id: string;
  subreddit: string;
  created: number;
  created_utc: number;
  score: number;
  ups: number;
  downs: number;
  controversiality: number;
  depth: number;
  is_submitter: boolean;
  distinguished: string | null;
  author_flair_text: string | null;
  author_flair_css_class: string | null;
  gilded: number;
  total_awards_received: number;
  all_awardings: any[];
  replies?: RedditResponse<RedditListing>;
}

// Reddit subreddit data
export interface RedditSubreddit {
  id: string;
  name: string;
  display_name: string;
  display_name_prefixed: string;
  title: string;
  description: string;
  description_html: string;
  public_description: string;
  subscribers: number;
  active_user_count: number;
  created: number;
  created_utc: number;
  over18: boolean;
  lang: string;
  url: string;
  subreddit_type: 'public' | 'private' | 'restricted';
  submission_type: 'any' | 'link' | 'self';
  icon_img: string;
  banner_img: string;
  header_img: string;
  primary_color: string;
  key_color: string;
  banner_background_color: string;
}

// Reddit user data
export interface RedditUser {
  id: string;
  name: string;
  created: number;
  created_utc: number;
  link_karma: number;
  comment_karma: number;
  total_karma: number;
  is_gold: boolean;
  is_mod: boolean;
  has_verified_email: boolean;
  icon_img: string;
  subreddit?: {
    title: string;
    public_description: string;
    icon_img: string;
    banner_img: string;
    subscribers: number;
  };
}

// Reddit OAuth token response
export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

// Reddit API error response
export interface RedditError {
  error: number;
  message: string;
  reason?: string;
}

// Reddit scraper configuration
export interface RedditScraperConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
}

// Reddit scraper options for fetching posts
export interface RedditFetchOptions {
  subreddit: string;
  sort?: 'hot' | 'new' | 'rising' | 'top' | 'controversial';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  after?: string;
  before?: string;
  minScore?: number;
}

// Reddit scraper options for fetching comments
export interface RedditCommentsOptions {
  postId: string;
  sort?:
    | 'confidence'
    | 'top'
    | 'new'
    | 'controversial'
    | 'old'
    | 'random'
    | 'qa'
    | 'live';
  limit?: number;
  depth?: number;
}

// Processed Reddit data for our application
export interface ProcessedRedditPost {
  redditId: string;
  title: string;
  content: string;
  url: string;
  permalink: string;
  subreddit: string;
  author: string;
  score: number;
  upvoteRatio: number;
  commentCount: number;
  createdAt: Date;
  isVideo: boolean;
  isNsfw: boolean;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  flairText?: string;
  rawData: RedditPost;
}

export interface ProcessedRedditComment {
  redditId: string;
  content: string;
  author: string;
  score: number;
  depth: number;
  parentId?: string;
  createdAt: Date;
  isSubmitter: boolean;
  replies: ProcessedRedditComment[];
  rawData: RedditComment;
}

// API request types for our endpoints
export interface RedditIngestionRequest {
  subreddit: string;
  limit?: number;
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  minScore?: number;
  forceRefresh?: boolean;
}
