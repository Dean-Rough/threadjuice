'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShareBar } from '../ui/ShareBar';
import { Quiz } from './Quiz';

interface Author {
  name: string;
  avatar: string;
  bio: string;
  posts: number;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  score: number;
  timestamp: string;
  replies?: Comment[];
}

interface PostDetailProps {
  post: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    image: string;
    author: Author;
    publishedAt: string;
    readTime: number;
    subreddit: string;
    originalUrl: string;
    tags: string[];
    views: number;
    likes: number;
    comments: Comment[];
    quiz?: {
      id: string;
      title: string;
      questions: Array<{
        id: string;
        question: string;
        options: string[];
        correct: number;
        explanation: string;
      }>;
    };
  };
}

export function PostDetail({ post }: PostDetailProps) {
  const [showComments, setShowComments] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'comments' | 'quiz'>(
    'story'
  );

  return (
    <article className='sarsa-post-detail mx-auto max-w-4xl'>
      {/* Hero Section */}
      <div className='sarsa-post-detail__hero mb-8'>
        <div className='sarsa-post-detail__hero-image relative mb-6 aspect-[16/9] overflow-hidden rounded-lg'>
          <Image
            src={post.image}
            alt={post.title}
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
          <div className='absolute bottom-4 left-4 right-4'>
            <div className='mb-3 flex flex-wrap gap-2'>
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className='rounded-full bg-blue-600 px-2 py-1 text-xs text-white'
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className='mb-2 text-2xl font-bold text-white md:text-4xl'>
              {post.title}
            </h1>
          </div>
        </div>

        {/* Author & Meta */}
        <div className='sarsa-post-detail__meta mb-6 flex flex-col gap-4 md:flex-row md:items-center'>
          <div className='flex items-center gap-3'>
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={48}
              height={48}
              className='rounded-full'
            />
            <div>
              <h3 className='font-semibold text-gray-900'>
                {post.author.name}
              </h3>
              <p className='text-sm text-gray-600'>{post.author.bio}</p>
            </div>
          </div>

          <div className='flex items-center gap-6 text-sm text-gray-500 md:ml-auto'>
            <span className='flex items-center gap-1'>
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                  clipRule='evenodd'
                />
              </svg>
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
            <span className='flex items-center gap-1'>
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                  clipRule='evenodd'
                />
              </svg>
              {post.readTime} min read
            </span>
            <span className='flex items-center gap-1'>
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                <path
                  fillRule='evenodd'
                  d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                  clipRule='evenodd'
                />
              </svg>
              {post.views.toLocaleString()} views
            </span>
          </div>
        </div>

        {/* Reddit Source */}
        <div className='sarsa-post-detail__source mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <svg
              className='h-5 w-5 text-orange-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
            </svg>
            <span className='text-sm font-medium text-orange-800'>
              Originally from r/{post.subreddit}
            </span>
          </div>
          <a
            href={post.originalUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm text-orange-700 underline hover:text-orange-800'
          >
            View original Reddit thread →
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='sarsa-post-detail__tabs mb-8 border-b border-gray-200'>
        <nav className='flex space-x-8'>
          <button
            onClick={() => setActiveTab('story')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'story'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Story
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Comments ({post.comments.length})
          </button>
          {post.quiz && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'quiz'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Quiz
            </button>
          )}
        </nav>
      </div>

      {/* Content Sections */}
      <div className='sarsa-post-detail__content'>
        {activeTab === 'story' && (
          <div className='sarsa-post-detail__story'>
            <div className='prose prose-lg mb-8 max-w-none'>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Share Section */}
            <div className='sarsa-post-detail__share border-t border-gray-200 pt-8'>
              <ShareBar
                url={`${window.location.origin}/post/${post.id}`}
                title={post.title}
                shareCount={post.likes}
              />
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className='sarsa-post-detail__comments space-y-6'>
            <div className='mb-6 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>
                Top Reddit Comments ({post.comments.length})
              </h3>
              <button
                onClick={() => setShowComments(!showComments)}
                className='text-sm text-blue-600 hover:text-blue-800'
              >
                {showComments ? 'Hide' : 'Show'} All Comments
              </button>
            </div>

            {post.comments
              .slice(0, showComments ? undefined : 5)
              .map(comment => (
                <CommentCard key={comment.id} comment={comment} />
              ))}

            {!showComments && post.comments.length > 5 && (
              <button
                onClick={() => setShowComments(true)}
                className='w-full rounded-lg bg-gray-50 py-3 text-gray-700 transition-colors hover:bg-gray-100'
              >
                Show {post.comments.length - 5} more comments
              </button>
            )}
          </div>
        )}

        {activeTab === 'quiz' && post.quiz && (
          <div className='sarsa-post-detail__quiz'>
            <Quiz
              questions={post.quiz.questions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options.map((option, index) => ({
                  id: index.toString(),
                  text: option,
                  isCorrect: index === q.correct,
                })),
                explanation: q.explanation,
                difficulty: 'medium' as const,
                category: 'Quiz',
              }))}
              title={post.quiz.title}
              timeLimit={300}
            />
          </div>
        )}
      </div>

      {/* Related Posts Sidebar would go here */}
      <aside className='sarsa-post-detail__sidebar mt-12 rounded-lg bg-gray-50 p-6'>
        <h3 className='mb-4 font-semibold'>About the Author</h3>
        <div className='flex items-start gap-3'>
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={60}
            height={60}
            className='rounded-full'
          />
          <div>
            <h4 className='font-medium'>{post.author.name}</h4>
            <p className='mb-2 text-sm text-gray-600'>{post.author.bio}</p>
            <p className='text-xs text-gray-500'>
              {post.author.posts} posts published
            </p>
          </div>
        </div>
      </aside>
    </article>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className='sarsa-comment-card rounded-lg border border-gray-200 bg-white p-4'>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-medium text-white'>
            {comment.author.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className='min-w-0 flex-1'>
          <div className='mb-2 flex items-center gap-2'>
            <span className='font-medium text-gray-900'>
              u/{comment.author}
            </span>
            <span className='text-xs text-gray-500'>•</span>
            <span className='text-xs text-gray-500'>{comment.timestamp}</span>
            <div className='ml-auto flex items-center gap-1'>
              <svg
                className='h-4 w-4 text-orange-500'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z' />
              </svg>
              <span className='text-sm font-medium text-gray-700'>
                {comment.score}
              </span>
            </div>
          </div>

          <div className='mb-3 text-sm leading-relaxed text-gray-800'>
            {comment.content}
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className='ml-4 space-y-3 border-l-2 border-gray-100 pl-4'>
              {comment.replies.slice(0, 2).map(reply => (
                <div key={reply.id} className='text-sm'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='font-medium text-gray-700'>
                      u/{reply.author}
                    </span>
                    <span className='text-xs text-gray-400'>•</span>
                    <span className='text-xs text-gray-400'>
                      {reply.timestamp}
                    </span>
                  </div>
                  <p className='text-gray-600'>{reply.content}</p>
                </div>
              ))}
              {comment.replies.length > 2 && (
                <button className='text-xs text-blue-600 hover:text-blue-800'>
                  Show {comment.replies.length - 2} more replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
