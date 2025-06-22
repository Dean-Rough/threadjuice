'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Play,
  HelpCircle,
  Quote,
} from 'lucide-react';

interface PostDetailProps {
  postId: string;
  showSidebar?: boolean;
  showRelated?: boolean;
}

interface ContentSection {
  type:
    | 'image'
    | 'describe-1'
    | 'describe-2'
    | 'describe-3'
    | 'describe-4'
    | 'describe-5'
    | 'comments-1'
    | 'comments-2'
    | 'discussion'
    | 'outro'
    | 'quiz'
    | 'quotes';
  title?: string;
  content: string;
  metadata?: {
    comments?: Array<{
      author: string;
      content: string;
      score: number;
      replies?: number;
    }>;
    quiz_data?: {
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string;
    };
    image_prompt?: string;
    discussion_participants?: string[];
    attribution?: string;
    context?: string;
  };
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: string;
  trending: boolean;
  featured: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
  persona?: {
    id: string;
    name: string;
    bio: string;
    avatar: string;
    tone: string;
  };
  content: {
    sections: ContentSection[];
    story_flow?: string;
  };
  imageUrl?: string;
  viewCount: number;
  upvoteCount: number;
  commentCount: number;
  shareCount: number;
  bookmarkCount: number;
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
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }

        const postData = await response.json();

        // Calculate reading time based on content
        const wordCount = postData.content.sections
          .map((section: ContentSection) => section.content.split(' ').length)
          .reduce((total: number, count: number) => total + count, 0);
        const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

        const enhancedPost: PostData = {
          ...postData,
          readingTime,
          redditSource: {
            subreddit: 'AskReddit', // Default for now
            originalPost: 'Original Reddit Thread',
            threadUrl: 'https://reddit.com',
          },
        };

        setPost(enhancedPost);

        // Get related posts from same category
        if (showRelated) {
          const relatedResponse = await fetch(
            `/api/posts?category=${postData.category}&limit=4`
          );
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            const related = relatedData.posts
              .filter((p: any) => p.id !== postId)
              .slice(0, 4)
              .map((p: any) => ({
                ...p,
                readingTime: Math.max(1, Math.ceil(Math.random() * 6) + 2),
              }));
            setRelatedPosts(related);
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
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

  /**
   * Render different section types
   */
  const renderSection = (section: ContentSection) => {
    switch (section.type) {
      case 'image':
        return (
          <div className='image-section text-center'>
            {(section.metadata?.image_url || post?.imageUrl) && (
              <Image
                src={section.metadata?.image_url || post.imageUrl || ''}
                alt={section.metadata?.image_prompt || post.title}
                width={800}
                height={400}
                className='img-fluid mb-3 rounded'
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover',
                }}
              />
            )}
          </div>
        );

      case 'describe-1':
      case 'describe-2':
      case 'describe-3':
      case 'describe-4':
      case 'describe-5':
        return (
          <div className='description-section'>
            <div className='description-content'>
              {section.content.split('\\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < section.content.split('\\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        );

      case 'comments-1':
      case 'comments-2':
        return (
          <div className='comments-section'>
            <div className='comments-intro mb-3'>
              <p>{section.content}</p>
            </div>
            {section.metadata?.comments && (
              <div className='reddit-comments'>
                {section.metadata.comments.map((comment, idx) => (
                  <div key={idx} className='reddit-comment card mb-3'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-start mb-2'>
                        <div className='comment-author d-flex align-items-center'>
                          <User size={16} className='me-2 text-primary' />
                          <strong>u/{comment.author}</strong>
                        </div>
                        <div className='comment-score badge bg-success'>
                          {formatNumber(comment.score)} points
                        </div>
                      </div>
                      <p className='comment-content mb-2'>{comment.content}</p>
                      {comment.replies && (
                        <small className='text-muted'>
                          <MessageCircle size={12} className='me-1' />
                          {comment.replies} replies
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'discussion':
        return (
          <div className='discussion-section bg-light rounded p-4'>
            <div className='discussion-header d-flex align-items-center mb-3'>
              <Play size={20} className='me-2 text-primary' />
              <h4 className='mb-0'>ThreadJuice Discussion</h4>
            </div>
            <div className='discussion-content'>
              {section.content.split('\\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < section.content.split('\\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        );

      case 'outro':
        return (
          <div className='outro-section border-top pt-4'>
            <div className='outro-content'>
              {section.content.split('\\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < section.content.split('\\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className='quiz-section rounded bg-primary bg-opacity-10 p-4'>
            <div className='quiz-header d-flex align-items-center mb-3'>
              <HelpCircle size={20} className='me-2 text-primary' />
              <h4 className='mb-0'>Quick Quiz</h4>
            </div>
            {section.metadata?.quiz_data ? (
              <QuizComponent quiz={section.metadata.quiz_data} />
            ) : (
              <p>{section.content}</p>
            )}
          </div>
        );

      case 'quotes':
        return (
          <div className='quote-section my-5 text-center'>
            <Quote size={32} className='mx-auto mb-3 text-orange-500' />
            <blockquote className='mb-3 text-2xl font-extrabold leading-tight text-foreground md:text-3xl'>
              &quot;{section.content}&quot;
            </blockquote>
            {section.metadata?.attribution && (
              <div className='quote-attribution text-muted-foreground'>
                <span className='font-medium'>
                  — {section.metadata.attribution}
                </span>
                {section.metadata.context && (
                  <span className='mt-1 block text-sm'>
                    {section.metadata.context}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className='default-section'>
            <p>{section.content}</p>
          </div>
        );
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
          The viral content you&apos;re looking for doesn&apos;t exist.
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
                    {post.title.length > 50
                      ? `${post.title.substring(0, 50)}...`
                      : post.title}
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
                      <Image
                        src={
                          post.persona?.avatar || '/assets/img/blog/blog01.jpg'
                        }
                        alt={post.persona?.name || post.author}
                        width={48}
                        height={48}
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
                        {post.persona?.name || post.author}
                      </h6>
                      <small className='text-muted'>
                        <Calendar size={12} className='me-1' />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className='engagement-stats d-flex align-items-center gap-3'>
                    <span className='stat-item'>
                      <Eye size={16} className='me-1' />
                      {formatNumber(post.viewCount)}
                    </span>
                    <span className='stat-item'>
                      <MessageCircle size={16} className='me-1' />
                      {formatNumber(post.commentCount)}
                    </span>
                    <span className='stat-item'>
                      <Share2 size={16} className='me-1' />
                      {formatNumber(post.shareCount)}
                    </span>
                  </div>
                </div>
              </header>

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

              {/* Post Content - Flexible Sections */}
              <div className='post-content'>
                {post.content.sections.map((section, index) => (
                  <div
                    key={index}
                    className={`content-section section-${section.type} mb-4`}
                  >
                    {section.title && (
                      <h3 className='section-title mb-3'>{section.title}</h3>
                    )}
                    {renderSection(section)}
                  </div>
                ))}
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
                    {formatNumber(post.upvoteCount) + (isLiked ? 1 : 0)}
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
                    {formatNumber(post.viewCount)} views
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
                    <Image
                      src={
                        post.persona?.avatar || '/assets/img/blog/blog01.jpg'
                      }
                      alt={post.persona?.name || post.author}
                      width={80}
                      height={80}
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
                    <h6>{post.persona?.name || post.author}</h6>
                    <p className='small text-muted'>
                      {post.persona?.bio || 'ThreadJuice Writer'}
                    </p>
                    <Link
                      href={`/personas`}
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
                      {relatedPosts.map((relatedPost: any) => (
                        <div
                          key={relatedPost.id}
                          className='related-post-item border-bottom mb-3 pb-3'
                        >
                          <div className='row g-2'>
                            <div className='col-8'>
                              <h6 className='related-post-title'>
                                <Link href={`/posts/${relatedPost.slug}`}>
                                  {relatedPost.title.length > 60
                                    ? `${relatedPost.title.substring(0, 60)}...`
                                    : relatedPost.title}
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
                  <p className='small mb-3 text-muted'>
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

// Quiz Component
function QuizComponent({
  quiz,
}: {
  quiz: {
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  };
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  return (
    <div className='quiz-widget'>
      <h5 className='quiz-question mb-3'>{quiz.question}</h5>
      <div className='quiz-options'>
        {quiz.options.map((option, index) => (
          <button
            key={index}
            className={`btn w-100 mb-2 text-start ${
              showResult
                ? index === quiz.correct_answer
                  ? 'btn-success'
                  : selectedAnswer === index
                    ? 'btn-danger'
                    : 'btn-outline-secondary'
                : 'btn-outline-primary'
            }`}
            onClick={() => !showResult && handleAnswerSelect(index)}
            disabled={showResult}
          >
            {String.fromCharCode(65 + index)}. {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className='quiz-result mt-3'>
          <div
            className={`alert ${selectedAnswer === quiz.correct_answer ? 'alert-success' : 'alert-warning'}`}
          >
            <strong>
              {selectedAnswer === quiz.correct_answer
                ? '🎉 Correct!'
                : '❌ Not quite right.'}
            </strong>
            <p className='mb-0 mt-2'>{quiz.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
