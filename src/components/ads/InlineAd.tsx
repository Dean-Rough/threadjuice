'use client';

import AdSenseUnit from './AdSenseUnit';

interface InlineAdProps {
  className?: string;
  variant?: 'rectangle' | 'responsive' | 'mobile-banner';
  spacing?: 'tight' | 'normal' | 'loose';
}

export default function InlineAd({
  className = '',
  variant = 'responsive',
  spacing = 'normal',
}: InlineAdProps) {
  const spacingClasses = {
    tight: 'my-4',
    normal: 'my-6',
    loose: 'my-8',
  };

  const getAdConfig = () => {
    switch (variant) {
      case 'rectangle':
        return {
          adSlot: '1234567893', // Replace with rectangle ad slot
          adFormat: 'rectangle' as const,
          style: { minHeight: '250px', maxHeight: '250px' },
          className: 'max-w-[300px] mx-auto',
        };
      case 'mobile-banner':
        return {
          adSlot: '1234567894', // Replace with mobile banner slot
          adFormat: 'horizontal' as const,
          style: { minHeight: '50px', maxHeight: '100px' },
          className: 'max-w-[320px] mx-auto',
        };
      default: // responsive
        return {
          adSlot: '1234567895', // Replace with responsive ad slot
          adFormat: 'auto' as const,
          style: { minHeight: '200px', maxHeight: '400px' },
          className: 'w-full max-w-[600px] mx-auto',
        };
    }
  };

  const adConfig = getAdConfig();

  return (
    <div className={`inline-ad ${spacingClasses[spacing]} ${className}`}>
      {/* Native-style container to blend with content */}
      <div className='rounded-lg border border-border bg-background p-4'>
        <div className='mb-2 text-center text-xs uppercase tracking-wide text-muted-foreground'>
          Sponsored
        </div>

        <AdSenseUnit
          adSlot={adConfig.adSlot}
          adFormat={adConfig.adFormat}
          responsive={true}
          lazy={true}
          className={adConfig.className}
          style={adConfig.style}
        />
      </div>
    </div>
  );
}
