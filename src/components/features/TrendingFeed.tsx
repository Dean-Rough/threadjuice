'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import data from '@/util/blogData';
import { getRandomPersona, WriterPersona } from '@/data/personas';
import { 
  Flame, 
  Eye, 
  MessageCircle, 
  Share2, 
  Filter,
  Zap,
  Star,
  Gamepad2,
  Monitor,
  Film,
  Trophy,
  Music,
  UtensilsCrossed,
  Plane,
  Sparkles,
  Radio,
  FlaskConical
} from 'lucide-react';

interface PostWithPersona {
  id: number;
  title: string;
  img: string;
  group: string;
  trending: boolean;
  category: string;
  author: string;
  date: string;
  persona: WriterPersona;
  engagement: {
    views: string;
    comments: number;
    shares: number;
  };
}

interface TrendingFeedProps {
  layout?: 'grid' | 'list' | 'masonry';
  postsPerPage?: number;
  showFilters?: boolean;
  featured?: boolean;
}

export default function TrendingFeed({ 
  layout = 'grid', 
  postsPerPage = 12, 
  showFilters = true,
  featured = false 
}: TrendingFeedProps) {
  const [posts, setPosts] = useState<PostWithPersona[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostWithPersona[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Generate posts with personas and engagement data
  useEffect(() => {
    const postsWithMetadata = data.slice(0, postsPerPage).map(post => ({
      ...post,
      persona: getRandomPersona(),
      engagement: {
        views: `${Math.floor(Math.random() * 50) + 5}.${Math.floor(Math.random() * 9)}k`,
        comments: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 200) + 25
      }
    }));
    
    setPosts(postsWithMetadata);
    setFilteredPosts(postsWithMetadata);
    
    // Simulate loading delay for smooth animations
    setTimeout(() => setIsLoading(false), 500);
  }, [postsPerPage]);

  // Filter functionality
  const categories = ['all', ...Array.from(new Set(posts.map(post => post.category.toLowerCase())))];
  
  const handleFilter = (category: string) => {
    setActiveFilter(category);
    if (category === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.category.toLowerCase() === category));
    }
  };

  if (isLoading) {
    return (
      <div className="trending-feed-loading text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading viral content...</p>
      </div>
    );
  }

  return (
    <div className="trending-feed">
      {/* Filter Bar */}
      {showFilters && (
        <div className="filter-bar mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="filter-buttons">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`btn me-2 mb-2 ${
                      activeFilter === category 
                        ? 'btn-primary' 
                        : 'btn-outline-primary'
                    }`}
                    onClick={() => handleFilter(category)}
                  >
                    {category === 'all' 
                      ? <><Flame size={16} className="me-1" />All</>
                      : <>{getCategoryIcon(category)} {category}</>
                    }
                  </button>
                ))}
              </div>
            </div>
            <div className="col-lg-4 text-end">
              <div className="feed-meta">
                <span className="text-muted">
                  {filteredPosts.length} viral {filteredPosts.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Post (if enabled) */}
      {featured && filteredPosts.length > 0 && (
        <div className="featured-post mb-5">
          <div className="row">
            <div className="col-lg-8">
              <div className="featured-post-card position-relative">
                <div className="featured-post-thumb">
                  <Link href={`/posts/${filteredPosts[0].id}`}>
                    <img
                      src={`/assets/img/${filteredPosts[0].group}/${filteredPosts[0].img}`}
                      alt={filteredPosts[0].title}
                      className="img-fluid rounded"
                      style={{ height: '400px', width: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                  <div className="featured-badge position-absolute top-0 start-0 m-3">
                    <span className="badge bg-danger fs-6">⚡ FEATURED</span>
                  </div>
                </div>
                <div className="featured-post-content mt-3">
                  <div className="meta-info mb-2">
                    <span className="category me-3">
                      <Link href={`/category/${filteredPosts[0].category.toLowerCase()}`}>
                        🔥 {filteredPosts[0].category}
                      </Link>
                    </span>
                    <span className="author">
                      By <Link href={`/personas/${filteredPosts[0].persona.id}`}>
                        {filteredPosts[0].persona.name}
                      </Link>
                    </span>
                  </div>
                  <h2 className="featured-title">
                    <Link href={`/posts/${filteredPosts[0].id}`}>
                      {filteredPosts[0].title} (Reddit viral thread)
                    </Link>
                  </h2>
                  <p className="featured-excerpt text-muted">
                    {filteredPosts[0].persona.bio}
                  </p>
                  <div className="engagement-stats">
                    <span className="me-3">
                      <i className="fal fa-signal me-1"></i>
                      {filteredPosts[0].engagement.views}
                    </span>
                    <span className="me-3">
                      <i className="fal fa-comment-dots me-1"></i>
                      {filteredPosts[0].engagement.comments}
                    </span>
                    <span>
                      <i className="fal fa-share-alt me-1"></i>
                      {filteredPosts[0].engagement.shares}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              {/* Trending sidebar content could go here */}
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className={`posts-grid layout-${layout}`}>
        <div className={`row ${layout === 'masonry' ? 'masonry-grid' : ''}`}>
          {filteredPosts.slice(featured ? 1 : 0).map((post, index) => (
            <div
              key={post.id}
              className={`
                ${layout === 'list' ? 'col-12' : 'col-lg-4 col-md-6'} 
                mb-4 post-item
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <article className={`post-card h-100 ${layout === 'list' ? 'post-card-horizontal' : ''}`}>
                {layout === 'list' ? (
                  // Horizontal layout for list view
                  <div className="row g-0 h-100">
                    <div className="col-md-4">
                      <div className="post-thumb position-relative">
                        <Link href={`/posts/${post.id}`}>
                          <img
                            src={`/assets/img/${post.group}/${post.img}`}
                            alt={post.title}
                            className="img-fluid rounded-start"
                            style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                          />
                        </Link>
                        {post.trending && (
                          <div className="trending-badge position-absolute top-0 end-0 m-2">
                            <span className="badge bg-warning">🔥 TRENDING</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="post-content p-4 h-100 d-flex flex-column">
                        <div className="meta-info mb-2">
                          <span className="category me-3">
                            <Link href={`/category/${post.category.toLowerCase()}`}>
                              {getCategoryEmoji(post.category)} {post.category}
                            </Link>
                          </span>
                          <span className="author text-muted">
                            By <Link href={`/personas/${post.persona.id}`}>
                              {post.persona.name}
                            </Link>
                          </span>
                        </div>
                        <h4 className="post-title flex-grow-1">
                          <Link href={`/posts/${post.id}`}>
                            {post.title} (Reddit viral thread)
                          </Link>
                        </h4>
                        <div className="engagement-stats mt-auto">
                          <span className="me-3">
                            <i className="fal fa-signal me-1"></i>
                            {post.engagement.views}
                          </span>
                          <span className="me-3">
                            <i className="fal fa-comment-dots me-1"></i>
                            {post.engagement.comments}
                          </span>
                          <span>
                            <i className="fal fa-share-alt me-1"></i>
                            {post.engagement.shares}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Vertical layout for grid/masonry view
                  <>
                    <div className="post-thumb position-relative">
                      <Link href={`/posts/${post.id}`}>
                        <img
                          src={`/assets/img/${post.group}/${post.img}`}
                          alt={post.title}
                          className="img-fluid rounded-top"
                          style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                        />
                      </Link>
                      {post.trending && (
                        <div className="trending-badge position-absolute top-0 end-0 m-2">
                          <span className="badge bg-warning">🔥 TRENDING</span>
                        </div>
                      )}
                      <div className="post-overlay position-absolute bottom-0 start-0 end-0 p-2">
                        <span className="category">
                          <Link href={`/category/${post.category.toLowerCase()}`}>
                            {getCategoryEmoji(post.category)} {post.category}
                          </Link>
                        </span>
                      </div>
                    </div>
                    <div className="post-content p-3">
                      <div className="meta-info mb-2">
                        <span className="author text-muted">
                          By <Link href={`/personas/${post.persona.id}`}>
                            {post.persona.name}
                          </Link>
                        </span>
                      </div>
                      <h5 className="post-title">
                        <Link href={`/posts/${post.id}`}>
                          {post.title}
                        </Link>
                      </h5>
                      <div className="engagement-stats mt-3">
                        <span className="me-3">
                          <i className="fal fa-signal me-1"></i>
                          {post.engagement.views}
                        </span>
                        <span className="me-3">
                          <i className="fal fa-comment-dots me-1"></i>
                          {post.engagement.comments}
                        </span>
                        <span>
                          <i className="fal fa-share-alt me-1"></i>
                          {post.engagement.shares}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className="load-more text-center mt-5">
        <button className="btn btn-outline-primary btn-lg">
          Load More Viral Content
        </button>
      </div>
    </div>
  );
}

// Helper function to get category icons
function getCategoryIcon(category: string): JSX.Element {
  const iconMap: { [key: string]: JSX.Element } = {
    gaming: <Gamepad2 size={16} className="me-1" />,
    tech: <Monitor size={16} className="me-1" />,
    movie: <Film size={16} className="me-1" />,
    sports: <Trophy size={16} className="me-1" />,
    music: <Music size={16} className="me-1" />,
    food: <UtensilsCrossed size={16} className="me-1" />,
    travel: <Plane size={16} className="me-1" />,
    lifestyle: <Sparkles size={16} className="me-1" />,
    news: <Radio size={16} className="me-1" />,
    science: <FlaskConical size={16} className="me-1" />
  };
  
  return iconMap[category.toLowerCase()] || <Radio size={16} className="me-1" />;
}