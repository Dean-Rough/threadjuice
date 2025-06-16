import { ImageProps } from 'next/image';

// Image optimization configuration
export const imageConfig = {
  // Next.js Image component default settings
  quality: 85,
  format: 'webp',
  placeholder: 'blur' as const,
  loading: 'lazy' as const,
  sizes: {
    // Responsive breakpoints
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw',
    desktop: '33vw',
    full: '100vw',
    hero: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw',
    featured: '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw',
    thumbnail: '(max-width: 768px) 50vw, 25vw',
    avatar: '(max-width: 768px) 10vw, 5vw',
    social: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw',
    story: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    square: '(max-width: 768px) 50vw, 25vw'
  }
};

// Standard image dimensions for consistency
export const imageDimensions = {
  hero: { width: 1200, height: 600 },
  featured: { width: 800, height: 400 },
  thumbnail: { width: 300, height: 200 },
  avatar: { width: 100, height: 100 },
  social: { width: 1200, height: 630 },
  story: { width: 1080, height: 1920 },
  square: { width: 500, height: 500 }
};

// Generate optimized image props for different use cases
export function getOptimizedImageProps(
  src: string,
  type: keyof typeof imageDimensions,
  alt: string,
  options: Partial<ImageProps> = {}
): Partial<ImageProps> {
  const dimensions = imageDimensions[type];
  const sizes = imageConfig.sizes[type] || imageConfig.sizes.desktop;

  return {
    src,
    alt,
    width: dimensions.width,
    height: dimensions.height,
    quality: imageConfig.quality,
    placeholder: imageConfig.placeholder,
    loading: imageConfig.loading,
    sizes,
    style: {
      objectFit: 'cover',
      ...options.style
    },
    ...options
  };
}

// Generate blur data URL for placeholder
export function generateBlurDataUrl(width: number, height: number): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    // Fallback for SSR
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create simple gradient blur
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Preload critical images
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
}

// Lazy load images with intersection observer
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
}

// Image compression utility
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      canvas.toBlob(
        (blob) => {
          resolve(blob || new Blob());
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

// WebP support detection
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Generate srcSet for responsive images
export function generateSrcSet(
  baseSrc: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  return widths
    .map(width => {
      const url = new URL(baseSrc, window.location.origin);
      url.searchParams.set('w', width.toString());
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
}

// Image CDN URL builder (for when using external CDN)
export function buildImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  } = {}
): string {
  const { width, height, quality = 85, format = 'webp', fit = 'cover' } = options;
  
  // For Next.js built-in image optimization
  const url = new URL('/_next/image', window.location.origin);
  url.searchParams.set('url', src);
  url.searchParams.set('q', quality.toString());
  
  if (width) url.searchParams.set('w', width.toString());
  if (height) url.searchParams.set('h', height.toString());
  
  return url.toString();
}