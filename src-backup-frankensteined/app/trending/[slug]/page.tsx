'use client';

import { notFound } from 'next/navigation';

interface TrendingPageProps {
  params: {
    slug: string;
  };
}

const trendingTopics = {
  'ai-advice': {
    title: '🤖 AI takes over Reddit relationship advice',
    description:
      'Nobody realized it was AI for 6 months. The advice was apparently too good.',
    category: 'Tech',
    growth: '+250%',
  },
  'crypto-pizza': {
    title: '💸 Crypto pizza costs $50,000 in gas fees',
    description:
      'Gas fees were more expensive than the pizza. The comments are brutal.',
    category: 'Finance',
    growth: '+180%',
  },
  'time-travel': {
    title: '⏰ Time travel theory physicist goes viral',
    description:
      'A physicist explains why time travel might actually be possible, and Reddit is losing its mind.',
    category: 'Science',
    growth: '+320%',
  },
  'cat-business': {
    title: '🐱 Cat accidentally starts million-dollar business',
    description: 'What started as viral meme became a legitimate startup.',
    category: 'Business',
    growth: '+150%',
  },
  'lost-city': {
    title: '🏛️ Reddit user discovers lost city in backyard',
    description:
      'Archaeologists confirm the finding is legitimate. Property value skyrockets.',
    category: 'News',
    growth: '+400%',
  },
};

export default function TrendingPage({ params }: TrendingPageProps) {
  const topic = trendingTopics[params.slug as keyof typeof trendingTopics];

  if (!topic) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='container mx-auto px-4 py-16'>
        <div className='mx-auto max-w-4xl'>
          {/* Header */}
          <div className='mb-12 text-center'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800'>
              🔥 TRENDING {topic.growth}
            </div>
            <h1 className='mb-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white'>
              {topic.title}
            </h1>
            <p className='mb-6 text-xl text-gray-600 dark:text-gray-300'>
              {topic.description}
            </p>
            <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-500'>
              <span className='rounded-full bg-blue-100 px-3 py-1 text-blue-800'>
                {topic.category}
              </span>
              <span className='rounded-full bg-green-100 px-3 py-1 text-green-800'>
                Growth: {topic.growth}
              </span>
              <span className='rounded-full bg-purple-100 px-3 py-1 text-purple-800'>
                🔥 Viral Status
              </span>
            </div>
          </div>

          {/* Content */}
          <div className='mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
              Why This is Trending
            </h2>
            <div className='prose prose-lg dark:prose-dark max-w-none'>
              <p className='text-gray-700 dark:text-gray-300'>
                This story has captured Reddit's attention because it combines
                elements that the platform loves: unexpected twists, technical
                discussions, and community engagement. The original thread
                gained traction when users started sharing their own experiences
                and theories.
              </p>
              <p className='text-gray-700 dark:text-gray-300'>
                What started as a simple post quickly evolved into a
                comprehensive discussion with experts from the field joining to
                provide insights, making it a perfect example of Reddit's
                collaborative knowledge-sharing culture.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='rounded-lg bg-white p-6 text-center dark:bg-gray-800'>
              <div className='mb-2 text-3xl font-bold text-blue-600'>15.2K</div>
              <div className='text-gray-600 dark:text-gray-400'>Upvotes</div>
            </div>
            <div className='rounded-lg bg-white p-6 text-center dark:bg-gray-800'>
              <div className='mb-2 text-3xl font-bold text-green-600'>3.1K</div>
              <div className='text-gray-600 dark:text-gray-400'>Comments</div>
            </div>
            <div className='rounded-lg bg-white p-6 text-center dark:bg-gray-800'>
              <div className='mb-2 text-3xl font-bold text-purple-600'>892</div>
              <div className='text-gray-600 dark:text-gray-400'>Shares</div>
            </div>
          </div>

          {/* Back to home */}
          <div className='text-center'>
            <a
              href='/'
              className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700'
            >
              ← Back to ThreadJuice
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
