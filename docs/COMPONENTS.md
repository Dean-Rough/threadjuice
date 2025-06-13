# Component Breakdown

## TypeScript Interfaces

```typescript
// Core data types
interface Post {
  id: string;
  title: string;
  slug: string;
  hook: string;
  content: ContentBlock[];
  personaId: number;
  status: 'draft' | 'published' | 'archived';
  eventId?: string;
  redditThreadId?: string;
  subreddit?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentBlock {
  type: 'paragraph' | 'comment_cluster' | 'image' | 'quiz';
  content: string;
  metadata?: Record<string, any>;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  body: string;
  score: number;
  sentiment: { compound: number; pos: number; neg: number };
  redditCommentId?: string;
}

interface Persona {
  id: number;
  name: string;
  avatarUrl: string;
  tone: string;
}

interface Quiz {
  id: string;
  postId: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

// Sarsa Template Interfaces
interface LayoutProps {
  headerStyle?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  footerStyle?: 1 | 2 | 3;
  children: React.ReactNode;
  breadcrumbCategory?: string;
  breadcrumbPostTitle?: string;
  footerClass?: string;
  headTitle?: string;
  logoWhite?: boolean;
}

interface SwiperConfig {
  slidesPerView: number;
  spaceBetween: number;
  autoplay?: boolean;
  navigation?: boolean;
  pagination?: boolean;
  breakpoints?: Record<number, { slidesPerView: number; spaceBetween: number }>;
}

interface IsotopeFilter {
  category: string;
  label: string;
  count?: number;
}
```

## Sarsa Layout Components

### Main Layout System

```typescript
// components/layout/Layout.tsx - Main layout controller
interface LayoutProps {
  headerStyle?: number;
  footerStyle?: number;
  children: React.ReactNode;
  breadcrumbCategory?: string;
  breadcrumbPostTitle?: string;
  footerClass?: string;
  headTitle?: string;
  logoWhite?: boolean;
}
export function Layout({
  headerStyle,
  footerStyle,
  children,
  breadcrumbCategory,
  breadcrumbPostTitle,
  footerClass,
  headTitle,
  logoWhite,
}: LayoutProps);

// components/layout/Header/Header1.tsx - Main news layout
interface HeaderProps {
  handleMobileMenuOpen: () => void;
  handleMobileMenuClose: () => void;
  scroll: boolean;
  langToggle: boolean;
  handleLangToggle: () => void;
  handleSidebarOpen: () => void;
  handleSidebarClose: () => void;
}
export function Header1(props: HeaderProps);

// components/layout/Footer/Footer1.tsx - Standard footer
export function Footer1();

// components/layout/Breadcrumb.tsx - Navigation breadcrumbs
interface BreadcrumbProps {
  breadcrumbCategory: string;
  breadcrumbPostTitle?: string;
}
export function Breadcrumb({
  breadcrumbCategory,
  breadcrumbPostTitle,
}: BreadcrumbProps);

// components/layout/PageHead.tsx - SEO and meta tags
interface PageHeadProps {
  headTitle?: string;
}
export function PageHead({ headTitle }: PageHeadProps);
```

### Header Variations

```typescript
// components/layout/Header/Header2.tsx - Magazine style
export function Header2(props: HeaderProps);

// components/layout/Header/Header3.tsx - Minimal layout
export function Header3(props: HeaderProps);

// components/layout/Header/Header4.tsx - Tech-focused
export function Header4(props: HeaderProps);

// components/layout/Header/Header5.tsx - Social media style
export function Header5(props: HeaderProps);

// components/layout/Header/Header6.tsx - Fashion/lifestyle
export function Header6(props: HeaderProps);

// components/layout/Header/Header7.tsx - Adventure/travel
export function Header7(props: HeaderProps);
```

## Sarsa-Enhanced UI Components

### Core UI Components (Sarsa-styled)

