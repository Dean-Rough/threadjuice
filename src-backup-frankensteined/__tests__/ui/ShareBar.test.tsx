import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareBar } from '@/components/ui/ShareBar';

// Mock WOWAnimation component
jest.mock('@/components/elements/WOWAnimation', () => ({
  WOWAnimation: ({ children, className, animation }: any) => (
    <div
      data-testid='wow-animation'
      data-animation={animation}
      className={className}
    >
      {children}
    </div>
  ),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Mock window.open
const mockOpen = jest.fn();
Object.assign(window, { open: mockOpen });

describe('ShareBar', () => {
  const defaultProps = {
    url: 'https://example.com/post',
    title: 'Test Post Title',
    description: 'Test post description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with required props', () => {
    render(<ShareBar {...defaultProps} />);

    expect(screen.getByText('Share this post')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /facebook/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /twitter/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /linkedin/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reddit/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /whatsapp/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('should render with share count when provided', () => {
    render(<ShareBar {...defaultProps} shareCount={1234} />);

    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Shares')).toBeInTheDocument();
  });

  it('should apply correct variant classes', () => {
    const { rerender } = render(
      <ShareBar {...defaultProps} variant='vertical' />
    );
    let container = screen
      .getByText('Share this post')
      .closest('.sarsa-share-bar');
    expect(container).toHaveClass('sarsa-share-bar--vertical');

    rerender(<ShareBar {...defaultProps} variant='floating' />);
    container = screen.getByText('Share this post').closest('.sarsa-share-bar');
    expect(container).toHaveClass('sarsa-share-bar--floating');
  });

  it('should hide labels when showLabels is false', () => {
    render(<ShareBar {...defaultProps} showLabels={false} />);

    expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();

    // Buttons should still be present but without text labels
    expect(
      screen.getByRole('button', { name: /facebook/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('should open social media links when buttons are clicked', () => {
    render(<ShareBar {...defaultProps} />);

    const facebookButton = screen.getByRole('button', { name: /facebook/i });
    fireEvent.click(facebookButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank',
      'width=600,height=400'
    );

    const twitterButton = screen.getByRole('button', { name: /twitter/i });
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should generate correct share URLs', () => {
    const props = {
      url: 'https://example.com/test',
      title: 'Test Title with Spaces',
      description: 'Test description',
    };

    render(<ShareBar {...props} />);

    const linkedinButton = screen.getByRole('button', { name: /linkedin/i });
    fireEvent.click(linkedinButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(props.url)),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should copy link to clipboard when copy button is clicked', async () => {
    render(<ShareBar {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      defaultProps.url
    );

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Should revert back after timeout
    await waitFor(
      () => {
        expect(screen.getByText('Copy')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should handle clipboard copy failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      new Error('Copy failed')
    );

    render(<ShareBar {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to copy link:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should show hover states on buttons', () => {
    render(<ShareBar {...defaultProps} />);

    const facebookButton = screen.getByRole('button', { name: /facebook/i });

    fireEvent.mouseEnter(facebookButton);
    expect(facebookButton).toHaveClass('sarsa-share-bar__button--hovered');

    fireEvent.mouseLeave(facebookButton);
    expect(facebookButton).not.toHaveClass('sarsa-share-bar__button--hovered');
  });

  it('should apply platform-specific CSS custom properties', () => {
    render(<ShareBar {...defaultProps} />);

    const facebookButton = screen.getByRole('button', { name: /facebook/i });
    expect(facebookButton).toHaveStyle('--platform-color: #1877f2');

    const twitterButton = screen.getByRole('button', { name: /twitter/i });
    expect(twitterButton).toHaveStyle('--platform-color: #1da1f2');
  });

  it('should render with WOWAnimation when animated is true', () => {
    render(<ShareBar {...defaultProps} animated={true} />);

    const wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toBeInTheDocument();
    expect(wowAnimation).toHaveAttribute('data-animation', 'slideInUp');
    expect(wowAnimation).toHaveClass('sarsa-share-bar');
  });

  it('should render without WOWAnimation when animated is false', () => {
    render(<ShareBar {...defaultProps} animated={false} />);

    expect(screen.queryByTestId('wow-animation')).not.toBeInTheDocument();
    expect(
      screen.getByText('Share this post').closest('.sarsa-share-bar')
    ).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-share-class';
    render(<ShareBar {...defaultProps} className={customClass} />);

    const container = screen
      .getByText('Share this post')
      .closest('.sarsa-share-bar');
    expect(container).toHaveClass(customClass);
  });

  it('should have proper accessibility attributes', () => {
    render(<ShareBar {...defaultProps} />);

    const facebookButton = screen.getByRole('button', { name: /facebook/i });
    expect(facebookButton).toHaveAttribute('aria-label', 'Share on Facebook');
    expect(facebookButton).toHaveAttribute('title', 'Share on Facebook');

    const copyButton = screen.getByRole('button', { name: /copy/i });
    expect(copyButton).toHaveAttribute('aria-label', 'Copy link');
    expect(copyButton).toHaveAttribute('title', 'Copy link');
  });

  it('should update copy button title when copied', async () => {
    render(<ShareBar {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    expect(copyButton).toHaveAttribute('title', 'Copy link');

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyButton).toHaveAttribute('title', 'Link copied!');
    });
  });

  it('should show correct icons for each platform', () => {
    render(<ShareBar {...defaultProps} />);

    const facebookButton = screen.getByRole('button', { name: /facebook/i });
    expect(facebookButton.querySelector('i')).toHaveClass(
      'fab',
      'fa-facebook-f'
    );

    const twitterButton = screen.getByRole('button', { name: /twitter/i });
    expect(twitterButton.querySelector('i')).toHaveClass('fab', 'fa-twitter');

    const copyButton = screen.getByRole('button', { name: /copy/i });
    expect(copyButton.querySelector('i')).toHaveClass('fas', 'fa-copy');
  });

  it('should handle all social platform clicks', () => {
    render(<ShareBar {...defaultProps} />);

    const platforms = ['reddit', 'whatsapp'];

    platforms.forEach(platform => {
      const button = screen.getByRole('button', {
        name: new RegExp(platform, 'i'),
      });
      fireEvent.click(button);
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining(platform === 'whatsapp' ? 'wa.me' : platform),
        '_blank',
        'width=600,height=400'
      );
    });
  });
});
