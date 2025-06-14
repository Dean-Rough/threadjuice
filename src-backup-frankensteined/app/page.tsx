'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { PostCard } from '@/components/ui/PostCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ShareBar } from '@/components/ui/ShareBar';
import { TrendingFeed } from '@/components/features/TrendingFeed';
import { Quiz } from '@/components/features/Quiz';
import { CategoryFilter } from '@/components/features/CategoryFilter';
import { FeaturedCarousel } from '@/components/features/FeaturedCarousel';
import { TrendingMarquee } from '@/components/features/TrendingMarquee';
import { Post } from '@/types/database';

// Demo data for showcasing components
const mockPosts: Post[] = [
  {
    id: '1',
    slug: 'viral-reddit-thread',
    title: '🔥 This Reddit thread about time travel theories is blowing up',
    hook: 'A physicist explains why time travel might actually be possible, and Reddit is losing its mind over the implications.',
    content: [{ type: 'paragraph' as const, content: 'Post content here...' }],
    featured_image: 'https://picsum.photos/800/450?random=1',
    category: 'Technology',
    persona_id: 1,
    layout_style: 1,
    featured: true,
    trending_score: 89,
    view_count: 15420,
    share_count: 234,
    created_at: '2025-06-13T16:40:32.329Z',
    updated_at: '2025-06-13T16:40:32.329Z',
    event_id: 'event-1',
    status: 'published',
    reddit_thread_id: 'reddit-123',
    word_count: 850,
    seo_title: 'Time Travel Theory Reddit Thread Goes Viral',
    seo_description: 'Physicist explains time travel possibility',
    social_image: 'https://picsum.photos/800/450?random=1',
  },
  {
    id: '2',
    slug: 'ai-takes-over-reddit',
    title:
      '🤖 AI bot accidentally becomes most popular user on r/relationship_advice',
    hook: 'Nobody realized it was AI for 6 months. The advice was apparently too good.',
    content: [{ type: 'paragraph' as const, content: 'Post content here...' }],
    featured_image: 'https://picsum.photos/800/450?random=2',
    category: 'Entertainment',
    persona_id: 2,
    layout_style: 2,
    featured: false,
    trending_score: 76,
    view_count: 8930,
    share_count: 156,
    created_at: '2025-06-12T16:40:32.329Z',
    updated_at: '2025-06-12T16:40:32.329Z',
    event_id: 'event-2',
    status: 'published',
    reddit_thread_id: 'reddit-456',
    word_count: 920,
    seo_title: 'AI Bot Popular on Reddit Advice',
    seo_description: 'AI provides relationship advice on Reddit',
    social_image: 'https://picsum.photos/800/450?random=2',
  },
  {
    id: '3',
    slug: 'crypto-pizza-disaster',
    title:
      '💸 Guy spends $50,000 in crypto to order pizza, immediately regrets everything',
    hook: 'Gas fees were more expensive than the pizza. The comments are brutal.',
    content: [{ type: 'paragraph' as const, content: 'Post content here...' }],
    featured_image: 'https://picsum.photos/800/450?random=3',
    category: 'News',
    persona_id: 3,
    layout_style: 3,
    featured: true,
    trending_score: 92,
    view_count: 23140,
    share_count: 445,
    created_at: '2025-06-11T16:40:32.329Z',
    updated_at: '2025-06-11T16:40:32.329Z',
    event_id: 'event-3',
    status: 'published',
    reddit_thread_id: 'reddit-789',
    word_count: 680,
    seo_title: 'Expensive Crypto Pizza Order Goes Wrong',
    seo_description: 'High gas fees make pizza order extremely expensive',
    social_image: 'https://picsum.photos/800/450?random=3',
  },
];

const quizQuestions = [
  {
    id: '1',
    question: 'What makes content go viral on Reddit?',
    options: [
      { id: 'a', text: 'Posting at exactly 3:17 AM', isCorrect: false },
      {
        id: 'b',
        text: 'Perfect timing + emotional resonance + shareability',
        isCorrect: true,
      },
      { id: 'c', text: 'Using lots of emojis', isCorrect: false },
      { id: 'd', text: 'Mentioning cats', isCorrect: false },
    ],
    explanation:
      'Viral content typically combines perfect timing with emotional resonance and high shareability.',
    difficulty: 'medium' as const,
    category: 'Social Media',
  },
  {
    id: '2',
    question: 'Which subreddit has the most unpredictable comment sections?',
    options: [
      { id: 'a', text: 'r/aww', isCorrect: false },
      { id: 'b', text: 'r/AskReddit', isCorrect: true },
      { id: 'c', text: 'r/recipes', isCorrect: false },
      { id: 'd', text: 'r/mildlyinteresting', isCorrect: false },
    ],
    explanation:
      'r/AskReddit threads can go from wholesome to chaotic in seconds.',
    difficulty: 'easy' as const,
    category: 'Reddit Culture',
  },
];

