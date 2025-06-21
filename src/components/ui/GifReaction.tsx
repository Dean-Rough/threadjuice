'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle } from 'lucide-react';

export interface GifReactionProps {
  id: string;
  url: string;
  title: string;
  caption?: string;
  width?: number;
  height?: number;
  preview?: string;
  className?: string;
  lazy?: boolean;
}

export default function GifReaction({
  id,
  url,
  title,
  caption = "Everyone right now:",
  width = 400,
  height = 300,
  preview,
  className = "",
  lazy = true
}: GifReactionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Calculate responsive dimensions
  const maxWidth = Math.min(width, 400);
  const aspectRatio = width / height;
  const calculatedHeight = maxWidth / aspectRatio;

  return (
    <div 
      ref={containerRef}
      className={`gif-reaction-section mb-8 ${className}`}
    >
      <div className="flex flex-col items-center">
        {/* Caption */}
        {caption && (
          <p className="mb-4 text-center text-lg font-medium text-muted-foreground italic">
            {caption}
          </p>
        )}

        {/* GIF Container with Jaunty Styling */}
        <div 
          className="gif-container relative overflow-hidden rounded-xl border-2 border-orange-200 dark:border-orange-800 jaunty-cutout bg-white dark:bg-slate-900"
          style={{
            width: `${maxWidth}px`,
            height: `${calculatedHeight}px`,
            maxWidth: '100%'
          }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="text-sm text-muted-foreground">Loading reaction...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <div className="flex flex-col items-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Failed to load reaction</span>
              </div>
            </div>
          )}

          {/* GIF Image */}
          {isVisible && (
            <>
              {/* Preview image for faster loading */}
              {preview && !imageLoaded && (
                <Image
                  src={preview}
                  alt={title}
                  fill
                  className="object-cover blur-sm"
                  style={{ filter: 'blur(4px)' }}
                />
              )}
              
              {/* Main GIF */}
              <Image
                src={url}
                alt={title}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading={lazy ? 'lazy' : 'eager'}
                unoptimized={true}
              />
            </>
          )}

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* GIF Title/Credit */}
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            via Klipy
          </p>
        </div>
      </div>
    </div>
  );
}