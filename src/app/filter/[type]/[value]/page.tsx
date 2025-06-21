'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QueryProvider } from '@/providers/QueryProvider';
import { TrendingFeed } from '@/components/TrendingFeed';
import { TrendingUp, Trophy, Share2 } from 'lucide-react';

export default function FilterPage() {
  const params = useParams();
  const type = params.type as string; // 'category' or 'author'
  const value = params.value as string;

  // Convert URL slug back to display format
  const displayValue = value
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const filterTitle =
    type === 'category'
      ? `${displayValue} Stories`
      : `Stories by ${displayValue}`;
  const filterDescription =
    type === 'category'
      ? `All the ${displayValue.toLowerCase()} content that's got everyone talking`
      : `Every story written by ${displayValue}`;

  return (
    <QueryProvider>
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
              <nav className='hidden space-x-6 md:flex'>
                <Link
                  href='/'
                  className='text-muted-foreground hover:text-foreground'
                >
                  Home
                </Link>
                <a
                  href='#'
                  className='text-muted-foreground hover:text-foreground'
                >
                  Latest
                </a>
                <a
                  href='#'
                  className='text-muted-foreground hover:text-foreground'
                >
                  Popular
                </a>
              </nav>
            </div>
          </div>

          {/* Category Ticker */}
          <div className='overflow-hidden bg-orange-500 py-3'>
            <div className='animate-scroll-left flex items-center space-x-4 whitespace-nowrap'>
              {[
                'AITA',
                'Revenge',
                'Funny',
                'News',
                'Relationships',
                'Work Stories',
                'Malicious Compliance',
                'Petty Revenge',
                'TikTok Fails',
                'Roommate Drama',
                'Dating Disasters',
                'Food Fails',
                'Technology',
                'Travel',
                'DIY Disasters',
                'Wedding Drama',
                'Family Drama',
                'School Stories',
                'AITA',
                'Revenge',
                'Funny',
                'News',
                'Relationships',
                'Work Stories',
                'Malicious Compliance',
                'Petty Revenge',
                'TikTok Fails',
                'Roommate Drama',
                'Dating Disasters',
                'Food Fails',
              ].map((category, index) => (
                <Link
                  key={index}
                  href={`/filter/category/${category.toLowerCase().replace(/ /g, '-')}`}
                  className='whitespace-nowrap rounded-full bg-black px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-gray-800'
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Filter Hero Section */}
        <section className='bg-gradient-to-r from-orange-600 to-orange-500 py-16 text-white'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl'>
              <div className='mb-4'>
                <span className='rounded-full bg-black px-4 py-2 text-sm font-bold'>
                  {type === 'category' ? 'Category' : 'Author'}
                </span>
              </div>
              <h1 className='mb-6 text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl'>
                {filterTitle}
              </h1>
              <p className='mb-8 max-w-3xl text-xl opacity-90 md:text-2xl'>
                {filterDescription}
              </p>
              <div className='flex items-center gap-6 text-sm'>
                <span className='rounded-full bg-white/20 px-3 py-1'>
                  {Math.floor(Math.random() * 200) + 50} stories
                </span>
                <span>
                  {Math.floor(Math.random() * 500) + 200} total comments
                </span>
                <span>{Math.floor(Math.random() * 100) + 50} total shares</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className='container mx-auto px-4 py-8'>
          <div className='grid gap-8 lg:grid-cols-4'>
            {/* Main Content Area */}
            <div className='lg:col-span-3'>
              <div className='mb-8'>
                <h2 className='mb-2 flex items-center gap-2 text-3xl font-extrabold text-foreground'>
                  <TrendingUp className='h-8 w-8 text-orange-500' />
                  {filterTitle}
                </h2>
                <p className='text-muted-foreground'>{filterDescription}</p>
              </div>

              {/* TrendingFeed will be filtered based on the type and value */}
              <TrendingFeed />
            </div>

            {/* Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8'>
                <div className='mb-6 rounded-lg border bg-card p-6'>
                  <h3 className='mb-4 flex items-center gap-2 text-lg font-extrabold text-foreground'>
                    <Trophy className='h-5 w-5 text-orange-500' />
                    Today&apos;s Top 5
                  </h3>
                  <div className='space-y-4'>
                    {[
                      &quot;Restaurant charged me $50 for &apos;emotional labor&apos;&quot;,
                      'Neighbor steals packages, gets glitter bombed',
                      'Working from Disneyland instead of home',
                      'Roommate replaced furniture with cardboard',
                      'Boyfriend catfished me with better photos',
                    ].map((title, index) => (
                      <div
                        key={index}
                        className='flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-accent'
                      >
                        <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
                          {index + 1}
                        </div>
                        <p className='text-sm font-medium leading-tight text-foreground'>
                          {title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='rounded-lg border bg-card p-6'>
                  <h3 className='mb-4 flex items-center gap-2 text-lg font-extrabold text-foreground'>
                    <Share2 className='h-5 w-5 text-orange-500' />
                    Top Shared
                  </h3>
                  <div className='space-y-4'>
                    {[
                      {
                        title:
                          &quot;My landlord installed a doorbell that plays &apos;Baby Shark&apos;&quot;,
                        shares: '3.2k',
                      },
                      {
                        title: &quot;I accidentally became the town&apos;s food critic&quot;,
                        shares: '2.8k',
                      },
                      {
                        title: &quot;My dating app match was my therapist&apos;s patient&quot;,
                        shares: '2.1k',
                      },
                      {
                        title: 'Living in an Airbnb for 8 months (host forgot)',
                        shares: '1.9k',
                      },
                      {
                        title: 'Ex trying to copyright my breakup letter',
                        shares: '1.7k',
                      },
                    ].map((story, index) => (
                      <div
                        key={index}
                        className='flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-accent'
                      >
                        <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white'>
                          {index + 1}
                        </div>
                        <div className='flex-1'>
                          <p className='mb-1 text-sm font-medium leading-tight text-foreground'>
                            {story.title}
                          </p>
                          <p className='font-mono text-xs text-muted-foreground'>
                            {story.shares} shares
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className='mt-16 border-t'>
          <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-4 gap-8'>
              {/* Logo & Description - 25% */}
              <div>
                <img
                  src='/assets/img/logo/Logotype-White.svg'
                  alt='ThreadJuice'
                  className='mb-4 h-10'
                />
                <p className='text-sm text-muted-foreground'>
                  Your daily dose of internet chaos, wholesome moments, and
                  &quot;wait, what?&quot; stories. We find the stuff that makes you stop
                  scrolling and actually read the comments.
                </p>
              </div>

              {/* Blank Space - 25% */}
              <div></div>

              {/* Explore - 25% */}
              <div>
                <h3 className='mb-4 font-extrabold text-foreground'>Explore</h3>
                <ul className='space-y-2 text-sm'>
                  <li>
                    <Link
                      href='/'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Trending Stories
                    </Link>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Latest Posts
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Popular Today
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Categories
                    </a>
                  </li>
                </ul>
              </div>

              {/* About - 25% */}
              <div>
                <h3 className='mb-4 font-extrabold text-foreground'>About</h3>
                <ul className='space-y-2 text-sm'>
                  <li>
                    <a
                      href='#'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Our Writers
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Content Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className='mt-8 border-t pt-8 text-center'>
              <p className='text-sm text-muted-foreground'>
                © 2024 ThreadJuice. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </QueryProvider>
  );
}