// Mock data for additional components
const mockCategories = [
  {
    id: '1',
    name: 'All',
    slug: 'all',
    count: 156,
    color: '#3B82F6',
    icon: '📰',
  },
  {
    id: '2',
    name: 'Technology',
    slug: 'technology',
    count: 45,
    color: '#8B5CF6',
    icon: '💻',
  },
  {
    id: '3',
    name: 'Entertainment',
    slug: 'entertainment',
    count: 38,
    color: '#F59E0B',
    icon: '🎬',
  },
  {
    id: '4',
    name: 'News',
    slug: 'news',
    count: 52,
    color: '#EF4444',
    icon: '📡',
  },
  {
    id: '5',
    name: 'Science',
    slug: 'science',
    count: 21,
    color: '#10B981',
    icon: '🔬',
  },
];

const mockFeaturedPosts = mockPosts.map(post => ({
  id: post.id,
  title: post.title,
  excerpt: post.hook,
  image: post.featured_image || 'https://picsum.photos/800/450?random=0',
  category: post.category || 'General',
  author: {
    name: 'AI Writer',
    avatar: 'https://picsum.photos/60/60?random=100',
  },
  publishedAt: post.created_at,
  readTime: Math.ceil((post as any).word_count / 200),
  slug: post.slug,
  tags: ['trending', 'viral', 'reddit'],
}));

