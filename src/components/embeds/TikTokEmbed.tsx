'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { ExternalLink, Play } from 'lucide-react';

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
  const [embedError, setEmbedError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Extract video ID from URL if needed
  const extractVideoId = (url: string) => {
    const match = url.match(/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const actualVideoId = videoId || (embedUrl ? extractVideoId(embedUrl) : null);
  const tiktokUrl = embedUrl || (actualVideoId ? `https://www.tiktok.com/@user/video/${actualVideoId}` : null);

  useEffect(() => {
    if (scriptLoaded && containerRef.current && actualVideoId) {
      // Clear container
      containerRef.current.innerHTML = '';
      
      // Create blockquote element for TikTok embed
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'tiktok-embed';
      blockquote.setAttribute('cite', tiktokUrl || '');
      blockquote.setAttribute('data-video-id', actualVideoId);
      blockquote.style.maxWidth = '605px';
      blockquote.style.minWidth = '325px';
      
      // Add section for content
      const section = document.createElement('section');
      section.innerHTML = `<a target="_blank" title="TikTok Video" href="${tiktokUrl}">View on TikTok</a>`;
      blockquote.appendChild(section);
      
      containerRef.current.appendChild(blockquote);
      
      // Trigger TikTok embed rendering
      if ((window as any).tiktok?.createEmbed) {
        (window as any).tiktok.createEmbed(containerRef.current);
      }
    }
  }, [scriptLoaded, actualVideoId, tiktokUrl]);

  if (!actualVideoId && !embedUrl && !embedHtml) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">TikTok unavailable</p>
      </div>
    );
  }

  // If embed fails or is blocked, show fallback
  if (embedError) {
    return (
      <div className={`bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-8 text-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">TikTok Video</h3>
          <p className="text-white/90">This TikTok video can't be embedded here</p>
          <a
            href={tiktokUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors"
          >
            <span>Watch on TikTok</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
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
          onLoad={() => setScriptLoaded(true)}
          onError={() => setEmbedError(true)}
        />
      </>
    );
  }

  // Use TikTok's blockquote embed method
  return (
    <>
      <div 
        ref={containerRef}
        className={`tiktok-embed-container ${className}`}
        onError={() => setEmbedError(true)}
      >
        {/* Container will be populated by useEffect */}
        <div className="bg-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading TikTok...</p>
        </div>
      </div>
      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setEmbedError(true)}
      />
    </>
  );
}