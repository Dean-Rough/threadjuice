'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  Reply,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Flag,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { Comment } from '@/types';
import { formatDistanceToNow } from '@/lib/utils';

interface CommentSystemV2Props {
  postId: string;
  className?: string;
}

export default function CommentSystemV2({
  postId,
  className = '',
}: CommentSystemV2Props) {
  const { comments, isLoading, addComment, voteComment } = useComments({ postId });
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('popular');
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  const sortedComments = useMemo(() => {
    const sortComments = (comments: Comment[]): Comment[] => {
      const sorted = [...comments];

      switch (sortBy) {
        case 'newest':
          sorted.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          break;
        case 'oldest':
          sorted.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          break;
        case 'popular':
          sorted.sort((a, b) => (b.upvotes - (b.downvotes || 0)) - (a.upvotes - (a.downvotes || 0)));
          break;
      }

      return sorted.map(comment => ({
        ...comment,
        replies: comment.replies ? sortComments(comment.replies) : [],
      }));
    };

    return sortComments(comments);
  }, [comments, sortBy]);

  const handleVote = useCallback(async (commentId: string, type: 'up' | 'down') => {
    const currentVote = userVotes[commentId];
    let voteType: 'upvote' | 'downvote' = type === 'up' ? 'upvote' : 'downvote';
    let action: 'add' | 'remove' = 'add';

    if (currentVote === type) {
      // Remove vote
      action = 'remove';
      setUserVotes(prev => ({ ...prev, [commentId]: null }));
    } else if (currentVote && currentVote !== type) {
      // Change vote
      await voteComment(commentId, currentVote === 'up' ? 'upvote' : 'downvote', 'remove');
      setUserVotes(prev => ({ ...prev, [commentId]: type }));
    } else {
      // Add new vote
      setUserVotes(prev => ({ ...prev, [commentId]: type }));
    }

    try {
      await voteComment(commentId, voteType, action);
    } catch (error) {
      // Revert on error
      setUserVotes(prev => ({ ...prev, [commentId]: currentVote || null }));
    }
  }, [userVotes, voteComment]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    try {
      await addComment(newComment, authorName);
      setNewComment('');
      setAuthorName('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !replyAuthor.trim()) return;

    try {
      await addComment(replyText, replyAuthor, parentId);
      setReplyText('');
      setReplyAuthor('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const voteState = userVotes[comment.id];
    const score = comment.upvotes - (comment.downvotes || 0);

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}
      >
        <div className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.author}</span>
                {comment.isReddit && (
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Reddit
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.timestamp))} ago
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {comment.content}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(comment.id, 'up')}
                    className={`p-1 rounded transition-colors ${
                      voteState === 'up'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{score}</span>
                  <button
                    onClick={() => handleVote(comment.id, 'down')}
                    className={`p-1 rounded transition-colors ${
                      voteState === 'down'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
                {!comment.isReddit && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </button>
                )}
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {replyingTo === comment.id && (
                <div className="mt-3">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={replyAuthor}
                      onChange={(e) => setReplyAuthor(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                          setReplyAuthor('');
                        }}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4">
                  {comment.replies.map(reply => renderComment(reply, depth + 1))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">
          Comments ({comments.length})
        </h3>

        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="space-y-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none"
              rows={4}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || !authorName.trim()}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Post Comment
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            {(['popular', 'newest', 'oldest'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  sortBy === option
                    ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedComments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            sortedComments.map(comment => renderComment(comment))
          )}
        </div>
      </div>
    </div>
  );
}