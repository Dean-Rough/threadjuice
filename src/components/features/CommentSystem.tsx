'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Reply,
  Heart,
  MoreHorizontal,
  Flag,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  parentId: string | null;
  replies: Comment[];
  isCollapsed?: boolean;
}

interface CommentSystemProps {
  postId: string;
  className?: string;
}

export default function CommentSystem({
  postId,
  className = '',
}: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>(
    'popular'
  );

  useEffect(() => {
    loadComments();
  }, [postId, sortBy, loadComments]);

  const sortComments = useCallback((comments: Comment[]): Comment[] => {
    const sorted = [...comments];

    switch (sortBy) {
      case 'newest':
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'popular':
      default:
        return sorted.sort((a, b) => b.likes - a.likes);
    }
  }, [sortBy]);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      
      // eslint-disable-next-line no-unused-vars
      const _postId = postId; // Used in real API call
      // eslint-disable-next-line no-unused-vars  
      const _sortBy = sortBy; // Used in real API call
      
      // Mock data - in real app, fetch from API
      const mockComments: Comment[] = [
        {
          id: '1',
          content:
            'This is exactly what I expected when AI started taking over moderation. The chaos is real! 🤖',
          author: 'TechEnthusiast2024',
          authorId: 'user-1',
          createdAt: '2024-06-15T14:30:00Z',
          likes: 23,
          isLiked: true,
          parentId: null,
          replies: [
            {
              id: '2',
              content:
                'Right?! I saw the same thing happen on r/technology last month. AI moderators are wild.',
              author: 'RedditLurker',
              authorId: 'user-2',
              createdAt: '2024-06-15T14:45:00Z',
              likes: 8,
              isLiked: false,
              parentId: '1',
              replies: [
                {
                  id: '3',
                  content:
                    'Wait, what happened on r/technology? I missed that drama.',
                  author: 'CuriousUser',
                  authorId: 'user-3',
                  createdAt: '2024-06-15T15:00:00Z',
                  likes: 3,
                  isLiked: false,
                  parentId: '2',
                  replies: [],
                },
              ],
            },
          ],
        },
        {
          id: '4',
          content:
            "As someone who works in AI, this doesn't surprise me at all. The training data probably included too many memes 😂",
          author: 'AIResearcher',
          authorId: 'user-4',
          createdAt: '2024-06-15T13:15:00Z',
          likes: 45,
          isLiked: false,
          parentId: null,
          replies: [
            {
              id: '5',
              content:
                'That actually makes a lot of sense. Garbage in, garbage out!',
              author: 'DataScientist',
              authorId: 'user-5',
              createdAt: '2024-06-15T13:30:00Z',
              likes: 12,
              isLiked: true,
              parentId: '4',
              replies: [],
            },
          ],
        },
        {
          id: '6',
          content:
            "I for one welcome our new AI overlords. At least they're consistently chaotic.",
          author: 'SarcasticSage',
          authorId: 'user-6',
          createdAt: '2024-06-15T12:00:00Z',
          likes: 67,
          isLiked: false,
          parentId: null,
          replies: [],
        },
      ];

      // Sort comments based on selected criteria
      const sortedComments = sortComments(mockComments);
      setComments(sortedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, sortBy, sortComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: 'CurrentUser', // In real app, get from auth
      authorId: 'current-user',
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      parentId: null,
      replies: [],
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      content: replyText,
      author: 'CurrentUser',
      authorId: 'current-user',
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      parentId,
      replies: [],
    };

    // Add reply to the appropriate parent comment
    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply],
          };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(prev => addReplyToComment(prev));
    setReplyText('');
    setReplyingTo(null);
  };

  const handleLikeComment = async (commentId: string) => {
    const toggleLikeInComments = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: toggleLikeInComments(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(prev => toggleLikeInComments(prev));
  };

  const toggleCommentCollapse = (commentId: string) => {
    const toggleCollapseInComments = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isCollapsed: !comment.isCollapsed,
          };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: toggleCollapseInComments(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(prev => toggleCollapseInComments(prev));
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - commentDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const isNested = level > 0;
    const maxNestLevel = 6;
    const nestLevel = Math.min(level, maxNestLevel);

    return (
      <div
        key={comment.id}
        className={`${isNested ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''} mb-4`}
        style={{ marginLeft: isNested ? `${nestLevel * 16}px` : '0' }}
      >
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
          {/* Comment Header */}
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-300'>
                <User className='h-4 w-4 text-gray-600' />
              </div>
              <div>
                <span className='font-medium text-gray-900'>
                  {comment.author}
                </span>
                <span className='ml-2 text-sm text-gray-500'>
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              {comment.replies.length > 0 && (
                <button
                  onClick={() => toggleCommentCollapse(comment.id)}
                  className='text-gray-400 hover:text-gray-600'
                  title={
                    comment.isCollapsed ? 'Expand replies' : 'Collapse replies'
                  }
                >
                  {comment.isCollapsed ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronUp className='h-4 w-4' />
                  )}
                </button>
              )}
              <button className='text-gray-400 hover:text-gray-600'>
                <MoreHorizontal className='h-4 w-4' />
              </button>
            </div>
          </div>

          {/* Comment Content */}
          <div className='mb-3 text-gray-900'>{comment.content}</div>

          {/* Comment Actions */}
          <div className='flex items-center space-x-4 text-sm'>
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center space-x-1 ${
                comment.isLiked
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`}
              />
              <span>{comment.likes}</span>
            </button>

            <button
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
              className='flex items-center space-x-1 text-gray-500 hover:text-blue-600'
            >
              <Reply className='h-4 w-4' />
              <span>Reply</span>
            </button>

            <button className='flex items-center space-x-1 text-gray-500 hover:text-orange-600'>
              <Flag className='h-4 w-4' />
              <span>Report</span>
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className='mt-4 border-t border-gray-200 pt-4'>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSubmitReply(comment.id);
                }}
              >
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.author}...`}
                  rows={3}
                  className='w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
                <div className='mt-2 flex justify-end space-x-2'>
                  <button
                    type='button'
                    onClick={() => setReplyingTo(null)}
                    className='rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={!replyText.trim()}
                    className='rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50'
                  >
                    Reply
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {comment.replies.length > 0 && !comment.isCollapsed && (
          <div className='mt-4'>
            {comment.replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className='flex items-center justify-center py-8'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600'></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Comments Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <MessageSquare className='h-6 w-6 text-gray-600' />
          <h3 className='text-xl font-semibold text-gray-900'>
            Comments ({comments.length})
          </h3>
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className='rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
        >
          <option value='popular'>Most Popular</option>
          <option value='newest'>Newest First</option>
          <option value='oldest'>Oldest First</option>
        </select>
      </div>

      {/* New Comment Form */}
      <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <form onSubmit={handleSubmitComment}>
          <div className='flex items-start space-x-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-300'>
              <User className='h-5 w-5 text-gray-600' />
            </div>
            <div className='flex-1'>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder='Join the conversation...'
                rows={3}
                className='w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              />
              <div className='mt-3 flex justify-end'>
                <button
                  type='submit'
                  disabled={!newComment.trim()}
                  className='rounded-md bg-orange-600 px-6 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className='space-y-4'>
        {comments.length === 0 ? (
          <div className='py-8 text-center'>
            <MessageSquare className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900'>
              No comments yet
            </h3>
            <p className='text-gray-600'>
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
