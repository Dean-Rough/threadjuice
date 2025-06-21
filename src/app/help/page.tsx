'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Book,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  User,
  Settings,
  Zap,
  TrendingUp,
  Share2,
  Bell,
} from 'lucide-react';

/**
 * Help center and user documentation page
 * Provides searchable help content and support resources
 */

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content?: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with ThreadJuice',
    description:
      'Learn the basics of creating an account and setting up your preferences',
    category: 'Getting Started',
    tags: ['signup', 'account', 'onboarding', 'setup'],
  },
  {
    id: 'ai-writers',
    title: 'Understanding Our AI Writers',
    description: 'Meet the personalities behind your stories and how they work',
    category: 'Content',
    tags: ['ai', 'writers', 'personalities', 'content'],
  },
  {
    id: 'personalization',
    title: 'Personalizing Your Feed',
    description:
      'Customize your content preferences and improve recommendations',
    category: 'Personalization',
    tags: ['feed', 'preferences', 'categories', 'algorithm'],
  },
  {
    id: 'sharing',
    title: 'Sharing Stories',
    description: 'How to share content on social media and with friends',
    category: 'Features',
    tags: ['sharing', 'social media', 'links', 'attribution'],
  },
  {
    id: 'newsletter',
    title: 'Newsletter & Notifications',
    description: 'Managing your email digest and notification preferences',
    category: 'Settings',
    tags: ['newsletter', 'email', 'notifications', 'digest'],
  },
  {
    id: 'quizzes',
    title: 'Interactive Quizzes',
    description: 'How to participate in and create interactive content',
    category: 'Features',
    tags: ['quizzes', 'interactive', 'polls', 'engagement'],
  },
  {
    id: 'mobile',
    title: 'Mobile Experience',
    description: 'Using ThreadJuice on your phone and tablet',
    category: 'Technical',
    tags: ['mobile', 'app', 'responsive', 'pwa'],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Common Issues',
    description: 'Solutions to frequently encountered problems',
    category: 'Support',
    tags: ['troubleshooting', 'bugs', 'errors', 'fixes'],
  },
];

const categories = [
  { id: 'all', name: 'All Topics', icon: Book },
  { id: 'Getting Started', name: 'Getting Started', icon: User },
  { id: 'Content', name: 'Content', icon: TrendingUp },
  { id: 'Features', name: 'Features', icon: Zap },
  { id: 'Personalization', name: 'Personalization', icon: Settings },
  { id: 'Technical', name: 'Technical', icon: HelpCircle },
  { id: 'Support', name: 'Support', icon: MessageCircle },
];

const quickLinks = [
  {
    title: 'User Guide',
    description: 'Comprehensive guide to using ThreadJuice',
    icon: Book,
    href: '/docs/user-guide',
    external: false,
  },
  {
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: Mail,
    href: 'mailto:hello@threadjuice.com',
    external: true,
  },
  {
    title: 'Community',
    description: 'Join discussions on Reddit',
    icon: MessageCircle,
    href: 'https://reddit.com/r/threadjuice',
    external: true,
  },
  {
    title: 'Feature Requests',
    description: 'Suggest new features and improvements',
    icon: Share2,
    href: '/feedback',
    external: false,
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'all' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Track search query
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Help Search', { query: searchQuery });
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='border-b bg-white'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center'>
            <Link href='/' className='mb-6 inline-flex items-center space-x-2'>
              <Image
                src='/assets/img/logo/logo.svg'
                alt='ThreadJuice'
                width={40}
                height={40}
                className='h-10 w-10'
              />
              <span className='text-2xl font-bold text-gray-900'>
                ThreadJuice
              </span>
            </Link>

            <h1 className='mb-4 text-4xl font-bold text-gray-900'>
              How can we help you?
            </h1>
            <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-600'>
              Search our help center or browse categories to find answers
            </p>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className='mx-auto max-w-2xl'>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search for help articles...'
                  className='w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            const Component = link.external ? 'a' : Link;
            const props = link.external
              ? {
                  href: link.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : { href: link.href };

            return (
              <Component
                key={index}
                {...props}
                className='group rounded-xl border bg-white p-6 transition-colors hover:border-orange-300'
              >
                <div className='mb-3 flex items-center space-x-3'>
                  <div className='rounded-lg bg-orange-100 p-2'>
                    <Icon className='h-6 w-6 text-orange-600' />
                  </div>
                  {link.external && (
                    <ExternalLink className='h-4 w-4 text-gray-400' />
                  )}
                </div>
                <h3 className='mb-2 font-semibold text-gray-900 transition-colors group-hover:text-orange-600'>
                  {link.title}
                </h3>
                <p className='text-sm text-gray-600'>{link.description}</p>
              </Component>
            );
          })}
        </div>

        <div className='grid gap-8 lg:grid-cols-4'>
          {/* Categories */}
          <div className='lg:col-span-1'>
            <h2 className='mb-4 font-semibold text-gray-900'>Categories</h2>
            <div className='space-y-2'>
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='h-5 w-5' />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles */}
          <div className='lg:col-span-3'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='font-semibold text-gray-900'>
                {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
                <span className='ml-2 text-gray-500'>
                  ({filteredArticles.length})
                </span>
              </h2>
            </div>

            {filteredArticles.length === 0 ? (
              <div className='py-12 text-center'>
                <HelpCircle className='mx-auto mb-4 h-16 w-16 text-gray-300' />
                <h3 className='mb-2 text-lg font-medium text-gray-900'>
                  No articles found
                </h3>
                <p className='text-gray-600'>
                  Try adjusting your search or browse different categories
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredArticles.map(article => (
                  <Link
                    key={article.id}
                    href={`/help/${article.id}`}
                    className='group block rounded-xl border bg-white p-6 transition-colors hover:border-orange-300'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='mb-2 font-semibold text-gray-900 transition-colors group-hover:text-orange-600'>
                          {article.title}
                        </h3>
                        <p className='mb-3 text-gray-600'>
                          {article.description}
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {article.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className='h-5 w-5 text-gray-400 transition-colors group-hover:text-orange-600' />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className='mt-16 border-t bg-white'>
        <div className='container mx-auto px-4 py-12'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Still need help?
            </h2>
            <p className='mb-8 text-gray-600'>
              Can&apos;t find what you&apos;re looking for? Our support team is here to
              help.
            </p>

            <div className='grid gap-4 md:grid-cols-2'>
              <a
                href='mailto:hello@threadjuice.com'
                className='flex items-center justify-center space-x-2 rounded-lg bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700'
              >
                <Mail className='h-5 w-5' />
                <span>Email Support</span>
              </a>

              <a
                href='https://reddit.com/r/threadjuice'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center space-x-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:border-orange-300 hover:text-orange-600'
              >
                <MessageCircle className='h-5 w-5' />
                <span>Community Forum</span>
              </a>
            </div>

            <p className='mt-4 text-sm text-gray-500'>
              We typically respond within 24-48 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
