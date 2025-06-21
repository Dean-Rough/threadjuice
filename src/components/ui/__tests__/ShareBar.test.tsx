/**
 * @jest-environment jsdom
 */

import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { ShareBar, type ShareBarProps } from '../ShareBar';

describe('ShareBar', () => {
  const defaultProps: ShareBarProps = {
    url: 'https://example.com/test-post',
    title: 'Test Post Title',
    description: 'Test post description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('renders share bar with all social links', () => {
    render(<ShareBar {...defaultProps} />);

    expect(screen.getByTestId('share-bar')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Reddit')).toBeInTheDocument();
  });

  it('displays copy link button by default', () => {
    render(<ShareBar {...defaultProps} />);
    expect(screen.getByLabelText('Copy link')).toBeInTheDocument();
  });

  it('hides copy link button when showCopyLink is false', () => {
    render(<ShareBar {...defaultProps} showCopyLink={false} />);
    expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
  });

  it('copies URL to clipboard when copy button is clicked', async () => {
    const mockWriteText = jest.fn(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<ShareBar {...defaultProps} />);

    const copyButton = screen.getByLabelText('Copy link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://example.com/test-post'
      );
    });
  });

  it('shows success state after copying', async () => {
    render(
      <ShareBar {...defaultProps} orientation='vertical' showLabels={true} />
    );

    const copyButton = screen.getByLabelText('Copy link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('applies horizontal orientation by default', () => {
    render(<ShareBar {...defaultProps} />);

    const shareBar = screen.getByTestId('share-bar');
    expect(shareBar).toHaveClass('flex', 'items-center', 'space-x-2');
  });

  it('applies vertical orientation when specified', () => {
    render(<ShareBar {...defaultProps} orientation='vertical' />);

    const shareBar = screen.getByTestId('share-bar');
    expect(shareBar).toHaveClass('flex', 'flex-col', 'space-y-2');
  });

  it('shows labels when showLabels and vertical orientation', () => {
    render(
      <ShareBar {...defaultProps} orientation='vertical' showLabels={true} />
    );

    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Reddit')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('shows share title for horizontal orientation with labels', () => {
    render(
      <ShareBar {...defaultProps} orientation='horizontal' showLabels={true} />
    );

    expect(screen.getByText('Share:')).toBeInTheDocument();
  });

  it('opens social media windows when links are clicked', () => {
    const mockOpen = jest.fn();
    window.open = mockOpen;

    render(<ShareBar {...defaultProps} />);

    const facebookLink = screen.getByLabelText('Share on Facebook');
    fireEvent.click(facebookLink);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer/sharer.php'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('generates correct Facebook share URL', () => {
    render(<ShareBar {...defaultProps} />);

    const facebookLink = screen.getByLabelText('Share on Facebook');
    expect(facebookLink).toHaveAttribute(
      'href',
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Ftest-post'
    );
  });

  it('generates correct Twitter share URL', () => {
    render(<ShareBar {...defaultProps} />);

    const twitterLink = screen.getByLabelText('Share on Twitter');
    expect(twitterLink).toHaveAttribute(
      'href',
      'https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com%2Ftest-post&text=Test%20Post%20Title'
    );
  });

  it('generates correct LinkedIn share URL', () => {
    render(<ShareBar {...defaultProps} />);

    const linkedinLink = screen.getByLabelText('Share on LinkedIn');
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fexample.com%2Ftest-post'
    );
  });

  it('generates correct Reddit share URL', () => {
    render(<ShareBar {...defaultProps} />);

    const redditLink = screen.getByLabelText('Share on Reddit');
    expect(redditLink).toHaveAttribute(
      'href',
      'https://www.reddit.com/submit?url=https%3A%2F%2Fexample.com%2Ftest-post&title=Test%20Post%20Title'
    );
  });

  it('applies custom className', () => {
    render(<ShareBar {...defaultProps} className='custom-class' />);

    const shareBar = screen.getByTestId('share-bar');
    expect(shareBar).toHaveClass('custom-class');
  });

  it('prevents default link behavior and uses window.open', () => {
    const mockOpen = jest.fn();
    window.open = mockOpen;

    render(<ShareBar {...defaultProps} />);

    const facebookLink = screen.getByLabelText('Share on Facebook');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

    fireEvent(facebookLink, clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalled();
  });
});