```typescript
// components/ui/PostCard.tsx - News-style post cards
interface PostCardProps {
  post: Post & { persona: Persona };
  compact?: boolean;
  variant?: 'default' | 'featured' | 'minimal' | 'grid';
  showCategory?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  onShare?: (postId: string) => void;
}
export function PostCard({
  post,
  compact = false,
  variant = 'default',
  showCategory = true,
  showAuthor = true,
  showDate = true,
  onShare,
}: PostCardProps);

// components/ui/PersonaBadge.tsx - Author badges with Sarsa styling
interface PersonaBadgeProps {
  persona: Persona;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
}
export function PersonaBadge({
  persona,
  size = 'md',
  showName = true,
  variant = 'default',
}: PersonaBadgeProps);

// components/ui/ShareBar.tsx - Social sharing with Sarsa button styles
interface ShareBarProps {
  url: string;
  title: string;
  image?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'floating';
  platforms?: ('facebook' | 'twitter' | 'linkedin' | 'reddit' | 'whatsapp')[];
}
export function ShareBar({
  url,
  title,
  image,
  className,
  variant = 'horizontal',
  platforms = ['facebook', 'twitter', 'linkedin', 'reddit'],
}: ShareBarProps);

// components/ui/CategoryBadge.tsx - Content category tags
interface CategoryBadgeProps {
  category: string;
  variant?: 'default' | 'outlined' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
}
export function CategoryBadge({
  category,
  variant = 'default',
  size = 'md',
  clickable = false,
  onClick,
}: CategoryBadgeProps);

// components/ui/TrendingBadge.tsx - Viral content indicators
interface TrendingBadgeProps {
  score: number;
  variant?: 'fire' | 'trending' | 'hot' | 'viral';
  animated?: boolean;
}
export function TrendingBadge({
  score,
  variant = 'trending',
  animated = true,
}: TrendingBadgeProps);

// components/ui/LoadingSpinner.tsx - Animated loading with WOW.js
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
}
export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  text,
}: LoadingSpinnerProps);
```

## Sarsa Animation Components

### Animation Wrappers

```typescript
// components/elements/WowAnimation.tsx - WOW.js wrapper
interface WowAnimationProps {
  children: React.ReactNode;
  animation?:
    | 'fadeIn'
    | 'slideInUp'
    | 'slideInLeft'
    | 'slideInRight'
    | 'zoomIn';
  delay?: number;
  duration?: number;
  offset?: number;
}
export function WowAnimation({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 1000,
  offset = 100,
}: WowAnimationProps);

// components/elements/TypewriterText.tsx - Typewriter effect
interface TypewriterTextProps {
  strings: string[];
  typeSpeed?: number;
  backSpeed?: number;
  loop?: boolean;
  className?: string;
}
export function TypewriterText({
  strings,
  typeSpeed = 50,
  backSpeed = 30,
  loop = true,
  className,
}: TypewriterTextProps);

// components/elements/BackToTop.tsx - Scroll to top button
export function BackToTop();
```

## Sarsa Slider Components

### Carousel and Slider Components

```typescript
// components/slider/FeaturedCarousel.tsx - Hero section carousel
interface FeaturedCarouselProps {
  posts: (Post & { persona: Persona })[];
  autoplay?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  height?: string;
}
export function FeaturedCarousel({
  posts,
  autoplay = true,
  showNavigation = true,
  showPagination = true,
  height = '500px',
}: FeaturedCarouselProps);

// components/slider/PostSlider.tsx - Post carousel
interface PostSliderProps {
  posts: (Post & { persona: Persona })[];
  slidesPerView?: number;
  spaceBetween?: number;
  breakpoints?: Record<number, { slidesPerView: number; spaceBetween: number }>;
  navigation?: boolean;
  pagination?: boolean;
}
export function PostSlider({
  posts,
  slidesPerView = 3,
  spaceBetween = 30,
  breakpoints,
  navigation = true,
  pagination = false,
}: PostSliderProps);

// components/slider/TrendingMarquee.tsx - Scrolling trending topics
interface TrendingMarqueeProps {
  topics: string[];
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  gradient?: boolean;
}
export function TrendingMarquee({
  topics,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  gradient = true,
}: TrendingMarqueeProps);
```

## Enhanced Feature Components

### Advanced Feature Components (Sarsa-enhanced)

