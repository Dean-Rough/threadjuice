import React from 'react';
import { MessageCircle, ExternalLink, Share2 } from 'lucide-react';
import TwitterConversation from '@/components/ui/TwitterConversation';
import { renderContentWithLinks } from '@/lib/contentLinkParser';
import Link from 'next/link';

export function renderAdditionalSections(section: any, index: number, post: any) {
  switch (section.type) {
    case 'hero':
      return (
        <div key={index} className='hero-section mb-12'>
          {section.title && (
            <h2 className='mb-6 text-4xl font-extrabold leading-tight text-foreground'>
              {section.title}
            </h2>
          )}
          <p className='text-2xl md:text-3xl font-bold leading-tight text-foreground'>
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
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold'>
                {section.metadata?.author?.charAt(1).toUpperCase() || 'T'}
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <a 
                    href={`https://twitter.com/${(section.metadata?.author || '@user').replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-bold text-foreground hover:text-orange-500 transition-colors'
                  >
                    {section.metadata?.author || '@user'}
                  </a>
                  <span className='text-muted-foreground text-sm'>• 2h</span>
                </div>
                <p className='text-foreground text-lg mb-3'>{section.content}</p>
                <div className='flex items-center gap-6 text-muted-foreground text-sm'>
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
        <div key={index} className='roundup-section my-12 p-6 rounded-lg bg-muted/50 border border-border'>
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
          <div className='relative bg-orange-500 rounded-2xl p-6 flex-1 animate-pulse'>
            <div className='absolute left-0 top-8 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[20px] border-r-orange-500 transform -translate-x-full'></div>
            <div>
              <div className='text-sm font-medium text-white mb-1' style={{ fontFamily: '"Bouchers Sans", sans-serif' }}>
                {section.title || "Terry's Take"}
              </div>
              <p className='text-black leading-relaxed' style={{ fontFamily: '"Bouchers Sans", sans-serif' }}>
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
            <img
              src={section.metadata?.gifUrl || 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif'}
              alt={section.content}
              className='rounded-lg shadow-lg max-w-full'
              style={{ maxHeight: '300px' }}
            />
            <p className='mt-3 text-sm font-medium text-muted-foreground italic'>
              {section.content}
            </p>
          </div>
        </div>
      );

    case 'story_link':
      return (
        <div key={index} className='story-link-section my-12 p-6 bg-orange-500/10 rounded-lg border border-orange-500/20'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='flex-1'>
              <p className='text-lg font-medium text-foreground mb-2'>
                {section.content}
              </p>
              <div className='flex items-center gap-4'>
                <Link
                  href={section.metadata?.url || `/blog/${post.slug}`}
                  className='inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium'
                >
                  <Share2 className='h-4 w-4' />
                  {section.metadata?.linkText || 'Share this story'}
                </Link>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(section.metadata?.url || `https://threadjuice.com/blog/${post.slug}`)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium'
                >
                  <ExternalLink className='h-4 w-4' />
                  Tweet this
                </a>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}