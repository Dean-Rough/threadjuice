'use client';

import AdSenseUnit from './AdSenseUnit';

interface HeaderAdProps {
  className?: string;
}

export default function HeaderAd({ className = '' }: HeaderAdProps) {
  return (
    <div className={`header-ad mx-auto mb-6 w-full max-w-4xl ${className}`}>
      <div className='flex justify-center'>
        <AdSenseUnit
          adSlot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_HEADER_SLOT || '1234567890'}
          adFormat='horizontal'
          responsive={true}
          lazy={false} // Header ads should load immediately for revenue
          className='w-full max-w-[728px]'
          style={{
            minHeight: '90px',
            maxHeight: '250px',
          }}
        />
      </div>

      {/* Optional ad label for transparency */}
      <div className='mt-1 text-center text-xs text-muted-foreground'>
        Advertisement
      </div>
    </div>
  );
}
