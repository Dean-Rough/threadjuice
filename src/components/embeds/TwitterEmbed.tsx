'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TwitterEmbedProps {
  tweetId?: string;
  embedUrl?: string;
  embedHtml?: string;
  className?: string;
}

// Global flag to track if Twitter script is loaded
declare global {
  interface Window {
    twttr?: any;
  }
}

export default function TwitterEmbed({
  tweetId,
  embedUrl,
  embedHtml,
  className = ''
}: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If Twitter widgets are loaded, process the embed
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(containerRef.current);
    }
  }, [tweetId, embedUrl]);

  if (!tweetId && !embedUrl && !embedHtml) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">Tweet unavailable</p>
      </div>
    );
  }

  // If we have embed HTML, use it directly
  if (embedHtml) {
    return (
      <>
        <div 
          ref={containerRef}
          className={`twitter-embed-container ${className}`}
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (window.twttr?.widgets && containerRef.current) {
              window.twttr.widgets.load(containerRef.current);
            }
          }}
        />
      </>
    );
  }

  // Build embed from URL or ID
  const finalUrl = embedUrl || (tweetId ? `https://twitter.com/i/status/${tweetId}` : '');

  return (
    <>
      <div ref={containerRef} className={`twitter-embed-container ${className}`}>
        <blockquote className="twitter-tweet" data-dnt="true">
          <p lang="en" dir="ltr">Loading tweet...</p>
          <a href={finalUrl}>View on Twitter</a>
        </blockquote>
      </div>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.twttr?.widgets && containerRef.current) {
            window.twttr.widgets.load(containerRef.current);
          }
        }}
      />
    </>
  );
}