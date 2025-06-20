'use client';

import { useState, useEffect } from 'react';
import AdSenseUnit from './AdSenseUnit';

interface SidebarAdProps {
  className?: string;
  sticky?: boolean;
}

export default function SidebarAd({
  className = '',
  sticky = true,
}: SidebarAdProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Don't render on mobile to keep clean UX
  if (!isDesktop) {
    return null;
  }

  return (
    <div className={`sidebar-ad ${sticky ? 'sticky top-6' : ''} ${className}`}>
      {/* Primary Vertical Ad */}
      <div className='mb-6'>
        <AdSenseUnit
          adSlot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT_1 || '1234567891'}
          adFormat='vertical'
          responsive={true}
          lazy={true}
          className='w-full max-w-[300px]'
          style={{
            minHeight: '250px',
            maxHeight: '600px',
          }}
        />
      </div>

      {/* Secondary Square Ad */}
      <div className='mb-6'>
        <AdSenseUnit
          adSlot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT_2 || '1234567892'}
          adFormat='rectangle'
          responsive={true}
          lazy={true}
          className='w-full max-w-[300px]'
          style={{
            minHeight: '250px',
            maxHeight: '250px',
          }}
        />
      </div>

      {/* Ad labels for transparency */}
      <div className='text-center text-xs text-muted-foreground'>
        Sponsored Content
      </div>
    </div>
  );
}
