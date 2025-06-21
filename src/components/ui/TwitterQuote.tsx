'use client';

import React from 'react';
import { Quote, MessageCircle, Repeat2, Heart, Share } from 'lucide-react';

interface TwitterQuoteProps {
  content: string;
  author: string;
  handle: string;
  timestamp?: string;
  retweets?: number;
  likes?: number;
  replies?: number;
  context?: string;
  verified?: boolean;
}

export default function TwitterQuote({
  content,
  author,
  handle,
  timestamp = '2h',
  retweets = 0,
  likes = 0,
  replies = 0,
  context,
  verified = false,
}: TwitterQuoteProps) {
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
    <div className='twitter-quote-section mb-8'>
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 jaunty-cutout-left'>
        {/* Twitter Header */}
        <div className='mb-4 flex items-start gap-3'>
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${getRandomAvatar(author)}`}
          >
            {author.charAt(0).toUpperCase()}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-slate-900 dark:text-slate-100'>
                {author}
              </span>
              {verified && (
                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500'>
                  <svg
                    className='h-3 w-3 text-white'
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
              <span className='text-slate-500'>@{handle}</span>
              <span className='text-slate-400'>·</span>
              <span className='text-slate-500'>{timestamp}</span>
            </div>
          </div>
          
          {/* Twitter Bird Icon */}
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500'>
            <svg
              className='h-4 w-4 text-white'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
            </svg>
          </div>
        </div>

        {/* Tweet Content */}
        <div className='mb-4'>
          <p className='text-lg leading-relaxed text-slate-800 dark:text-slate-200'>
            {content}
          </p>
        </div>

        {/* Twitter Engagement Stats */}
        <div className='flex items-center gap-6 border-t border-slate-100 pt-4 text-slate-500 dark:border-slate-700'>
          <div className='flex items-center gap-2'>
            <MessageCircle className='h-4 w-4' />
            <span className='text-sm'>{replies.toLocaleString()}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Repeat2 className='h-4 w-4' />
            <span className='text-sm'>{retweets.toLocaleString()}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Heart className='h-4 w-4' />
            <span className='text-sm'>{likes.toLocaleString()}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Share className='h-4 w-4' />
          </div>
        </div>

        {/* Context */}
        {context && (
          <div className='mt-4 border-t border-slate-100 pt-4 dark:border-slate-700'>
            <p className='text-sm italic text-muted-foreground'>{context}</p>
          </div>
        )}
      </div>
    </div>
  );
}