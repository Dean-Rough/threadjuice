'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NavigationTicker } from '@/components/NavigationTicker';

export function Header() {
  return (
    <header className='border-b'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
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
          <p className='hidden font-semibold text-muted-foreground md:block'>
            Get ratio&apos;d • The best stories from around the web
          </p>
        </div>
      </div>

      {/* Navigation Ticker - Now global */}
      <NavigationTicker />
    </header>
  );
}
