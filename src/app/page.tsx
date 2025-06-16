'use client';

import ThreadJuiceLayout from '@/components/layout/ThreadJuiceLayout';
import FeaturedCarousel from '@/components/features/FeaturedCarousel';
import TrendingFeed from '@/components/features/TrendingFeed';
import CategoryFilter from '@/components/features/CategoryFilter';
import { mockPosts } from '@/data/mockPosts';

export default function Home() {
  // Get featured posts (top 5 trending)
  const featuredPosts = mockPosts
    .filter(post => post.category === 'viral' || post.category === 'trending')
    .slice(0, 5);

  // Get trending posts for the main feed
  const trendingPosts = mockPosts
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);

  // Category data for filter
  const categories = [
    { id: 'all', name: 'All', count: mockPosts.length },
    { id: 'viral', name: 'Viral', count: mockPosts.filter(p => p.category === 'viral').length },
    { id: 'trending', name: 'Trending', count: mockPosts.filter(p => p.category === 'trending').length },
    { id: 'chaos', name: 'Chaos', count: mockPosts.filter(p => p.category === 'chaos').length },
    { id: 'wholesome', name: 'Wholesome', count: mockPosts.filter(p => p.category === 'wholesome').length },
    { id: 'drama', name: 'Drama', count: mockPosts.filter(p => p.category === 'drama').length },
  ];

  const handleFilter = (filteredItems: any[]) => {
    // Handle filtering logic here
    console.log('Filtered items:', filteredItems);
  };

  return (
    <ThreadJuiceLayout>
      {/* Hero Section with Featured Carousel */}
      <section className="pb-50 pt-80">
        <div className="container">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧵 Reddit Stories, Reimagined for Virality
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered storytelling transforms trending Reddit threads into engaging content with custom personas and social media optimization.
            </p>
          </div>
          
          <FeaturedCarousel />
        </div>
      </section>

      {/* Category Filter and Search */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <CategoryFilter 
            items={trendingPosts}
            onFilter={handleFilter}
            categories={categories}
          />
        </div>
      </section>

      {/* Trending Posts Feed */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Trending Now</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">🔥 Viral Stories</h2>
                <p className="text-gray-600 mt-2">The hottest Reddit threads transformed into engaging stories</p>
              </div>
              <div className="hidden sm:block">
                <a 
                  href="/posts" 
                  className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center"
                >
                  View All Posts
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <TrendingFeed />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-cream">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Transform Reddit Into Viral Content
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Curation</h3>
                <p className="text-gray-600">
                  Our AI scans trending Reddit threads and transforms them into engaging, viral-ready stories.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎭</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Personas</h3>
                <p className="text-gray-600">
                  Stories are told through unique writer personas, each with distinct voices and perspectives.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Social Ready</h3>
                <p className="text-gray-600">
                  Optimized for sharing across social platforms with built-in engagement tools and analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ThreadJuiceLayout>
  );
}