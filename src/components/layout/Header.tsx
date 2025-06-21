'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NavigationTicker } from '@/components/NavigationTicker';

export function Header() {
  return (
    <header className='border-b'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Link href='/' className='flex items-center space-x-2'>
              <Image
                src='/assets/img/logo/Icon.svg'
                alt='ThreadJuice Icon'
                width={64}
                height={64}
                className='h-16 w-16'
                priority
              />
              <Image
                src='/assets/img/logo/Logotype-White.svg'
                alt='ThreadJuice'
                width={156}
                height={62}
                className='h-16'
                priority
              />
            </Link>
            <p className='hidden text-muted-foreground md:block'>
              Get ratio&apos;d • The best stories from around the web
            </p>
          </div>
          <nav className='hidden space-x-6 md:flex'>
            <Link
              href='/'
              className='touch-target touch-focus text-muted-foreground transition-colors hover:text-foreground'
            >
              Trending
            </Link>
            <Link
              href='/personas'
              className='touch-target touch-focus text-muted-foreground transition-colors hover:text-foreground'
            >
              Writers
            </Link>
            <Link
              href='/about'
              className='touch-target touch-focus text-muted-foreground transition-colors hover:text-foreground'
            >
              About
            </Link>
          </nav>
        </div>
      </div>

      {/* Navigation Ticker - Now global */}
      <NavigationTicker />
    </header>
  );
}
