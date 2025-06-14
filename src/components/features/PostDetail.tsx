'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getPersonaById,
  getRandomPersona,
  WriterPersona,
} from '@/data/personas';
import data from '@/util/blogData';
import {
  Eye,
  MessageCircle,
  Share2,
  Clock,
  User,
  Heart,
  Bookmark,
  ArrowLeft,
  Tag,
  ExternalLink,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface PostDetailProps {
  postId: number;
  showSidebar?: boolean;
  showRelated?: boolean;
}

interface PostData {
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
    likes: number;
  };
  content: string;
  excerpt: string;
  tags: string[];
  redditSource?: {
    subreddit: string;
    originalPost: string;
    threadUrl: string;
  };
  readingTime: number;
}

export default function PostDetail({
  postId,
  showSidebar = true,
  showRelated = true,
}: PostDetailProps) {
  const [post, setPost] = useState<PostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Simulate loading post data
    const postData = data.find(p => p.id === postId);
    if (postData) {
      const enhancedPost: PostData = {
        ...postData,
        persona: getRandomPersona(),
        engagement: {
          views: `${Math.floor(Math.random() * 100) + 10}.${Math.floor(Math.random() * 9)}k`,
          comments: Math.floor(Math.random() * 500) + 100,
          shares: Math.floor(Math.random() * 200) + 50,
          likes: Math.floor(Math.random() * 1000) + 200,
        },
        content: generateSampleContent(postData.title),
        excerpt: `${postData.title.slice(0, 120)}...`,
        tags: generateTags(postData.category),
        redditSource: {
          subreddit: getSubredditForCategory(postData.category),
          originalPost:
            'r/' +
            getSubredditForCategory(postData.category) +
            '/comments/abc123',
          threadUrl: `https://reddit.com/r/${getSubredditForCategory(postData.category)}/comments/abc123`,
        },
        readingTime: Math.floor(Math.random() * 8) + 3,
      };

      setPost(enhancedPost);

      // Get related posts
      if (showRelated) {
        const related = data
          .filter(p => p.id !== postId && p.category === postData.category)
          .slice(0, 4)
          .map(p => ({
            ...p,
            persona: getRandomPersona(),
            engagement: {
              views: `${Math.floor(Math.random() * 50) + 5}.${Math.floor(Math.random() * 9)}k`,
              comments: Math.floor(Math.random() * 200) + 30,
              shares: Math.floor(Math.random() * 100) + 15,
              likes: Math.floor(Math.random() * 500) + 50,
            },
            content: '',
            excerpt: `${p.title.slice(0, 100)}...`,
            tags: generateTags(p.category),
            readingTime: Math.floor(Math.random() * 6) + 2,
          }));
        setRelatedPosts(related);
      }
    }

    setTimeout(() => setIsLoading(false), 800);
  }, [postId, showRelated]);

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className='post-detail-loading py-5'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-8'>
              <div className='loading-skeleton'>
                <div
                  className='skeleton-line w-75 mb-3'
                  style={{ height: '2rem' }}
                ></div>
                <div
                  className='skeleton-line w-50 mb-4'
                  style={{ height: '1rem' }}
                ></div>
                <div
                  className='skeleton-box mb-4'
                  style={{ height: '300px' }}
                ></div>
                <div className='skeleton-line w-100 mb-2'></div>
                <div className='skeleton-line w-100 mb-2'></div>
                <div className='skeleton-line w-75 mb-2'></div>
              </div>
            </div>
            {showSidebar && (
              <div className='col-lg-4'>
                <div className='skeleton-box' style={{ height: '200px' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className='post-not-found py-5 text-center'>
        <h2>Post Not Found</h2>
        <p className='text-muted'>
          The viral content you're looking for doesn't exist.
        </p>
        <Link href='/' className='btn btn-primary'>
          <ArrowLeft size={16} className='me-2' />
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className='post-detail'>
      <div className='container'>
        <div className='row'>
          {/* Main Content */}
          <div className={showSidebar ? 'col-lg-8' : 'col-12'}>
            <article className='post-article'>
              {/* Breadcrumb */}
              <nav className='post-breadcrumb mb-4'>
                <ol className='breadcrumb'>
                  <li className='breadcrumb-item'>
                    <Link href='/'>Home</Link>
                  </li>
                  <li className='breadcrumb-item'>
                    <Link href={`/category/${post.category.toLowerCase()}`}>
                      {post.category}
                    </Link>
                  </li>
                  <li className='breadcrumb-item active'>
                    {post.title.slice(0, 50)}...
                  </li>
                </ol>
              </nav>

              {/* Post Header */}
              <header className='post-header mb-4'>
                <div className='post-meta mb-3'>
                  <div className='d-flex align-items-center flex-wrap gap-3'>
                    <span className='category-badge'>
                      <Tag size={14} className='me-1' />
                      <Link href={`/category/${post.category.toLowerCase()}`}>
                        {post.category}
                      </Link>
                    </span>
                    {post.trending && (
                      <span className='trending-badge'>
                        <TrendingUp size={14} className='me-1' />
                        Trending
                      </span>
                    )}
                    <span className='reading-time'>
                      <Clock size={14} className='me-1' />
                      {post.readingTime} min read
                    </span>
                  </div>
                </div>

                <h1 className='post-title'>{post.title}</h1>
                <p className='post-excerpt text-muted'>{post.excerpt}</p>

                {/* Author Info */}
                <div className='author-info d-flex align-items-center justify-content-between mb-4'>
                  <div className='d-flex align-items-center'>
                    <div className='author-avatar me-3'>
                      <img
                        src={post.persona.avatar}
                        alt={post.persona.name}
                        className='rounded-circle'
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'cover',
                        }}
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/img/blog/blog01.jpg';
                        }}
                      />
                    </div>
                    <div>
                      <h6 className='author-name mb-0'>
                        <Link href={`/personas/${post.persona.id}`}>
                          {post.persona.name}
                        </Link>
                      </h6>
                      <small className='text-muted'>
                        <Calendar size={12} className='me-1' />
                        {post.date}
                      </small>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className='engagement-stats d-flex align-items-center gap-3'>
                    <span className='stat-item'>
                      <Eye size={16} className='me-1' />
                      {post.engagement.views}
                    </span>
                    <span className='stat-item'>
                      <MessageCircle size={16} className='me-1' />
                      {post.engagement.comments}
                    </span>
                    <span className='stat-item'>
                      <Share2 size={16} className='me-1' />
                      {post.engagement.shares}
                    </span>
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              <div className='post-featured-image mb-4'>
                <img
                  src={`/assets/img/${post.group}/${post.img}`}
                  alt={post.title}
                  className='img-fluid rounded'
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              </div>

              {/* Reddit Source Attribution */}
              {post.redditSource && (
                <div className='reddit-source alert alert-info mb-4'>
                  <div className='d-flex align-items-center'>
                    <ExternalLink size={16} className='me-2' />
                    <div>
                      <strong>Originally from Reddit:</strong>{' '}
                      <Link
                        href={post.redditSource.threadUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {post.redditSource.originalPost}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Post Content */}
              <div className='post-content'>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {/* Tags */}
              <div className='post-tags mb-4 mt-4'>
                <h6>Tags:</h6>
                <div className='tags-list'>
                  {post.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/tag/${tag.toLowerCase()}`}
                      className='tag-badge mb-2 me-2'
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='post-actions d-flex align-items-center justify-content-between border-top pt-4'>
                <div className='action-buttons'>
                  <button
                    className={`btn me-2 ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart
                      size={16}
                      className='me-1'
                      fill={isLiked ? 'currentColor' : 'none'}
                    />
                    {post.engagement.likes + (isLiked ? 1 : 0)}
                  </button>
                  <button
                    className={`btn me-2 ${isBookmarked ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Bookmark
                      size={16}
                      className='me-1'
                      fill={isBookmarked ? 'currentColor' : 'none'}
                    />
                    Save
                  </button>
                  <button
                    className='btn btn-outline-primary'
                    onClick={handleShare}
                  >
                    <Share2 size={16} className='me-1' />
                    Share
                  </button>
                </div>

                <div className='final-stats text-muted'>
                  <small>
                    <Eye size={14} className='me-1' />
                    {post.engagement.views} views
                  </small>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div className='col-lg-4'>
              <aside className='post-sidebar'>
                {/* Author Bio */}
                <div className='sidebar-widget author-widget mb-4'>
                  <div className='widget-header d-flex align-items-center mb-3'>
                    <User size={20} className='me-2' />
                    <h5 className='mb-0'>About the Author</h5>
                  </div>
                  <div className='author-card text-center'>
                    <img
                      src={post.persona.avatar}
                      alt={post.persona.name}
                      className='author-avatar-large rounded-circle mx-auto mb-3'
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                      }}
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/img/blog/blog01.jpg';
                      }}
                    />
                    <h6>{post.persona.name}</h6>
                    <p className='text-muted small'>{post.persona.bio}</p>
                    <Link
                      href={`/personas/${post.persona.id}`}
                      className='btn btn-outline-primary btn-sm'
                    >
                      View Profile
                    </Link>
                  </div>
                </div>

                {/* Related Posts */}
                {showRelated && relatedPosts.length > 0 && (
                  <div className='sidebar-widget related-posts mb-4'>
                    <h5 className='widget-title mb-3'>Related Stories</h5>
                    <div className='related-posts-list'>
                      {relatedPosts.map(relatedPost => (
                        <div
                          key={relatedPost.id}
                          className='related-post-item border-bottom mb-3 pb-3'
                        >
                          <div className='row g-2'>
                            <div className='col-4'>
                              <Link href={`/posts/${relatedPost.id}`}>
                                <img
                                  src={`/assets/img/${relatedPost.group}/${relatedPost.img}`}
                                  alt={relatedPost.title}
                                  className='img-fluid rounded'
                                  style={{ height: '60px', objectFit: 'cover' }}
                                />
                              </Link>
                            </div>
                            <div className='col-8'>
                              <h6 className='related-post-title'>
                                <Link href={`/posts/${relatedPost.id}`}>
                                  {relatedPost.title.slice(0, 60)}...
                                </Link>
                              </h6>
                              <small className='text-muted'>
                                <Clock size={12} className='me-1' />
                                {relatedPost.readingTime} min read
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter Signup */}
                <div className='sidebar-widget newsletter-widget'>
                  <h5 className='widget-title mb-3'>Stay Updated</h5>
                  <p className='text-muted small mb-3'>
                    Get the latest viral content delivered to your inbox.
                  </p>
                  <form className='newsletter-form'>
                    <div className='input-group mb-2'>
                      <input
                        type='email'
                        className='form-control'
                        placeholder='Your email'
                      />
                      <button className='btn btn-primary' type='submit'>
                        Subscribe
                      </button>
                    </div>
                    <small className='text-muted'>
                      No spam, unsubscribe anytime.
                    </small>
                  </form>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function generateSampleContent(title: string): string {
  return `
    <p>This viral Reddit thread started as a simple question but quickly spiraled into something much more fascinating. What began as casual conversation evolved into a masterclass in internet culture, human psychology, and the art of storytelling.</p>
    
    <p>The original poster had no idea their innocent question would unleash a torrent of responses, each more surprising than the last. From heartwarming personal anecdotes to absolutely unhinged takes on reality, this thread has it all.</p>
    
    <h3>The Plot Thickens</h3>
    <p>About halfway through the comments, someone dropped a bombshell that completely changed the direction of the conversation. What started as lighthearted banter suddenly became a deep dive into topics nobody saw coming.</p>
    
    <blockquote class="blockquote">
      <p>"This is exactly why I love Reddit. You come for the memes, stay for the existential crises, and leave questioning everything you thought you knew about humanity."</p>
      <footer class="blockquote-footer">Top comment with 15.7k upvotes</footer>
    </blockquote>
    
    <h3>The Internet's Collective Wisdom</h3>
    <p>As the thread continued to gain traction, experts from various fields began chiming in. Marine biologists, NASA engineers, professional comedians, and that one person who somehow always knows exactly the right thing to say at exactly the right moment.</p>
    
    <p>The beauty of this particular thread lies not just in its content, but in how it demonstrates the internet's unique ability to bring together disparate voices and create something greater than the sum of its parts.</p>
    
    <h3>Why This Matters</h3>
    <p>In an era of increasing digital division, threads like this remind us of the internet's original promise: to connect people, share knowledge, and occasionally stumble upon profound truths in the most unexpected places.</p>
    
    <p>This is the magic of viral content at its finest - not manufactured outrage or artificial engagement, but genuine human connection that resonates across demographics and geography.</p>
  `;
}

function generateTags(category: string): string[] {
  const tagMap: { [key: string]: string[] } = {
    gaming: ['Gaming', 'Reddit', 'Viral', 'Community', 'Discussion'],
    tech: ['Technology', 'Innovation', 'Reddit', 'Viral', 'Science'],
    movie: ['Entertainment', 'Movies', 'Pop Culture', 'Reddit', 'Viral'],
    sports: ['Sports', 'Competition', 'Reddit', 'Community', 'Viral'],
    music: ['Music', 'Culture', 'Reddit', 'Viral', 'Entertainment'],
    food: ['Food', 'Cooking', 'Reddit', 'Lifestyle', 'Viral'],
    travel: ['Travel', 'Adventure', 'Reddit', 'Stories', 'Viral'],
    lifestyle: ['Lifestyle', 'Personal', 'Reddit', 'Stories', 'Viral'],
    news: ['News', 'Current Events', 'Reddit', 'Discussion', 'Viral'],
    science: ['Science', 'Research', 'Reddit', 'Education', 'Viral'],
  };

  return tagMap[category.toLowerCase()] || ['Reddit', 'Viral', 'Discussion'];
}

function getSubredditForCategory(category: string): string {
  const subredditMap: { [key: string]: string } = {
    gaming: 'gaming',
    tech: 'technology',
    movie: 'movies',
    sports: 'sports',
    music: 'music',
    food: 'food',
    travel: 'travel',
    lifestyle: 'LifeProTips',
    news: 'news',
    science: 'science',
  };

  return subredditMap[category.toLowerCase()] || 'AskReddit';
}
