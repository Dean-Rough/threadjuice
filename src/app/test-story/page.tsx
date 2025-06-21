'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function TestStoryPage() {
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTestStory() {
      try {
        const response = await fetch('/api/test-story');
        if (!response.ok) {
          throw new Error(`Failed to load story: ${response.status}`);
        }
        const storyData = await response.json();
        setStory(storyData);
      } catch (err) {
        console.error('Error loading story:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTestStory();
  }, []);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500'></div>
          <p className='text-lg font-medium'>
            Loading our first modular story...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <p className='mb-4 text-lg text-red-500'>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className='rounded bg-orange-500 px-4 py-2 text-white'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <p className='text-lg'>No story found</p>
      </div>
    );
  }

  // Navigate to the actual blog post using the existing template
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link href='/' className='flex items-center space-x-2'>
                <img
                  src='/assets/img/logo/Icon.svg'
                  alt='ThreadJuice Icon'
                  className='h-16 w-16'
                />
                <img
                  src='/assets/img/logo/Logotype-White.svg'
                  alt='ThreadJuice'
                  className='h-12'
                />
              </Link>
              <p className='text-muted-foreground'>
                Get ratio&apos;d • The best stories from around the web
              </p>
            </div>
            <div className='flex items-center space-x-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white'>
              <CheckCircle className='h-4 w-4' />
              <span>FIRST MODULAR STORY!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message and Navigation */}
      <main>
        <div className='container mx-auto px-4 py-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <div className='mb-8 rounded-lg border border-green-300 bg-green-100 p-6'>
              <CheckCircle className='mx-auto mb-4 h-16 w-16 text-green-600' />
              <h1 className='mb-4 text-3xl font-extrabold text-green-800'>
                🎭 First ThreadJuice Modular Story Generated!
              </h1>
              <p className='mb-4 text-lg text-green-700'>
                Your story &quot;<strong>{story.title}</strong>&quot; has been
                successfully created with all 8 modular sections.
              </p>
              <div className='mb-6 grid grid-cols-2 gap-4 text-sm text-green-600'>
                <div>
                  <strong>Author:</strong> {story.persona?.name || story.author}
                </div>
                <div>
                  <strong>Sections:</strong>{' '}
                  {story.content?.sections?.length || 0}
                </div>
                <div>
                  <strong>Viral Score:</strong> {story.viral_score || 'N/A'}/10
                </div>
                <div>
                  <strong>Reading Time:</strong> {story.readingTime || 'N/A'}{' '}
                  min
                </div>
              </div>

              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Link
                  href={`/blog/${story.slug}`}
                  className='rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600'
                >
                  View Full Story with Sidebar & Components
                </Link>
                <Link
                  href='/'
                  className='flex items-center justify-center space-x-2 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-200'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>

            <div className='rounded-lg bg-gray-50 p-6 text-left'>
              <h3 className='mb-3 text-lg font-bold'>
                ✅ Modular Sections Verified:
              </h3>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                {story.content?.sections?.map((section, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>
                      {index + 1}. {section.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
