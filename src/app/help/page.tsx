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
  Bell
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
    description: 'Learn the basics of creating an account and setting up your preferences',
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
    description: 'Customize your content preferences and improve recommendations',
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
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <Image
                src="/assets/img/logo/logo.svg"
                alt="ThreadJuice"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-gray-900">ThreadJuice</span>
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Search our help center or browse categories to find answers
            </p>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            const Component = link.external ? 'a' : Link;
            const props = link.external 
              ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
              : { href: link.href };

            return (
              <Component
                key={index}
                {...props}
                className="bg-white p-6 rounded-xl border hover:border-orange-300 transition-colors group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-orange-100 rounded-lg p-2">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  {link.external && (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {link.description}
                </p>
              </Component>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories */}
          <div className="lg:col-span-1">
            <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-100 text-orange-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
                <span className="text-gray-500 ml-2">({filteredArticles.length})</span>
              </h2>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or browse different categories
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/help/${article.id}`}
                    className="block bg-white p-6 rounded-xl border hover:border-orange-300 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {article.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="mailto:hello@threadjuice.com"
                className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Email Support</span>
              </a>
              
              <a
                href="https://reddit.com/r/threadjuice"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Community Forum</span>
              </a>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              We typically respond within 24-48 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}