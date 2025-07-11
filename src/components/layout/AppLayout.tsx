'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Header } from './Header';
import { QueryProvider } from '@/providers/QueryProvider';
import { HeaderAd } from '@/components/ads';
import { CacheClearer } from '@/components/CacheClearer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <QueryProvider>
      <CacheClearer />
      <div className='min-h-screen bg-background'>
        <Header />

        {/* Header Ad - Premium placement */}
        <div className='container mx-auto px-4'>
          <HeaderAd />
        </div>

        {children}

        {/* Footer */}
        <footer className='mt-16 border-t'>
          <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-4 gap-8'>
              {/* Logo & Description - 25% */}
              <div>
                <Image
                  src='/assets/img/logo/Logotype-White.svg'
                  alt='ThreadJuice'
                  width={200}
                  height={40}
                  className='mb-4 h-10'
                />
                <p className='text-sm text-muted-foreground'>
                  Your daily dose of internet chaos, wholesome moments, and
                  &quot;wait, what?&quot; stories. We find the stuff that makes
                  you stop scrolling and actually read the comments.
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
                    <Link
                      href='/personas'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Our Writers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/about'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      About
                    </Link>
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
                    <Link
                      href='/personas'
                      className='text-muted-foreground hover:text-foreground'
                    >
                      Our Writers
                    </Link>
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
