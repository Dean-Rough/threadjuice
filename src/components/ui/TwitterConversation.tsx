'use client';

import React from 'react';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  MoreHorizontal,
} from 'lucide-react';

interface TwitterReply {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  verified?: boolean;
  isOP?: boolean; // Original Poster
}

interface TwitterConversationProps {
  title?: string;
  conversation: TwitterReply[];
  className?: string;
}

export default function TwitterConversation({
  title = 'The Twitter Back-and-Forth',
  conversation,
  className = '',
}: TwitterConversationProps) {
  const getRandomAvatar = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
    ];
    const colorIndex = username.length % colors.length;
    return colors[colorIndex];
  };

  return (
    <div
      className={`twitter-conversation jaunty-cutout overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className='border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800'>
        <div className='flex items-center gap-2'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500'>
            <svg
              className='h-3 w-3 text-white'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
            </svg>
          </div>
          <h4 className='text-sm font-bold text-foreground'>{title}</h4>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className='max-h-96 overflow-y-auto'>
        {conversation.map((tweet, index) => (
          <div key={tweet.id} className='relative'>
            {/* Connection Line */}
            {index < conversation.length - 1 && (
              <div className='absolute left-8 top-14 z-0 h-4 w-0.5 bg-slate-200 dark:bg-slate-600' />
            )}

            <div className='relative z-10 flex gap-3 border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-700'>
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getRandomAvatar(tweet.author)}`}
              >
                {tweet.author.charAt(0).toUpperCase()}
              </div>

              {/* Tweet Content */}
              <div className='min-w-0 flex-1'>
                {/* Header */}
                <div className='mb-2 flex items-center gap-2'>
                  <span className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                    {tweet.author}
                  </span>
                  {tweet.verified && (
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-blue-500'>
                      <svg
                        className='h-2.5 w-2.5 text-white'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  )}
                  {tweet.isOP && (
                    <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
                      OP
                    </span>
                  )}
                  <span className='text-sm text-slate-500'>
                    @{tweet.handle}
                  </span>
                  <span className='text-slate-400'>·</span>
                  <span className='text-sm text-slate-500'>
                    {tweet.timestamp}
                  </span>

                  <div className='ml-auto'>
                    <button className='rounded-full p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700'>
                      <MoreHorizontal className='h-4 w-4 text-slate-400' />
                    </button>
                  </div>
                </div>

                {/* Tweet Text */}
                <div className='mb-3'>
                  <p className='text-sm leading-relaxed text-slate-800 dark:text-slate-200'>
                    {tweet.content}
                  </p>
                </div>

                {/* Engagement Stats */}
                <div className='flex items-center gap-6 text-slate-500'>
                  <button className='flex items-center gap-2 transition-colors hover:text-blue-500'>
                    <MessageCircle className='h-4 w-4' />
                    <span className='text-xs'>{tweet.replies}</span>
                  </button>

                  <button className='flex items-center gap-2 transition-colors hover:text-green-500'>
                    <Repeat2 className='h-4 w-4' />
                    <span className='text-xs'>{tweet.retweets}</span>
                  </button>

                  <button className='flex items-center gap-2 transition-colors hover:text-red-500'>
                    <Heart className='h-4 w-4' />
                    <span className='text-xs'>{tweet.likes}</span>
                  </button>

                  <button className='flex items-center gap-2 transition-colors hover:text-blue-500'>
                    <Share className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800'>
        <button className='text-sm font-medium text-blue-500 hover:text-blue-600'>
          View full conversation on Twitter →
        </button>
      </div>
    </div>
  );
}
