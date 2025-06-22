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
  className = ''
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use embedUrl if provided, otherwise build from videoId
  const finalEmbedUrl = embedUrl || (videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1` : '');
  const finalThumbnailUrl = thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

  if (!finalEmbedUrl) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">Video unavailable</p>
      </div>
    );
  }

  // Lazy load - show thumbnail first, load iframe on click
  if (!isLoaded) {
    return (
      <div className={`relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group ${className}`}>
        {finalThumbnailUrl && (
          <Image
            src={finalThumbnailUrl}
            alt={title || 'YouTube video thumbnail'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Play button overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
          onClick={() => setIsLoaded(true)}
        >
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Title overlay */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold line-clamp-2">{title}</p>
          </div>
        )}
      </div>
    );
  }

  // Loaded state - show iframe
  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={finalEmbedUrl}
        title={title || 'YouTube video'}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}