export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          post_count: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          post_count?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          post_count?: number;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          parent_id: string | null;
          author: string;
          body: string;
          score: number;
          sentiment: Json | null;
          reddit_comment_id: string | null;
          thread_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          parent_id?: string | null;
          author: string;
          body: string;
          score?: number;
          sentiment?: Json | null;
          reddit_comment_id?: string | null;
          thread_level?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          parent_id?: string | null;
          author?: string;
          body?: string;
          score?: number;
          sentiment?: Json | null;
          reddit_comment_id?: string | null;
          thread_level?: number;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          post_count: number;
          trending_score: number;
          start_date: string | null;
          end_date: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          post_count?: number;
          trending_score?: number;
          start_date?: string | null;
          end_date?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          post_count?: number;
          trending_score?: number;
          start_date?: string | null;
          end_date?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      images: {
        Row: {
          id: string;
          post_id: string;
          url: string;
          alt_text: string | null;
          caption: string | null;
          license_type: string;
          author: string | null;
          credit_text: string | null;
          source_link: string | null;
          width: number | null;
          height: number | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          url: string;
          alt_text?: string | null;
          caption?: string | null;
          license_type: string;
          author?: string | null;
          credit_text?: string | null;
          source_link?: string | null;
          width?: number | null;
          height?: number | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          url?: string;
          alt_text?: string | null;
          caption?: string | null;
          license_type?: string;
          author?: string | null;
          credit_text?: string | null;
          source_link?: string | null;
          width?: number | null;
          height?: number | null;
          file_size?: number | null;
          created_at?: string;
        };
      };
      personas: {
        Row: {
          id: number;
          name: string;
          avatar_url: string | null;
          tone: string;
          style_preferences: Json | null;
          target_audience: string | null;
          content_focus: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          avatar_url?: string | null;
          tone: string;
          style_preferences?: Json | null;
          target_audience?: string | null;
          content_focus?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          avatar_url?: string | null;
          tone?: string;
          style_preferences?: Json | null;
          target_audience?: string | null;
          content_focus?: string[] | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          hook: string;
          content: Json;
          persona_id: number | null;
          status: 'draft' | 'published' | 'archived';
          category: string | null;
          layout_style: number;
          featured: boolean;
          trending_score: number;
          view_count: number;
          share_count: number;
          event_id: string | null;
          reddit_thread_id: string | null;
          subreddit: string | null;
          seo_title: string | null;
          seo_description: string | null;
          featured_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          hook: string;
          content: Json;
          persona_id?: number | null;
          status?: 'draft' | 'published' | 'archived';
          category?: string | null;
          layout_style?: number;
          featured?: boolean;
          trending_score?: number;
          view_count?: number;
          share_count?: number;
          event_id?: string | null;
          reddit_thread_id?: string | null;
          subreddit?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          featured_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          hook?: string;
          content?: Json;
          persona_id?: number | null;
          status?: 'draft' | 'published' | 'archived';
          category?: string | null;
          layout_style?: number;
          featured?: boolean;
          trending_score?: number;
          view_count?: number;
          share_count?: number;
          event_id?: string | null;
          reddit_thread_id?: string | null;
          subreddit?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          featured_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_responses: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string | null;
          answers: Json;
          score: number;
          completion_time: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          user_id?: string | null;
          answers: Json;
          score: number;
          completion_time?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          user_id?: string | null;
          answers?: Json;
          score?: number;
          completion_time?: number | null;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          post_id: string;
          title: string;
          questions: Json;
          completion_count: number;
          average_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          title: string;
          questions: Json;
          completion_count?: number;
          average_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          title?: string;
          questions?: Json;
          completion_count?: number;
          average_score?: number | null;
          created_at?: string;
        };
      };
      user_interactions: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          interaction_type: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          interaction_type: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          interaction_type?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_share_count: {
        Args: {
          post_id: string;
        };
        Returns: undefined;
      };
      increment_view_count: {
        Args: {
          post_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Application-level types
export interface Post {
  id: string;
  title: string;
  slug: string;
  hook: string;
  content: ContentBlock[];
  persona_id?: number;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  layout_style: number;
  featured: boolean;
  trending_score: number;
  view_count: number;
  share_count: number;
  event_id?: string;
  reddit_thread_id?: string;
  subreddit?: string;
  seo_title?: string;
  seo_description?: string;
  featured_image?: string;
  created_at: string;
  updated_at: string;
}

export interface PostWithRelations extends Post {
  persona?: Persona;
  category_data?: Category;
  comments?: Comment[];
  images?: Image[];
  quiz?: Quiz;
}

export interface ContentBlock {
  type: 'paragraph' | 'comment_cluster' | 'image' | 'quiz' | 'heading' | 'list';
  content: string;
  metadata?: {
    level?: number;
    source?: string;
    author?: string;
    score?: number;
    sentiment?: number;
    [key: string]: any;
  };
}

export interface Persona {
  id: number;
  name: string;
  avatar_url?: string;
  tone: string;
  style_preferences?: {
    layout_preference?: number;
    content_style?: string;
    emoji_usage?: boolean;
    [key: string]: any;
  };
  target_audience?: string;
  content_focus?: string[];
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  post_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  author: string;
  body: string;
  score: number;
  sentiment?: {
    compound: number;
    pos: number;
    neg: number;
    neu: number;
  };
  reddit_comment_id?: string;
  thread_level: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  post_id: string;
  title: string;
  questions: QuizQuestion[];
  completion_count: number;
  average_score?: number;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface QuizResponse {
  id: string;
  quiz_id: string;
  user_id?: string;
  answers: number[];
  score: number;
  completion_time?: number;
  created_at: string;
}

export interface Image {
  id: string;
  post_id: string;
  url: string;
  alt_text?: string;
  caption?: string;
  license_type: string;
  author?: string;
  credit_text?: string;
  source_link?: string;
  width?: number;
  height?: number;
  file_size?: number;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  category?: string;
  post_count: number;
  trending_score: number;
  start_date?: string;
  end_date?: string;
  metadata?: {
    keywords?: string[];
    related_topics?: string[];
    source_threads?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  post_id?: string;
  interaction_type:
    | 'view'
    | 'share'
    | 'quiz_complete'
    | 'comment'
    | 'like'
    | 'bookmark';
  metadata?: {
    source?: string;
    platform?: string;
    quiz_score?: number;
    [key: string]: any;
  };
  created_at: string;
}