```typescript
// components/features/TrendingFeed.tsx - Magazine-style post feed
interface TrendingFeedProps {
  limit?: number;
  filter?: { status?: string; persona?: string; category?: string };
  layout?: 'grid' | 'list' | 'masonry' | 'magazine';
  showFilters?: boolean;
  showLoadMore?: boolean;
  infiniteScroll?: boolean;
}
export function TrendingFeed({
  limit = 20,
  filter,
  layout = 'magazine',
  showFilters = true,
  showLoadMore = false,
  infiniteScroll = true,
}: TrendingFeedProps);

// components/features/CategoryFilter.tsx - Isotope-powered filtering
interface CategoryFilterProps {
  categories: IsotopeFilter[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  showCounts?: boolean;
}
export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  layout = 'horizontal',
  showCounts = true,
}: CategoryFilterProps);

// components/features/Quiz.tsx - Interactive quiz with Sarsa styling
interface QuizProps {
  quiz: Quiz;
  onComplete: (answers: number[], score: number) => void;
  variant?: 'default' | 'card' | 'fullscreen';
  showProgress?: boolean;
  allowReview?: boolean;
}
export function Quiz({
  quiz,
  onComplete,
  variant = 'default',
  showProgress = true,
  allowReview = false,
}: QuizProps);

// components/features/PostDetail.tsx - Article layout with sidebar
interface PostDetailProps {
  post: Post & { persona: Persona; comments?: Comment[] };
  showSidebar?: boolean;
  showComments?: boolean;
  showRelated?: boolean;
  layout?: 'default' | 'minimal' | 'magazine';
}
export function PostDetail({
  post,
  showSidebar = true,
  showComments = true,
  showRelated = true,
  layout = 'default',
}: PostDetailProps);

// components/features/CommentScreenshot.tsx - Reddit-style comment display
interface CommentScreenshotProps {
  comment: Comment;
  theme?: 'light' | 'dark' | 'reddit';
  showScore?: boolean;
  showReplies?: boolean;
  className?: string;
}
export function CommentScreenshot({
  comment,
  theme = 'light',
  showScore = true,
  showReplies = false,
  className,
}: CommentScreenshotProps);
```

## Sidebar Components

### Sidebar Widgets (Sarsa-styled)

```typescript
// components/sidebar/PopularPosts.tsx - Popular posts widget
interface PopularPostsProps {
  posts: (Post & { persona: Persona })[];
  limit?: number;
  timeframe?: 'day' | 'week' | 'month' | 'all';
  variant?: 'default' | 'minimal' | 'numbered';
}
export function PopularPosts({
  posts,
  limit = 5,
  timeframe = 'week',
  variant = 'default',
}: PopularPostsProps);

// components/sidebar/CategoryList.tsx - Category navigation
interface CategoryListProps {
  categories: { name: string; count: number; slug: string }[];
  activeCategory?: string;
  showCounts?: boolean;
  variant?: 'default' | 'minimal' | 'badges';
}
export function CategoryList({
  categories,
  activeCategory,
  showCounts = true,
  variant = 'default',
}: CategoryListProps);

// components/sidebar/NewsletterSignup.tsx - Email subscription widget
interface NewsletterSignupProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'minimal' | 'card';
  onSubscribe: (email: string) => Promise<void>;
}
export function NewsletterSignup({
  title = 'Stay Updated',
  description = 'Get the latest viral content delivered to your inbox',
  variant = 'default',
  onSubscribe,
}: NewsletterSignupProps);

// components/sidebar/SocialFollow.tsx - Social media links
interface SocialFollowProps {
  platforms: { name: string; url: string; icon: string; followers?: string }[];
  variant?: 'default' | 'minimal' | 'detailed';
  showFollowers?: boolean;
}
export function SocialFollow({
  platforms,
  variant = 'default',
  showFollowers = false,
}: SocialFollowProps);
```

## Custom Hooks (Sarsa-enhanced)

### Animation and Interaction Hooks

```typescript
// hooks/useIsotope.ts - Grid filtering hook
interface UseIsotopeOptions {
  itemSelector: string;
  layoutMode?: 'masonry' | 'fitRows' | 'cellsByRow';
  sortBy?: string;
  sortAscending?: boolean;
}
export function useIsotope(
  containerRef: RefObject<HTMLElement>,
  options: UseIsotopeOptions
);

// hooks/useSwiper.ts - Carousel management hook
interface UseSwiperOptions extends SwiperConfig {
  onSlideChange?: (swiper: any) => void;
  onReachEnd?: () => void;
}
export function useSwiper(options: UseSwiperOptions);

// hooks/useWowAnimation.ts - WOW.js integration hook
export function useWowAnimation();

// hooks/useInfiniteScroll.ts - Pagination with animations
interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootMargin?: string;
}
export function useInfiniteScroll(options: UseInfiniteScrollOptions);

// hooks/useMarquee.ts - Scrolling text management
interface UseMarqueeOptions {
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}
export function useMarquee(options: UseMarqueeOptions);
```

## Page Components (Sarsa Layouts)

