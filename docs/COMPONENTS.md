# Component Architecture

## Overview

ThreadJuice uses a modern component architecture built with Next.js 15, TypeScript, and shadcn/ui. The system emphasizes reusability, type safety, and professional design patterns.

## Core TypeScript Interfaces

### Data Models

```typescript
// Core post interface
interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: {
    sections: Array<{
      type: 'paragraph' | 'heading' | 'quote' | 'image';
      content: string;
      metadata?: any;
    }>;
  };
  image_url?: string;
  category: string;
  author: string;
  persona?: Persona;
  view_count: number;
  upvote_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  trending: boolean;
  featured: boolean;
  reddit_source?: {
    thread_id: string;
    subreddit: string;
    original_url: string;
  };
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Writer persona interface
interface Persona {
  id: number;
  name: string;
  slug: string;
  bio: string;
  avatar_url: string;
  tone: string;
  story_count: number;
  rating: number;
  created_at: string;
}

// Category interface
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  color: string;
}

// Comment interface
interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  user_id?: string;
  author_name: string;
  content: string;
  upvote_count: number;
  downvote_count: number;
  is_reddit_excerpt: boolean;
  reddit_score?: number;
  created_at: string;
  replies?: Comment[];
}

// User interaction interface
interface UserInteraction {
  id: string;
  user_id?: string;
  post_id: string;
  interaction_type: 'upvote' | 'downvote' | 'bookmark' | 'share' | 'view';
  metadata?: {
    share_platform?: 'twitter' | 'facebook' | 'reddit' | 'copy';
    user_agent?: string;
    referrer?: string;
  };
  created_at: string;
}
```

## Core UI Components (shadcn/ui)

### Base Components

```typescript
// components/ui/card.tsx - Base card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
export function Card({ className, ...props }: CardProps);
export function CardHeader({ className, ...props }: CardProps);
export function CardContent({ className, ...props }: CardProps);
export function CardTitle({ className, ...props }: CardProps);

// components/ui/badge.tsx - Status and category badges
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
export function Badge({ className, variant = 'default', ...props }: BadgeProps);

// components/ui/button.tsx - Interactive buttons
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps);

// components/ui/avatar.tsx - User and persona avatars
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
export function Avatar({ className, ...props }: AvatarProps);
export function AvatarImage({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>);
export function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>);

// components/ui/skeleton.tsx - Loading placeholders
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
export function Skeleton({ className, ...props }: SkeletonProps);
```

## Main Feature Components

### HeroCarousel Component

```typescript
// components/HeroCarousel.tsx - Auto-cycling hero section
interface HeroCarouselProps {
  posts?: Post[];
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  className?: string;
}

export function HeroCarousel({
  posts = [],
  autoplay = true,
  interval = 5000,
  showDots = true,
  className,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-cycling logic
  useEffect(() => {
    if (!autoplay || posts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % posts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, posts.length]);

  return (
    <section className={cn("relative h-[600px] overflow-hidden", className)}>
      {/* Background slides */}
      {/* Navigation dots */}
      {/* Content overlay */}
    </section>
  );
}
```

### TrendingFeed Component

```typescript
// components/TrendingFeed.tsx - Main content feed
interface TrendingFeedProps {
  initialPosts?: Post[];
  category?: string;
  author?: string;
  trending?: boolean;
  featured?: boolean;
  limit?: number;
  layout?: 'grid' | 'list' | 'masonry';
  showLoadMore?: boolean;
  className?: string;
}

export function TrendingFeed({
  initialPosts = [],
  category,
  author,
  trending,
  featured,
  limit = 12,
  layout = 'grid',
  showLoadMore = true,
  className,
}: TrendingFeedProps) {
  const { data: postsResponse, isLoading, error } = usePosts({
    category,
    author,
    trending,
    featured,
    limit,
  });

  // Grid layout implementation
  // Loading states
  // Error handling

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filter stats */}
      {/* Posts grid */}
      {/* Load more button */}
    </div>
  );
}
```

### Filter Pages

```typescript
// app/filter/[type]/[value]/page.tsx - Dynamic filter pages
interface FilterPageProps {
  params: {
    type: 'category' | 'author';
    value: string;
  };
}

export default function FilterPage({ params }: FilterPageProps) {
  const { type, value } = params;

  // Convert URL slug to display format
  const displayValue = value.replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const filterTitle = type === 'category'
    ? `${displayValue} Stories`
    : `Stories by ${displayValue}`;

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        {/* Filter hero section */}
        {/* Main content with TrendingFeed */}
        {/* Sidebar */}
        {/* Footer */}
      </div>
    </QueryProvider>
  );
}
```

### Blog Detail Component

