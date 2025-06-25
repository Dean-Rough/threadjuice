'use client';

import AdSenseUnit from './AdSenseUnit';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface FeedAdProps {
  className?: string;
  position?: number; // Position in the feed (for analytics)
}

export default function FeedAd({ className = '', position = 0 }: FeedAdProps) {
  return (
    <Card
      className={`feed-ad group overflow-hidden transition-shadow hover:shadow-lg ${className}`}
    >
      <CardContent className='p-4'>
        {/* Native-style header */}
        <div className='mb-3 flex items-center gap-2'>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
          <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Sponsored Content
          </span>
        </div>

        {/* Ad unit */}
        <AdSenseUnit
          adSlot={
            process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_FEED_SLOT || '1234567896'
          }
          adFormat='auto'
          responsive={true}
          lazy={true}
          className='w-full'
          style={{
            minHeight: '200px',
            maxHeight: '350px',
          }}
        />

        {/* Optional engagement metrics to match post cards */}
        <div className='mt-3 flex items-center gap-4 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <TrendingUp className='h-3 w-3' />
            Promoted
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
