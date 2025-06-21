'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Heart,
  Reply,
  Flag,
  User,
  MoreHorizontal,
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

interface CommentModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentModal({
  postId,
  isOpen,
  onClose,
}: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>(
    'popular'
  );

  useEffect(() => {
    if (isOpen) {
      loadComments();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, postId, sortBy, loadComments]);

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
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/posts/${postId}/comments?sort=${sortBy}`);
      // const data = await response.json();
      
      // eslint-disable-next-line no-unused-vars
      const _postId = postId; // Used in real API call
      // eslint-disable-next-line no-unused-vars  
      const _sortBy = sortBy; // Used in real API call

      // Mock data for now - replace with real API
      const mockComments: Comment[] = [
        {
          id: '1',
          content:
            "This story is absolutely wild! I can't believe this actually happened. 😂",
          author: 'RedditUser2024',
          authorId: 'user-1',
          createdAt: '2024-06-19T14:30:00Z',
          likes: 23,
          isLiked: false,
          parentId: null,
          replies: [
            {
              id: '2',
              content:
                'Right?! The internet never ceases to amaze me with these stories.',
              author: 'TechEnthusiast',
              authorId: 'user-2',
              createdAt: '2024-06-19T14:45:00Z',
              likes: 8,
              isLiked: true,
              parentId: '1',
              replies: [],
            },
          ],
        },
        {
          id: '3',
          content:
            "As someone who works in the industry, this doesn't surprise me at all. These things happen more often than you'd think!",
          author: 'IndustryInsider',
          authorId: 'user-3',
          createdAt: '2024-06-19T13:15:00Z',
          likes: 45,
          isLiked: false,
          parentId: null,
          replies: [],
        },
      ];

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

    // TODO: Replace with actual API call
    // await fetch(`/api/posts/${postId}/comments`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content: newComment })
    // });

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: 'CurrentUser', // TODO: Get from auth context
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

  const handleLikeComment = async (commentId: string) => {
    // TODO: Replace with actual API call
    // await fetch(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' });

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
    const maxNestLevel = 3; // Limit nesting in modal
    const nestLevel = Math.min(level, maxNestLevel);

    return (
      <div
        key={comment.id}
        className={`${isNested ? 'ml-4 border-l-2 border-border pl-4' : ''} mb-4`}
      >
        <div className='rounded-lg border bg-card p-4'>
          {/* Comment Header */}
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
                <User className='h-4 w-4 text-muted-foreground' />
              </div>
              <div>
                <span className='font-medium text-foreground'>
                  {comment.author}
                </span>
                <span className='ml-2 text-sm text-muted-foreground'>
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
            </div>
            <button className='text-muted-foreground hover:text-foreground'>
              <MoreHorizontal className='h-4 w-4' />
            </button>
          </div>

          {/* Comment Content */}
          <div className='mb-3 text-foreground'>{comment.content}</div>

          {/* Comment Actions */}
          <div className='flex items-center space-x-4 text-sm'>
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center space-x-1 transition-colors ${
                comment.isLiked
                  ? 'text-red-500'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <ChevronUp
                className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`}
              />
              <span>{comment.likes}</span>
            </button>

            <button
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
              className='flex items-center space-x-1 text-muted-foreground transition-colors hover:text-primary'
            >
              <Reply className='h-4 w-4' />
              <span>Reply</span>
            </button>

            <button className='flex items-center space-x-1 text-muted-foreground transition-colors hover:text-destructive'>
              <Flag className='h-4 w-4' />
              <span>Report</span>
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className='mt-4 border-t pt-4'>
              <form
                onSubmit={e => {
                  e.preventDefault(); /* handleSubmitReply(comment.id) */
                }}
              >
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.author}...`}
                  rows={3}
                  className='w-full resize-none rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                />
                <div className='mt-2 flex justify-end space-x-2'>
                  <button
                    type='button'
                    onClick={() => setReplyingTo(null)}
                    className='rounded-md border px-4 py-2 text-muted-foreground hover:bg-muted'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={!replyText.trim()}
                    className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
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

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal Panel - Slide in from right */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl transform border-l bg-background transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b p-6'>
          <div className='flex items-center space-x-2'>
            <MessageSquare className='h-6 w-6 text-primary' />
            <h2 className='text-xl font-semibold'>
              Comments ({comments.length})
            </h2>
          </div>

          <div className='flex items-center space-x-4'>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className='rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value='popular'>Most Upvoted</option>
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
            </select>

            <button
              onClick={onClose}
              className='rounded-md p-2 transition-colors hover:bg-muted'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='p-6'>
            {/* New Comment Form */}
            <div className='mb-6 rounded-lg border bg-card p-4'>
              <form onSubmit={handleSubmitComment}>
                <div className='flex items-start space-x-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                    <User className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div className='flex-1'>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder='Join the conversation...'
                      rows={3}
                      className='w-full resize-none rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                    <div className='mt-3 flex justify-end'>
                      <button
                        type='submit'
                        disabled={!newComment.trim()}
                        className='rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Comments List */}
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
              </div>
            ) : comments.length === 0 ? (
              <div className='py-8 text-center'>
                <MessageSquare className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-medium'>No comments yet</h3>
                <p className='text-muted-foreground'>
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {comments.map(comment => renderComment(comment))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
