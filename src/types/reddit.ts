// Reddit API Response Types
// Based on Reddit API v1 documentation

export interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

export interface RedditError {
  error: string;
  message?: string;
  error_description?: string;
}

// Base Reddit Thing interface
export interface RedditThing<T = any> {
  kind: string;
  data: T;
}

// Reddit Listing (paginated results)
export interface RedditListing<T = any> {
  modhash: string;
  dist: number;
  children: RedditThing<T>[];
  after: string | null;
  before: string | null;
}

// Reddit Post (Submission) data
export interface RedditPost {
  id: string;
  name: string; // fullname (t3_id)
  title: string;
  selftext: string;
  selftext_html: string | null;
  author: string;
  author_fullname: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  subreddit_id: string;
  permalink: string;
  url: string;
  domain: string;
  created: number;
  created_utc: number;
  score: number;
  upvote_ratio: number;
  ups: number;
  downs: number;
  num_comments: number;
  thumbnail: string;
  preview?: RedditPreview;
  media?: RedditMedia;
  secure_media?: RedditMedia;
  is_video: boolean;
  is_self: boolean;
  is_original_content: boolean;
  over_18: boolean;
  spoiler: boolean;
  locked: boolean;
  stickied: boolean;
  distinguished: string | null;
  gilded: number;
  archived: boolean;
  removed_by_category: string | null;
  link_flair_text: string | null;
  link_flair_css_class: string | null;
  post_hint?: string;
  view_count?: number;
  clicked?: boolean;
  hidden?: boolean;
  saved?: boolean;
  quarantine: boolean;
  subreddit_type: 'public' | 'private' | 'restricted' | 'gold_restricted' | 'archived';
  edited: boolean | number;
  all_awardings: RedditAward[];
  total_awards_received: number;
  treatment_tags: string[];
}

// Reddit Comment data
export interface RedditComment {
  id: string;
  name: string; // fullname (t1_id)
  author: string;
  author_fullname: string;
  body: string;
  body_html: string;
  parent_id: string;
  link_id: string;
  subreddit: string;
  subreddit_id: string;
  created: number;
  created_utc: number;
  score: number;
  ups: number;
  downs: number;
  depth: number;
  count: number;
  replies: RedditThing<RedditListing<RedditComment>> | string;
  distinguished: string | null;
  gilded: number;
  archived: boolean;
  edited: boolean | number;
  stickied: boolean;
  score_hidden: boolean;
  controversiality: number;
  is_submitter: boolean;
  collapsed: boolean;
  collapsed_reason: string | null;
  associated_award?: RedditAward;
  all_awardings: RedditAward[];
  total_awards_received: number;
  treatment_tags: string[];
}

// Reddit Media types
export interface RedditMedia {
  type?: string;
  oembed?: {
    provider_url: string;
    description: string;
    title: string;
    type: string;
    author_name: string;
    height: number;
    width: number;
    html: string;
    thumbnail_width: number;
    version: string;
    provider_name: string;
    thumbnail_url: string;
    thumbnail_height: number;
    author_url: string;
  };
  reddit_video?: {
    bitrate_kbps: number;
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
}

// Reddit Preview images
export interface RedditPreview {
  images: RedditPreviewImage[];
  enabled: boolean;
  reddit_video_preview?: {
    bitrate_kbps: number;
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
}

export interface RedditPreviewImage {
  source: RedditImageSource;
  resolutions: RedditImageSource[];
  variants: {
    gif?: RedditPreviewVariant;
    mp4?: RedditPreviewVariant;
  };
  id: string;
}

export interface RedditImageSource {
  url: string;
  width: number;
  height: number;
}

export interface RedditPreviewVariant {
  source: RedditImageSource;
  resolutions: RedditImageSource[];
}

// Reddit Awards
export interface RedditAward {
  giver_coin_reward: number | null;
  subreddit_id: string | null;
  is_new: boolean;
  days_of_drip_extension: number | null;
  coin_price: number;
  id: string;
  penny_donate: number | null;
  award_sub_type: string;
  coin_reward: number;
  icon_url: string;
  days_of_premium: number | null;
  tiers_by_required_awardings: any | null;
  resized_icons: RedditImageSource[];
  icon_width: number;
  static_icon_width: number;
  start_date: number | null;
  is_enabled: boolean;
  awardings_required_to_grant_benefits: number | null;
  description: string;
  end_date: number | null;
  sticky_duration_seconds: number | null;
  subreddit_coin_reward: number;
  count: number;
  static_icon_height: number;
  name: string;
  resized_static_icons: RedditImageSource[];
  icon_format: string | null;
  icon_height: number;
  penny_price: number | null;
  award_type: string;
  static_icon_url: string;
}

// Reddit Subreddit data
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
  subreddit_type: 'public' | 'private' | 'restricted' | 'gold_restricted' | 'archived';
  submission_type: 'any' | 'link' | 'self';
  allow_images: boolean;
  allow_videos: boolean;
  allow_polls: boolean;
  allow_prediction_contributors: boolean;
  wiki_enabled: boolean;
  primary_color: string;
  key_color: string;
  banner_img: string;
  banner_background_image: string;
  banner_background_color: string;
  mobile_banner_image: string;
  icon_img: string;
  community_icon: string;
  header_img: string | null;
  header_size: [number, number] | null;
  header_title: string | null;
  user_flair_enabled_in_sr: boolean;
  link_flair_enabled: boolean;
  accounts_active: number;
  comment_score_hide_mins: number;
  hide_ads: boolean;
  emojis_enabled: boolean;
  advertiser_category: string | null;
  public_traffic: boolean;
  collapse_deleted_comments: boolean;
  quarantine: boolean;
  user_is_banned: boolean;
  user_is_muted: boolean;
  user_is_moderator: boolean;
  user_is_contributor: boolean;
  user_is_subscriber: boolean;
  user_sr_flair_enabled: boolean;
  user_flair_css_class: string | null;
  user_flair_text: string | null;
  user_flair_text_color: string | null;
  user_flair_background_color: string | null;
}

// API Response wrappers
export type RedditPostsResponse = RedditThing<RedditListing<RedditPost>>;
export type RedditCommentsResponse = [
  RedditThing<RedditListing<RedditPost>>, // The post
  RedditThing<RedditListing<RedditComment>> // The comments
];
export type RedditSubredditResponse = RedditThing<RedditSubreddit>;

// Rate limiting types
export interface RateLimitInfo {
  remaining: number;
  used: number;
  resetTime: number;
}

// Scraper configuration
export interface RedditScraperConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
  rateLimitPerMinute?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// Scraper method options
export interface GetPostsOptions {
  subreddit: string;
  sort?: 'hot' | 'new' | 'rising' | 'top';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  after?: string;
  before?: string;
}

export interface GetCommentsOptions {
  subreddit: string;
  postId: string;
  sort?: 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'random' | 'qa' | 'live';
  limit?: number;
  depth?: number;
  context?: number;
}

// Error types
export class RedditAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'RedditAPIError';
  }
}

export class RedditRateLimitError extends RedditAPIError {
  constructor(
    message: string,
    public resetTime: number,
    public remaining: number = 0
  ) {
    super(message, 429);
    this.name = 'RedditRateLimitError';
  }
}

export class RedditAuthError extends RedditAPIError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'RedditAuthError';
  }
} 