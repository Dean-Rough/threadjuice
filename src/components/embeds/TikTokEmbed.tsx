'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TikTokEmbedProps {
  videoId?: string;
  embedUrl?: string;
  embedHtml?: string;
  className?: string;
}

export default function TikTokEmbed({
  videoId,
  embedUrl,
  embedHtml,
  className = ''
}: TikTokEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TikTok embeds auto-initialize when script loads
    // No manual initialization needed
  }, [videoId, embedUrl]);

  if (!videoId && !embedUrl && !embedHtml) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">TikTok unavailable</p>
      </div>
    );
  }

  // If we have embed HTML, use it directly
  if (embedHtml) {
    return (
      <>
        <div 
          ref={containerRef}
          className={`tiktok-embed-container ${className}`}
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
        <Script
          src="https://www.tiktok.com/embed.js"
          strategy="lazyOnload"
        />
      </>
    );
  }

  // Build embed from video ID
  const embedSrc = videoId ? `https://www.tiktok.com/embed/v3/${videoId}` : embedUrl;

  if (!embedSrc) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">Invalid TikTok embed</p>
      </div>
    );
  }

  // Use iframe for direct embedding
  return (
    <div className={`tiktok-embed-container ${className}`}>
      <div className="relative" style={{ paddingBottom: '177.78%' /* 9:16 aspect ratio */ }}>
        <iframe
          src={embedSrc}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}