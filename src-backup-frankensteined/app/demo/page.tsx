'use client';

import { PostCard } from '@/components/ui/PostCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ShareBar } from '@/components/ui/ShareBar';
import { Post } from '@/types/database';

// Simple demo post
const demoPost: Post = {
  id: '1',
  slug: 'demo-post',
  title: '🔥 This is a demo post to test our components',
  hook: 'Testing our Sarsa-enhanced UI components with a simple demo post.',
  content: [{ type: 'paragraph' as const, content: 'Demo content...' }],
  featured_image: 'https://picsum.photos/800/450?random=99',
  category: 'Technology',
  persona_id: 1,
  layout_style: 1,
  featured: false,
  trending_score: 85,
  view_count: 1234,
  share_count: 56,
  created_at: '2025-06-13T16:40:32.329Z',
  updated_at: '2025-06-13T16:40:32.329Z',
  event_id: 'demo-event',
  status: 'published',
  reddit_thread_id: 'demo-reddit',
  word_count: 300,
  seo_title: 'Demo Post',
  seo_description: 'Demo description',
  social_image: 'https://picsum.photos/800/450?random=99',
};

export default function DemoPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto max-w-4xl px-4'>
        <h1 className='mb-8 text-center text-3xl font-bold'>
          ThreadJuice Component Demo
        </h1>

        {/* Component Tests */}
        <div className='space-y-8'>
          {/* Loading Spinners */}
          <section className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-4 text-xl font-semibold'>Loading Spinners</h2>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
              <div className='text-center'>
                <p className='mb-2 text-sm text-gray-600'>Default</p>
                <LoadingSpinner variant='default' />
              </div>
              <div className='text-center'>
                <p className='mb-2 text-sm text-gray-600'>Dots</p>
                <LoadingSpinner variant='dots' />
              </div>
              <div className='text-center'>
                <p className='mb-2 text-sm text-gray-600'>Pulse</p>
                <LoadingSpinner variant='pulse' />
              </div>
              <div className='text-center'>
                <p className='mb-2 text-sm text-gray-600'>Sarsa</p>
                <LoadingSpinner variant='sarsa' />
              </div>
            </div>
          </section>

          {/* Share Bar */}
          <section className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-4 text-xl font-semibold'>Share Bar</h2>
            <ShareBar
              url='https://threadjuice.com/demo'
              title='ThreadJuice Demo'
              description='Testing share functionality'
              variant='horizontal'
              shareCount={1234}
            />
          </section>

          {/* Post Card */}
          <section className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-4 text-xl font-semibold'>Post Card</h2>
            <div className='mx-auto max-w-md'>
              <PostCard
                post={demoPost}
                variant='default'
                showExcerpt={true}
                showMeta={true}
                showPersona={true}
              />
            </div>
          </section>

          {/* Different Post Card Variants */}
          <section className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-4 text-xl font-semibold'>Post Card Variants</h2>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <PostCard post={demoPost} variant='compact' />
              <PostCard post={demoPost} variant='minimal' />
              <PostCard post={demoPost} variant='magazine' />
            </div>
          </section>
        </div>

        {/* Debug Info */}
        <section className='mt-8 rounded-lg bg-gray-100 p-4'>
          <h3 className='mb-2 font-semibold'>Debug Info</h3>
          <p className='text-sm text-gray-600'>
            Server running on: <strong>http://localhost:3001/demo</strong>
          </p>
          <p className='text-sm text-gray-600'>
            Components loaded: LoadingSpinner, ShareBar, PostCard
          </p>
        </section>
      </div>
    </div>
  );
}
