'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId?: string;
  embedUrl?: string;
  title?: string;
  thumbnailUrl?: string;
  className?: string;
}

export default function YouTubeEmbed({
  videoId,
  embedUrl,
  title,
  thumbnailUrl,
  className = '',
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Use embedUrl if provided, otherwise build from videoId
  const finalEmbedUrl =
    embedUrl ||
    (videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`
      : '');
  const finalThumbnailUrl =
    thumbnailUrl ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

  if (!finalEmbedUrl) {
    return (
      <div className={`rounded-lg bg-muted p-8 text-center ${className}`}>
        <p className='text-muted-foreground'>Video unavailable</p>
      </div>
    );
  }

  // Lazy load - show thumbnail first, load iframe on click
  if (!isLoaded) {
    return (
      <div
        className={`group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-black ${className}`}
      >
        {finalThumbnailUrl && (
          <Image
            src={finalThumbnailUrl}
            alt={title || 'YouTube video thumbnail'}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        )}

        {/* Play button overlay */}
        <div
          className='absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40'
          onClick={() => setIsLoaded(true)}
        >
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-red-600 transition-transform group-hover:scale-110'>
            <Play className='ml-1 h-10 w-10 text-white' fill='white' />
          </div>
        </div>

        {/* Title overlay */}
        {title && (
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
            <p className='line-clamp-2 font-semibold text-white'>{title}</p>
          </div>
        )}
      </div>
    );
  }

  // Loaded state - show iframe
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-lg bg-black ${className}`}
    >
      <iframe
        src={finalEmbedUrl}
        title={title || 'YouTube video'}
        className='absolute inset-0 h-full w-full'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
      />
    </div>
  );
}