const mockTrendingTopics = [
  {
    id: '1',
    text: 'AI takes over Reddit relationship advice',
    url: '/trending/ai-advice',
    category: 'Tech',
    trending: true,
    growth: 250,
    icon: '🤖',
  },
  {
    id: '2',
    text: 'Crypto pizza costs $50,000 in gas fees',
    url: '/trending/crypto-pizza',
    category: 'Finance',
    trending: true,
    growth: 180,
    icon: '💸',
  },
  {
    id: '3',
    text: 'Time travel theory physicist goes viral',
    url: '/trending/time-travel',
    category: 'Science',
    trending: true,
    growth: 320,
    icon: '⏰',
  },
  {
    id: '4',
    text: 'Cat accidentally starts million-dollar business',
    url: '/trending/cat-business',
    category: 'Business',
    trending: true,
    growth: 150,
    icon: '🐱',
  },
  {
    id: '5',
    text: 'Reddit user discovers lost city in backyard',
    url: '/trending/lost-city',
    category: 'News',
    trending: true,
    growth: 400,
    icon: '🏛️',
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className='min-h-screen'>
      {/* Trending Marquee */}
      <TrendingMarquee
        topics={mockTrendingTopics}
        variant='default'
        speed='normal'
        pauseOnHover={true}
        showIcons={true}
        showGrowth={true}
      />

      {/* Hero Section */}
      <section className='bg-gradient-to-br from-blue-50 to-indigo-100 py-16 dark:from-gray-900 dark:to-gray-800'>
        <div className='container mx-auto px-4'>
          <div className='mb-8 text-center'>
            <h1 className='mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent'>
              Welcome to ThreadJuice
            </h1>
            <p className='mb-8 text-xl text-gray-600 dark:text-gray-300'>
              Transform Reddit threads into viral content with AI ✨
            </p>

            <div className='mb-8 flex flex-col items-center gap-4'>
              <SignedOut>
                <SignInButton>
                  <button className='transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className='flex items-center gap-4'>
                  <p className='text-lg'>Welcome back!</p>
                  <UserButton afterSignOutUrl='/' />
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Demo Components Showcase */}
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
              <h3 className='mb-4 text-lg font-semibold'>Loading States</h3>
              <div className='space-y-4'>
                <LoadingSpinner
                  variant='sarsa'
                  text='Processing viral content...'
                  animated={true}
                />
                <LoadingSpinner variant='dots' size='small' />
                <LoadingSpinner variant='pulse' size='medium' />
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
              <h3 className='mb-4 text-lg font-semibold'>Share Component</h3>
              <ShareBar
                url='https://threadjuice.com/demo'
                title='Check out ThreadJuice!'
                description='Transform Reddit into viral content'
                variant='compact'
                animated={true}
                shareCount={1234}
              />
            </div>

            <div className='rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
              <h3 className='mb-4 text-lg font-semibold'>Interactive Quiz</h3>
              <Quiz
                questions={quizQuestions}
                title='Reddit Mastery Quiz'
                description='Test your knowledge!'
                variant='card'
                showProgress={true}
                allowReview={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Carousel Section */}
      <section className='bg-white py-16 dark:bg-gray-900'>
        <div className='container mx-auto px-4'>
          <h2 className='mb-12 text-center text-3xl font-bold'>
            Featured Stories
          </h2>
          <FeaturedCarousel
            posts={mockFeaturedPosts}
            variant='hero'
            autoPlay={true}
            autoPlayInterval={4000}
            showDots={true}
            showArrows={true}
            slidesToShow={1}
          />
        </div>
      </section>

      {/* Category Filter Section */}
      <section className='bg-gray-50 py-8 dark:bg-gray-800'>
        <div className='container mx-auto px-4'>
          <h3 className='mb-8 text-center text-2xl font-bold'>
            Browse by Category
          </h3>
          <div className='mx-auto max-w-4xl'>
            <CategoryFilter
              categories={mockCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              variant='pills'
              showCounts={true}
            />
          </div>
        </div>
      </section>

      {/* Trending Feed Section */}
      <section className='bg-white py-16 dark:bg-gray-900'>
        <div className='container mx-auto px-4'>
          <TrendingFeed
            posts={mockPosts}
            layout='magazine'
            showFilters={true}
            isLoading={false}
            hasMore={true}
          />
        </div>
      </section>

      {/* Component Variants Showcase */}
      <section className='bg-gray-50 py-16 dark:bg-gray-800'>
        <div className='container mx-auto px-4'>
          <h2 className='mb-12 text-center text-3xl font-bold'>
            Component Showcase
          </h2>

          {/* Trending Marquee Variants */}
          <div className='mb-12'>
            <h3 className='mb-6 text-xl font-semibold'>
              Trending Marquee Variants
            </h3>
            <div className='space-y-4'>
              <TrendingMarquee
                topics={mockTrendingTopics.slice(0, 3)}
                variant='ticker'
                speed='fast'
              />
              <TrendingMarquee
                topics={mockTrendingTopics.slice(0, 3)}
                variant='news'
                speed='normal'
              />
              <TrendingMarquee
                topics={mockTrendingTopics.slice(0, 3)}
                variant='compact'
                speed='slow'
              />
            </div>
          </div>

          {/* Carousel Variants */}
          <div className='mb-12'>
            <h3 className='mb-6 text-xl font-semibold'>Carousel Variants</h3>
            <div className='space-y-8'>
              <FeaturedCarousel
                posts={mockFeaturedPosts}
                variant='cards'
                slidesToShow={3}
                autoPlay={false}
              />
              <FeaturedCarousel
                posts={mockFeaturedPosts}
                variant='compact'
                slidesToShow={1}
                showDots={false}
              />
            </div>
          </div>

          {/* Category Filter Variants */}
          <div className='mb-12'>
            <h3 className='mb-6 text-xl font-semibold'>
              Category Filter Variants
            </h3>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
              <div>
                <h4 className='mb-3 text-lg font-medium'>Tabs Variant</h4>
                <CategoryFilter
                  categories={mockCategories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  variant='tabs'
                />
              </div>
              <div>
                <h4 className='mb-3 text-lg font-medium'>Dropdown Variant</h4>
                <CategoryFilter
                  categories={mockCategories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  variant='dropdown'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Post Cards */}
      <section className='bg-white py-16 dark:bg-gray-900'>
        <div className='container mx-auto px-4'>
          <h2 className='mb-12 text-center text-3xl font-bold'>
            Featured Posts
          </h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {mockPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                variant='magazine'
                showExcerpt={true}
                showMeta={true}
                showPersona={true}
                animationDelay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 py-8 text-white'>
        <div className='container mx-auto px-4 text-center'>
          <p className='mb-4'>
            🤖 Generated with Claude Code - ThreadJuice Demo
          </p>
          <p className='text-gray-400'>
            Sarsa Template Integration • Reddit API • AI Processing
          </p>
        </div>
      </footer>
    </div>
  );
}
