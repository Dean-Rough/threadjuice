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
    <div className={`flex items-center space-x-2 ${className}`} data-testid="persona-badge">
      {/* Avatar */}
      {showAvatar && (
        <div className={`${classes.avatar} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
              height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <User className="w-1/2 h-1/2 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Author Info */}
      <div className="flex flex-col min-w-0">
        <Link
          href={`/personas/${author.id}`}
          className={`font-medium text-gray-900 hover:text-primary transition-colors truncate ${classes.text}`}
        >
          {author.name}
        </Link>
        {showTone && (
          <span className={`text-gray-500 truncate ${classes.tone}`}>
            {author.tone}
          </span>
        )}
      </div>
    </div>
  );
}

export default PersonaBadge;