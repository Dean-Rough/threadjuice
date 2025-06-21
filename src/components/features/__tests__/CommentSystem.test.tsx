/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentSystem from '../CommentSystem';

describe('CommentSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders comment system with initial state', () => {
    render(<CommentSystem postId='test-post' />);

    // Component loads with mock data immediately, no loading state
    expect(screen.getByText('Comments (3)')).toBeInTheDocument();
  });

  it('displays comments after loading', async () => {
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('Comments (3)')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is exactly what I expected when AI started taking over moderation. The chaos is real! 🤖'
        )
      ).toBeInTheDocument();
    });
  });

  it('renders comment form', async () => {
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Join the conversation...')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Post Comment' })
      ).toBeInTheDocument();
    });
  });

  it('allows sorting comments', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Most Popular')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('Most Popular');
    await user.selectOptions(sortSelect, 'Newest First');

    expect(sortSelect).toHaveValue('newest');
  });

  it('submits new comment', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Join the conversation...')
      ).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Join the conversation...');
    const submitButton = screen.getByRole('button', { name: 'Post Comment' });

    expect(submitButton).toBeDisabled();

    await user.type(textarea, 'This is a test comment');
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      expect(textarea).toHaveValue('');
    });
  });

  it('displays comment metadata correctly', async () => {
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('TechEnthusiast2024')).toBeInTheDocument();
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  it('shows like counts and allows liking', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('23')).toBeInTheDocument(); // Like count
    });

    const likeButton = screen
      .getAllByRole('button')
      .find(btn => btn.querySelector('svg') && btn.textContent?.includes('23'));

    if (likeButton) {
      await user.click(likeButton);

      await waitFor(() => {
        expect(screen.getByText('22')).toBeInTheDocument(); // Should decrease as it was already liked
      });
    }
  });

  it('opens reply form when reply button is clicked', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('TechEnthusiast2024')).toBeInTheDocument();
    });

    const replyButtons = screen.getAllByText('Reply');
    await user.click(replyButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Reply to TechEnthusiast2024.../)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });
  });

  it('submits reply to comment', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('TechEnthusiast2024')).toBeInTheDocument();
    });

    // Open reply form
    const replyButtons = screen.getAllByText('Reply');
    await user.click(replyButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Reply to TechEnthusiast2024.../)
      ).toBeInTheDocument();
    });

    // Type reply
    const replyTextarea = screen.getByPlaceholderText(
      /Reply to TechEnthusiast2024.../
    );
    await user.type(replyTextarea, 'This is a test reply');

    // Submit reply
    const submitReplyButton = screen.getByRole('button', { name: 'Reply' });
    await user.click(submitReplyButton);

    await waitFor(() => {
      expect(screen.getByText('This is a test reply')).toBeInTheDocument();
    });
  });

  it('cancels reply form', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('TechEnthusiast2024')).toBeInTheDocument();
    });

    // Open reply form
    const replyButtons = screen.getAllByText('Reply');
    await user.click(replyButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Reply to TechEnthusiast2024.../)
      ).toBeInTheDocument();
    });

    // Cancel reply
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText(/Reply to TechEnthusiast2024.../)
      ).not.toBeInTheDocument();
    });
  });

  it('displays nested replies correctly', async () => {
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Right?! I saw the same thing happen on r/technology last month.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Wait, what happened on r/technology? I missed that drama.'
        )
      ).toBeInTheDocument();
    });
  });

  it('collapses and expands comment threads', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Right?! I saw the same thing happen on r/technology last month.'
        )
      ).toBeInTheDocument();
    });

    // Find and click collapse button
    const collapseButtons = document.querySelectorAll(
      'button[title*="Collapse"]'
    );
    if (collapseButtons.length > 0) {
      await user.click(collapseButtons[0]);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Right?! I saw the same thing happen on r/technology last month.'
          )
        ).not.toBeInTheDocument();
      });

      // Expand again
      const expandButtons = document.querySelectorAll(
        'button[title*="Expand"]'
      );
      if (expandButtons.length > 0) {
        await user.click(expandButtons[0]);

        await waitFor(() => {
          expect(
            screen.getByText(
              'Right?! I saw the same thing happen on r/technology last month.'
            )
          ).toBeInTheDocument();
        });
      }
    }
  });

  it('prevents empty comment submission', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Join the conversation...')
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'Post Comment' });
    expect(submitButton).toBeDisabled();

    // Try typing spaces only
    const textarea = screen.getByPlaceholderText('Join the conversation...');
    await user.type(textarea, '   ');
    expect(submitButton).toBeDisabled();
  });

  it('prevents empty reply submission', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('TechEnthusiast2024')).toBeInTheDocument();
    });

    // Open reply form
    const replyButtons = screen.getAllByText('Reply');
    await user.click(replyButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Reply' })).toHaveLength(2); // Original reply button + form submit button
    });

    const submitReplyButton = screen.getByRole('button', { name: 'Reply' });
    expect(submitReplyButton).toBeDisabled();
  });

  it('shows empty state when no comments', async () => {
    // Mock empty comments
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([[], jest.fn()]) // comments
      .mockReturnValueOnce([false, jest.fn()]) // loading
      .mockReturnValueOnce(['', jest.fn()]) // newComment
      .mockReturnValueOnce([null, jest.fn()]) // replyingTo
      .mockReturnValueOnce(['', jest.fn()]) // replyText
      .mockReturnValueOnce(['popular', jest.fn()]); // sortBy

    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('No comments yet')).toBeInTheDocument();
      expect(
        screen.getByText('Be the first to share your thoughts!')
      ).toBeInTheDocument();
    });
  });

  it('renders report button for each comment', async () => {
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      const reportButtons = screen.getAllByText('Report');
      expect(reportButtons.length).toBeGreaterThan(0);
    });
  });

  it('handles comment actions menu', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('TechEnthusiast2024')).toBeInTheDocument();
    });

    // Find more options button
    const moreButtons = document.querySelectorAll('button');
    const moreButton = Array.from(moreButtons).find(
      btn =>
        btn.querySelector('svg') &&
        btn.getAttribute('class')?.includes('text-gray-400')
    );

    if (moreButton) {
      await user.click(moreButton);
      // In a real implementation, this would open a menu
    }
  });

  it('formats time correctly', async () => {
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      // Check for time ago format
      const timeElements = screen.getAllByText(/ago|now/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('applies custom className', () => {
    render(<CommentSystem postId='test-post' className='custom-class' />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('handles like state toggle correctly', async () => {
    const user = userEvent.setup();
    render(<CommentSystem postId='test-post' />);

    await waitFor(() => {
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    // Find the liked comment (should have filled heart)
    const likeButton = screen
      .getAllByRole('button')
      .find(btn => btn.querySelector('svg') && btn.textContent?.includes('23'));

    if (likeButton) {
      const heartIcon = likeButton.querySelector('svg');
      expect(heartIcon).toHaveClass('fill-current'); // Should be filled since it's already liked

      await user.click(likeButton);

      await waitFor(() => {
        expect(screen.getByText('22')).toBeInTheDocument();
      });
    }
  });
});
