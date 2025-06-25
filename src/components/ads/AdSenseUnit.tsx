'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSenseUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
  lazy?: boolean;
  minViewportHeight?: number;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSenseUnit({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
  responsive = true,
  lazy = true,
  minViewportHeight = 250,
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      const publisherId =
        process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID ||
        'ca-pub-2236849417806650';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!lazy) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Load ads 50px before they come into view
        threshold: 0.1,
      }
    );

    const currentRef = adRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [lazy]);

  useEffect(() => {
    if (isVisible && !isLoaded && adRef.current) {
      try {
        // Initialize AdSense
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('AdSense loading error:', error);
      }
    }
  }, [isVisible, isLoaded]);

  const defaultStyle: React.CSSProperties = {
    minHeight: minViewportHeight,
    display: 'block',
    ...style,
  };

  if (!isVisible) {
    return (
      <div
        ref={adRef}
        className={`ad-placeholder ${className}`}
        style={defaultStyle}
      >
        {/* Placeholder for lazy loading */}
        <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
          <span>Advertisement</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`adsense-unit ${className}`}>
      <ins
        className='adsbygoogle'
        style={defaultStyle}
        data-ad-client={
          process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID ||
          'ca-pub-2236849417806650'
        }
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