```typescript
// app/page.tsx - Homepage with featured carousel
export default function HomePage() {
  return (
    <Layout headerStyle={1} footerStyle={1}>
      <FeaturedCarousel posts={featuredPosts} />
      <TrendingMarquee topics={trendingTopics} />
      <TrendingFeed layout="magazine" limit={12} />
    </Layout>
  );
}

// app/posts/[slug]/page.tsx - Article layout
interface PostPageProps {
  params: { slug: string };
}
export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  return (
    <Layout
      headerStyle={3}
      footerStyle={1}
      breadcrumbCategory={post.category}
      breadcrumbPostTitle={post.title}
    >
      <PostDetail post={post} layout="magazine" />
    </Layout>
  );
}

// app/category/[category]/page.tsx - Category archive
interface CategoryPageProps {
  params: { category: string };
}
export default async function CategoryPage({ params }: CategoryPageProps) {
  const posts = await getPostsByCategory(params.category);
  return (
    <Layout headerStyle={2} footerStyle={1}>
      <CategoryFilter categories={categories} activeCategory={params.category} />
      <TrendingFeed filter={{ category: params.category }} layout="grid" />
    </Layout>
  );
}

// app/(auth)/dashboard/page.tsx - Admin dashboard
export default function DashboardPage() {
  const { userId } = auth();
  return (
    <Layout headerStyle={4} footerStyle={2}>
      <UserDashboard userId={userId} />
    </Layout>
  );
}
```

## Backend Services (Enhanced)

```typescript
// lib/database.ts - Supabase client with caching
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function getPosts(params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  sortBy?: 'created_at' | 'updated_at' | 'views' | 'shares';
  sortOrder?: 'asc' | 'desc';
}) {
  let query = supabase
    .from('posts')
    .select('*, persona:personas(*)')
    .eq('status', params.status || 'published');

  if (params.category) {
    query = query.eq('category', params.category);
  }

  query = query
    .order(params.sortBy || 'created_at', {
      ascending: params.sortOrder === 'asc',
    })
    .range(
      ((params.page || 1) - 1) * (params.limit || 20),
      (params.page || 1) * (params.limit || 20) - 1
    );

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// lib/redditScraper.ts - Enhanced Reddit API client
interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
  rateLimitDelay?: number;
}

export class RedditScraper {
  private accessToken?: string;
  private rateLimiter: RateLimiter;

  constructor(private config: RedditConfig) {
    this.rateLimiter = new RateLimiter(config.rateLimitDelay || 1000);
  }

  async authenticate(): Promise<void> {
    // OAuth2 flow implementation with error handling
  }

  async getHotPosts(subreddit: string, limit = 25): Promise<RedditPost[]> {
    // API call with rate limiting and retry logic
  }

  async getComments(threadId: string): Promise<RedditComment[]> {
    // Fetch thread comments with pagination
  }

  async searchPosts(query: string, subreddit?: string): Promise<RedditPost[]> {
    // Search functionality
  }
}

// lib/gptSummariser.ts - Enhanced OpenAI integration
import OpenAI from 'openai';

export class GPTSummariser {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async summarizeThread(
    thread: RedditPost,
    comments: RedditComment[],
    persona: Persona
  ): Promise<ContentBlock[]> {
    // Enhanced summarization with persona-specific prompts
  }

  async generateQuiz(content: string): Promise<QuizQuestion[]> {
    // Generate quiz questions from content
  }

  async generateSocialCopy(post: Post): Promise<{
    twitter: string;
    facebook: string;
    linkedin: string;
  }> {
    // Generate platform-specific social media copy
  }
}

// lib/imageGenerator.ts - Social media image generation
export class ImageGenerator {
  async generatePostImage(post: Post): Promise<string> {
    // Generate custom social media images
  }

  async generateQuizResultImage(
    quiz: Quiz,
    score: number,
    userName: string
  ): Promise<string> {
    // Generate shareable quiz result images
  }
}
```

## Styling Integration

### SCSS and Tailwind Integration

```typescript
// styles/sarsa-integration.scss - Sarsa styles integration
@import 'sarsa/main';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

// Custom component styles that blend Sarsa with Tailwind
.post-card-sarsa {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
  // Sarsa-specific styling
}

.trending-badge-animated {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
  // Animation from Sarsa WOW.js integration
}

// tailwind.config.js additions for Sarsa integration
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sarsa': ['Arimo', 'sans-serif'], // Sarsa template font
      },
      colors: {
        'sarsa-primary': '#your-primary-color',
        'sarsa-secondary': '#your-secondary-color',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee2': 'marquee2 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
}
```
