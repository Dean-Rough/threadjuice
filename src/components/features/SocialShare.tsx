'use client';

import { useState, useRef } from 'react';
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Download,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  Instagram,
  Camera,
  X,
} from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
  excerpt?: string;
  author?: string;
  authorAvatar?: string;
  featuredImage?: string;
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ComponentType<any>;
  url: string;
  color: string;
  bgColor: string;
}

export default function SocialShare({
  title,
  url,
  excerpt = '',
  author = '',
  authorAvatar = '',
  featuredImage = '',
  className = '',
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomImage, setShowCustomImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const shareText = excerpt || title;
  const shareUrl =
    typeof window !== 'undefined' ? window.location.origin + url : url;

  const platforms: SharePlatform[] = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&via=ThreadJuice`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      name: 'Reddit',
      icon: MessageCircle,
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateCustomImage = async () => {
    if (!canvasRef.current) return;

    setGeneratingImage(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size for social media
      canvas.width = 1200;
      canvas.height = 630;

      // Create gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, '#f97316'); // Orange
      gradient.addColorStop(1, '#ea580c'); // Darker orange
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add noise texture overlay
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          2,
          2
        );
      }
      ctx.globalAlpha = 1;

      // Add ThreadJuice branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ThreadJuice', 60, 100);

      // Add main title
      ctx.font = 'bold 56px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';

      // Word wrap for title
      const words = title.split(' ');
      const maxWidth = canvas.width - 120;
      let line = '';
      let y = 200;
      const lineHeight = 70;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, 60, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 60, y);

      // Add author info if available
      if (author) {
        ctx.font = '32px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(`by ${author}`, 60, y + 80);
      }

      // Add URL at bottom
      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'right';
      ctx.fillText('threadjuice.com', canvas.width - 60, canvas.height - 40);

      // Add decorative elements
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvas.width - 100, 100, 30, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(canvas.width - 200, 150, 15, 0, 2 * Math.PI);
      ctx.stroke();
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `threadjuice-${title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30)}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const shareToStory = async (platform: 'instagram' | 'snapchat') => {
    if (!canvasRef.current) return;

    try {
      // Generate story-format image (9:16 aspect ratio)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1080;
      canvas.height = 1920;

      // Create story background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f97316');
      gradient.addColorStop(1, '#ea580c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add content centered
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ThreadJuice', canvas.width / 2, 200);

      // Add title with word wrap
      ctx.font = 'bold 54px Arial, sans-serif';
      const words = title.split(' ');
      let line = '';
      let y = 400;
      const maxWidth = canvas.width - 120;
      const lineHeight = 70;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      // Add QR code placeholder
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(canvas.width / 2 - 100, canvas.height - 400, 200, 200);
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('Scan to read', canvas.width / 2, canvas.height - 150);

      // Download the story image
      const link = document.createElement('a');
      link.download = `threadjuice-story-${title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 20)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to create story image:', error);
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700'
        >
          <Share2 className='h-4 w-4' />
          <span>Share</span>
        </button>

        {isOpen && (
          <div className='absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-xl'>
            {/* Close button */}
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Share this post
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Social platforms */}
            <div className='mb-4 grid grid-cols-2 gap-2'>
              {platforms.map(platform => {
                const Icon = platform.icon;
                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`flex items-center space-x-2 rounded-lg p-3 ${platform.bgColor} transition-colors`}
                  >
                    <Icon className={`h-5 w-5 ${platform.color}`} />
                    <span className='text-sm font-medium text-gray-700'>
                      {platform.name}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Copy link */}
            <div className='mb-4'>
              <div className='flex items-center space-x-2 rounded-lg bg-gray-50 p-3'>
                <LinkIcon className='h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  value={shareUrl}
                  readOnly
                  className='flex-1 bg-transparent text-sm text-gray-600 focus:outline-none'
                />
                <button
                  onClick={copyToClipboard}
                  className={`rounded px-3 py-1 text-sm ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Custom graphics */}
            <div className='border-t border-gray-200 pt-4'>
              <div className='mb-3 flex items-center justify-between'>
                <h4 className='text-sm font-medium text-gray-900'>
                  Custom Graphics
                </h4>
                <button
                  onClick={() => setShowCustomImage(!showCustomImage)}
                  className='text-sm text-orange-600 hover:text-orange-700'
                >
                  {showCustomImage ? 'Hide' : 'Show'}
                </button>
              </div>

              {showCustomImage && (
                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={generateCustomImage}
                      disabled={generatingImage}
                      className='flex items-center justify-center space-x-1 rounded bg-blue-50 p-2 text-blue-700 hover:bg-blue-100 disabled:opacity-50'
                    >
                      <Camera className='h-4 w-4' />
                      <span className='text-xs'>Generate</span>
                    </button>

                    <button
                      onClick={downloadImage}
                      className='flex items-center justify-center space-x-1 rounded bg-green-50 p-2 text-green-700 hover:bg-green-100'
                    >
                      <Download className='h-4 w-4' />
                      <span className='text-xs'>Download</span>
                    </button>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() => shareToStory('instagram')}
                      className='flex items-center justify-center space-x-1 rounded bg-purple-50 p-2 text-purple-700 hover:bg-purple-100'
                    >
                      <Instagram className='h-4 w-4' />
                      <span className='text-xs'>IG Story</span>
                    </button>

                    <button
                      onClick={() => shareToStory('snapchat')}
                      className='flex items-center justify-center space-x-1 rounded bg-yellow-50 p-2 text-yellow-700 hover:bg-yellow-100'
                    >
                      <Camera className='h-4 w-4' />
                      <span className='text-xs'>Snap Story</span>
                    </button>
                  </div>

                  {/* Preview canvas */}
                  <div className='mt-3'>
                    <canvas
                      ref={canvasRef}
                      className='h-32 w-full rounded border border-gray-200 object-cover'
                      style={{ display: 'block' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
