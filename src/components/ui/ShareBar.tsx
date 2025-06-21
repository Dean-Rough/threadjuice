'use client';

import { useState } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Copy,
  Check,
  Share2,
} from 'lucide-react';

export interface ShareBarProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showCopyLink?: boolean;
  showLabels?: boolean;
}

export function ShareBar({
  url,
  title,
  description = '',
  className = '',
  orientation = 'horizontal',
  showCopyLink = true,
  showLabels = false,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-600',
      bgColor: 'hover:bg-blue-50',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:text-sky-500',
      bgColor: 'hover:bg-sky-50',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-700',
      bgColor: 'hover:bg-blue-50',
    },
    {
      name: 'Reddit',
      icon: MessageCircle,
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      color: 'hover:text-orange-600',
      bgColor: 'hover:bg-orange-50',
    },
  ];

  const containerClass =
    orientation === 'vertical'
      ? 'flex flex-col space-y-2'
      : 'flex items-center space-x-2';

  const buttonClass =
    orientation === 'vertical'
      ? 'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors'
      : 'p-2 rounded-lg transition-colors';

  return (
    <div
      className={`blog-details-share ${containerClass} ${className}`}
      data-testid='share-bar'
    >
      {showLabels && orientation === 'horizontal' && (
        <h6 className='share-title mr-3 text-sm font-medium text-gray-700'>
          Share:
        </h6>
      )}

      <ul className={`list-wrap ${containerClass} mb-0`}>
        {shareLinks.map(link => {
          const IconComponent = link.icon;
          return (
            <li key={link.name}>
              <a
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className={`${buttonClass} ${link.color} ${link.bgColor} text-gray-600`}
                aria-label={`Share on ${link.name}`}
                onClick={e => {
                  e.preventDefault();
                  window.open(link.url, '_blank', 'width=600,height=400');
                }}
              >
                <IconComponent className='h-5 w-5' />
                {showLabels && orientation === 'vertical' && (
                  <span className='text-sm'>{link.name}</span>
                )}
              </a>
            </li>
          );
        })}

        {showCopyLink && (
          <li>
            <button
              onClick={handleCopyLink}
              className={`${buttonClass} ${copied ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
              aria-label='Copy link'
            >
              {copied ? (
                <Check className='h-5 w-5' />
              ) : (
                <Copy className='h-5 w-5' />
              )}
              {showLabels && orientation === 'vertical' && (
                <span className='text-sm'>
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              )}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default ShareBar;
