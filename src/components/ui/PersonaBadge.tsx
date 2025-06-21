'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';

export interface PersonaBadgeProps {
  author: {
    id: string;
    name: string;
    avatar?: string;
    tone: string;
  };
  showAvatar?: boolean;
  showTone?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PersonaBadge({
  author,
  showAvatar = true,
  showTone = true,
  size = 'md',
  className = '',
}: PersonaBadgeProps) {
  const sizeClasses = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-sm',
      tone: 'text-xs',
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-base',
      tone: 'text-sm',
    },
    lg: {
      avatar: 'w-10 h-10',
      text: 'text-lg',
      tone: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`flex items-center space-x-2 ${className}`}
      data-testid='persona-badge'
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={`${classes.avatar} flex-shrink-0 overflow-hidden rounded-full bg-gray-200`}
        >
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
              height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
              className='h-full w-full object-cover'
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500'>
              <User className='h-1/2 w-1/2 text-white' />
            </div>
          )}
        </div>
      )}

      {/* Author Info */}
      <div className='flex min-w-0 flex-col'>
        <Link
          href={`/personas/${author.id}`}
          className={`truncate font-medium text-gray-900 transition-colors hover:text-primary ${classes.text}`}
        >
          {author.name}
        </Link>
        {showTone && (
          <span className={`truncate text-gray-500 ${classes.tone}`}>
            {author.tone}
          </span>
        )}
      </div>
    </div>
  );
}

export default PersonaBadge;
