import React from 'react';
import Image from 'next/image';
import { MessageCircle, ExternalLink, Share2 } from 'lucide-react';
import TwitterConversation from '@/components/ui/TwitterConversation';
import { renderContentWithLinks } from '@/lib/contentLinkParser';
import Link from 'next/link';

export function renderAdditionalSections(
  section: any,
  index: number,
  post: any
) {
  switch (section.type) {
    case 'hero':
      return (
        <div key={index} className='hero-section mb-12'>
          {section.title && (
            <h2 className='mb-6 text-4xl font-extrabold leading-tight text-foreground'>
              {section.title}
            </h2>
          )}
          <p className='text-2xl font-bold leading-tight text-foreground md:text-3xl'>
            {section.content}
          </p>
        </div>
      );

    case 'pullquote':
      return (
        <div key={index} className='quotes-section mb-8'>
          <div className='py-8'>
            <blockquote className='text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:text-5xl'>
              {section.content}
            </blockquote>
            {section.metadata?.author && (
              <>
                <cite className='mt-4 block text-xl font-semibold text-orange-500'>
                  — {section.metadata.author}
                </cite>
                {section.metadata?.context && (
                  <p className='mt-2 text-base italic text-muted-foreground'>
                    {section.metadata.context}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      );

    case 'twitter_quote':
      return (
        <div key={index} className='twitter-quote-section my-8'>
          <div className='rounded-lg border border-border bg-card p-6'>
            <div className='flex items-start gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white'>
                {section.metadata?.author?.charAt(1).toUpperCase() || 'T'}
              </div>
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-2'>
                  <a
                    href={`https://twitter.com/${(section.metadata?.author || '@user').replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-bold text-foreground transition-colors hover:text-orange-500'
                  >
                    {section.metadata?.author || '@user'}
                  </a>
                  <span className='text-sm text-muted-foreground'>• 2h</span>
                </div>
                <p className='mb-3 text-lg text-foreground'>
                  {section.content}
                </p>
                <div className='flex items-center gap-6 text-sm text-muted-foreground'>
                  <span className='flex items-center gap-1'>
                    <MessageCircle className='h-4 w-4' />
                    {section.metadata?.likes || '1.2K'}
                  </span>
                  <span className='flex items-center gap-1'>
                    🔁 {section.metadata?.retweets || '567'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'roundup':
      return (
        <div
          key={index}
          className='roundup-section my-12 rounded-lg border border-border bg-muted/50 p-6'
        >
          {section.title && (
            <h3 className='mb-4 text-2xl font-extrabold text-foreground'>
              {section.title}
            </h3>
          )}
          <div className='prose prose-lg max-w-none'>
            <p className='text-lg leading-relaxed text-foreground'>
              {renderContentWithLinks(section.content)}
            </p>
          </div>
        </div>
      );

    case 'terry_corner':
      return (
        <div key={index} className='terry-corner-section my-12'>
          <div className='relative flex-1 animate-pulse rounded-2xl bg-orange-500 p-6'>
            <div className='absolute left-0 top-8 h-0 w-0 -translate-x-full transform border-b-[20px] border-r-[20px] border-t-[20px] border-b-transparent border-r-orange-500 border-t-transparent'></div>
            <div>
              <div
                className='mb-1 text-sm font-medium text-white'
                style={{ fontFamily: '"Bouchers Sans", sans-serif' }}
              >
                {section.title || "Terry's Take"}
              </div>
              <p
                className='leading-relaxed text-black'
                style={{ fontFamily: '"Bouchers Sans", sans-serif' }}
              >
                {section.content}
              </p>
            </div>
          </div>
        </div>
      );

    case 'reaction_gif':
      return (
        <div key={index} className='reaction-gif-section my-8 text-center'>
          <div className='inline-block'>
            <Image
              src={
                section.metadata?.gifUrl ||
                'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif'
              }
              alt={section.content}
              width={400}
              height={300}
              className='max-w-full rounded-lg shadow-lg'
              style={{ maxHeight: '300px' }}
              unoptimized={true}
            />
            <p className='mt-3 text-sm font-medium italic text-muted-foreground'>
              {section.content}
            </p>
          </div>
        </div>
      );

    case 'twitter-conversation':
      return (
        <div key={index} className='twitter-conversation-section my-12'>
          {section.title && (
            <h3 className='mb-6 text-2xl font-extrabold text-foreground'>
              {section.title}
            </h3>
          )}
          {section.content && (
            <p className='mb-6 text-lg text-muted-foreground'>
              {section.content}
            </p>
          )}
          <TwitterConversation
            conversation={section.metadata?.conversation || []}
            title={section.title}
          />
        </div>
      );

    case 'story_link':
      return (
        <div
          key={index}
          className='story-link-section my-12 rounded-lg border border-orange-500/20 bg-orange-500/10 p-6'
        >
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex-1'>
              <p className='mb-2 text-lg font-medium text-foreground'>
                {section.content}
              </p>
              <div className='flex items-center gap-4'>
                <Link
                  href={section.metadata?.url || `/blog/${post.slug}`}
                  className='inline-flex items-center gap-2 font-medium text-orange-600 hover:text-orange-700'
                >
                  <Share2 className='h-4 w-4' />
                  {section.metadata?.linkText || 'Share this story'}
                </Link>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(section.metadata?.url || `https://threadjuice.com/blog/${post.slug}`)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700'
                >
                  <ExternalLink className='h-4 w-4' />
                  Tweet this
                </a>
              </div>
            </div>
          </div>
        </div>
      );

    case 'reddit_quote':
      return (
        <div key={index} className='reddit-quote-section my-12'>
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-500'>
                  <span className='text-sm font-bold text-white'>r/</span>
                </div>
              </div>
              <div className='min-w-0 flex-1'>
                <div className='mb-3 flex flex-wrap items-center gap-2 text-sm'>
                  <span className='font-medium text-orange-600 dark:text-orange-400'>
                    r/{section.metadata?.subreddit || 'reddit'}
                  </span>
                  <span className='text-gray-400'>•</span>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Posted by u/{section.metadata?.author || 'OP'}
                  </span>
                  <span className='text-gray-400'>•</span>
                  <span className='text-gray-600 dark:text-gray-300'>
                    {section.metadata?.score || 0} points
                  </span>
                </div>
                <div className='leading-relaxed text-gray-900 dark:text-gray-100'>
                  <div className='whitespace-pre-wrap'>{section.content}</div>
                </div>
                {section.metadata?.context && (
                  <div className='mt-3 text-xs italic text-gray-500 dark:text-gray-400'>
                    {section.metadata.context}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