```typescript
// app/blog/[slug]/page.tsx - Article detail page
interface BlogPostProps {
  params: { slug: string };
}

export default function BlogPost({ params }: BlogPostProps) {
  const { slug } = params;

  // Mock post data (would come from API/database)
  const post = {
    title: "Article Title",
    category: "viral",
    author: "The Snarky Sage",
    date: "2 hours ago",
    image: "/assets/img/lifestyle/life_style01.jpg",
    content: `/* Article content */`
  };

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        {/* Header with category ticker */}

        {/* Main content layout */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Article content (3/4 width) */}
            <div className="lg:col-span-3">
              {/* Image and description */}
              {/* Headline and author */}
              {/* Voting toolbar */}
              {/* Article content */}
              {/* Second voting toolbar */}
            </div>

            {/* Sidebar (1/4 width) */}
            <div className="lg:col-span-1">
              {/* Top 5 widget */}
              {/* Top Shared widget */}
            </div>
          </div>
        </main>

        {/* Footer */}
      </div>
    </QueryProvider>
  );
}
```

## Interactive Components

### Voting Toolbar

```typescript
// components/ui/VotingToolbar.tsx - Engagement toolbar
interface VotingToolbarProps {
  postId: string;
  stats: {
    upvote_count: number;
    comment_count: number;
    bookmark_count: number;
    share_count: number;
  };
  variant?: 'full' | 'compact';
  showLabel?: boolean;
  className?: string;
}

export function VotingToolbar({
  postId,
  stats,
  variant = 'full',
  showLabel = false,
  className,
}: VotingToolbarProps) {
  const handleInteraction = async (type: string) => {
    // Record interaction via API
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          interaction_type: type,
        }),
      });
    } catch (error) {
      console.error('Failed to record interaction:', error);
    }
  };

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {/* Upvote button */}
      <button
        onClick={() => handleInteraction('upvote')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-500/10 transition-colors group"
      >
        <ArrowUp className="h-5 w-5 text-muted-foreground group-hover:text-orange-500" />
        <span className="text-sm font-mono text-muted-foreground group-hover:text-orange-500">
          {stats.upvote_count}
        </span>
      </button>

      {/* Comment button */}
      {/* Bookmark button */}
      {/* Share button */}
    </div>
  );
}
```

### Category Ticker

```typescript
// components/ui/CategoryTicker.tsx - Scrolling category navigation
interface CategoryTickerProps {
  categories: string[];
  speed?: number;
  className?: string;
}

export function CategoryTicker({
  categories,
  speed = 40,
  className,
}: CategoryTickerProps) {
  return (
    <div className={cn("bg-orange-500 py-3 overflow-hidden", className)}>
      <div className="animate-scroll-left flex items-center space-x-4 whitespace-nowrap">
        {categories.map((category, index) => (
          <Link
            key={index}
            href={`/filter/category/${category.toLowerCase().replace(/ /g, '-')}`}
            className="bg-black text-white px-4 py-2 rounded-full text-sm font-extrabold whitespace-nowrap hover:bg-gray-800 transition-colors"
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## Data Management Components

### Post Service

```typescript
// services/postService.ts - Data fetching service
interface PostFilters {
  category?: string;
  author?: string;
  trending?: boolean;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class PostService {
  static async getPosts(filters: PostFilters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/posts?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  }

  static async getPostBySlug(slug: string) {
    const response = await fetch(`/api/posts/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return response.json();
  }

  static async getCategories() {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  static async getAuthors() {
    const response = await fetch('/api/authors');
    if (!response.ok) {
      throw new Error('Failed to fetch authors');
    }

    return response.json();
  }
}
```

### React Query Integration

```typescript
// hooks/usePosts.ts - Data fetching hook
import { useQuery } from '@tanstack/react-query';
import { PostService } from '@/services/postService';

interface UsePostsOptions {
  category?: string;
  author?: string;
  trending?: boolean;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  return useQuery({
    queryKey: ['posts', options],
    queryFn: () => PostService.getPosts(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => PostService.getPostBySlug(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: PostService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: PostService.getAuthors,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

## Layout and Provider Components

### Query Provider

```typescript
// providers/QueryProvider.tsx - React Query setup
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### UI Context Provider

```typescript
// contexts/UIContext.tsx - UI state management
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  mobileMenuOpen: boolean;
  sidebarOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        mobileMenuOpen,
        sidebarOpen,
        setMobileMenuOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
```

## Styling and Theme Configuration

### Tailwind Configuration

```javascript
// tailwind.config.js - Theme configuration
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'scroll-left': 'scroll-left 40s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### CSS Variables

```css
/* app/globals.css - Theme variables */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --radius: 0.5rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-extrabold;
  }
}

@keyframes scroll-left {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-scroll-left {
  animation: scroll-left 40s linear infinite;
}
```

This component architecture provides a solid foundation for ThreadJuice's viral content platform, emphasizing reusability, type safety, and modern React patterns with shadcn/ui integration.
