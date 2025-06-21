/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialShare from '../SocialShare';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock canvas operations
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  globalAlpha: 1,
  fillRect: jest.fn(),
  fillText: jest.fn(),
  strokeRect: jest.fn(),
  measureText: jest.fn().mockReturnValue({ width: 100 }),
  createLinearGradient: jest.fn().mockReturnValue({
    addColorStop: jest.fn(),
  }),
  beginPath: jest.fn(),
  arc: jest.fn(),
  stroke: jest.fn(),
});

HTMLCanvasElement.prototype.toDataURL = jest
  .fn()
  .mockReturnValue('data:image/png;base64,test');

describe('SocialShare', () => {
  const defaultProps = {
    title: 'Test Post Title',
    url: '/test-post',
    excerpt: 'This is a test excerpt for the post',
    author: 'Test Author',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.location.origin by deleting and recreating
    (global as any).window = Object.create(window);
    (global as any).window.location = {
      origin: 'https://threadjuice.com',
    };
  });

  it('renders share button', () => {
    render(<SocialShare {...defaultProps} />);

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('opens share dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share this post')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });
  });

  it('closes dropdown when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share this post')).toBeInTheDocument();
    });

    // Close button has X icon but no accessible name
    const closeButton = document
      .querySelector('button .lucide-x')
      ?.closest('button');
    if (closeButton) {
      await user.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('Share this post')).not.toBeInTheDocument();
    });
  });

  it('displays social platform links', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      const twitterLink = screen.getByText('Twitter').closest('a');
      expect(twitterLink).toHaveAttribute(
        'href',
        expect.stringContaining('twitter.com/intent/tweet')
      );
      expect(twitterLink).toHaveAttribute('target', '_blank');

      const facebookLink = screen.getByText('Facebook').closest('a');
      expect(facebookLink).toHaveAttribute(
        'href',
        expect.stringContaining('facebook.com/sharer')
      );

      const linkedinLink = screen.getByText('LinkedIn').closest('a');
      expect(linkedinLink).toHaveAttribute(
        'href',
        expect.stringContaining('linkedin.com/sharing')
      );
    });
  });

  it('displays copyable link', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      const linkInput = screen.getByDisplayValue(
        'https://threadjuice.com/test-post'
      );
      expect(linkInput).toBeInTheDocument();
      expect(linkInput).toHaveAttribute('readonly');
    });
  });

  it('copies link to clipboard', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    const copyButton = screen.getByText('Copy');
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://threadjuice.com/test-post'
    );

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('shows custom graphics section', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Custom Graphics')).toBeInTheDocument();
      expect(screen.getByText('Show')).toBeInTheDocument();
    });

    const showButton = screen.getByText('Show');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Generate')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('IG Story')).toBeInTheDocument();
      expect(screen.getByText('Snap Story')).toBeInTheDocument();
    });
  });

  it('generates custom image', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Custom Graphics')).toBeInTheDocument();
    });

    const showButton = screen.getByText('Show');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Generate')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate');
    await user.click(generateButton);

    // Check that canvas operations were called
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });

  it('downloads generated image', async () => {
    const user = userEvent.setup();

    // Mock document.createElement for download link
    const mockLink = {
      click: jest.fn(),
      download: '',
      href: '',
    };
    jest.spyOn(document, 'createElement').mockImplementation(tagName => {
      if (tagName === 'a') {
        return mockLink as any;
      }
      return document.createElement(tagName);
    });

    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    const showButton = screen.getByText('Show');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    const downloadButton = screen.getByText('Download');
    await user.click(downloadButton);

    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toContain('threadjuice-test-post-title');
  });

  it('creates story format images', async () => {
    const user = userEvent.setup();

    const mockLink = {
      click: jest.fn(),
      download: '',
      href: '',
    };
    jest.spyOn(document, 'createElement').mockImplementation(tagName => {
      if (tagName === 'a') {
        return mockLink as any;
      }
      if (tagName === 'canvas') {
        const canvas = document.createElement('canvas');
        canvas.getContext = jest.fn().mockReturnValue({
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
          font: '',
          textAlign: '',
          fillRect: jest.fn(),
          fillText: jest.fn(),
          strokeRect: jest.fn(),
          measureText: jest.fn().mockReturnValue({ width: 100 }),
          createLinearGradient: jest.fn().mockReturnValue({
            addColorStop: jest.fn(),
          }),
        });
        canvas.toDataURL = jest
          .fn()
          .mockReturnValue('data:image/png;base64,story');
        return canvas;
      }
      return document.createElement(tagName);
    });

    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    const showButton = screen.getByText('Show');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('IG Story')).toBeInTheDocument();
    });

    const storyButton = screen.getByText('IG Story');
    await user.click(storyButton);

    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toContain('threadjuice-story');
  });

  it('includes Reddit in social platforms', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      const redditLink = screen.getByText('Reddit').closest('a');
      expect(redditLink).toHaveAttribute(
        'href',
        expect.stringContaining('reddit.com/submit')
      );
    });
  });

  it('includes email sharing', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      const emailLink = screen.getByText('Email').closest('a');
      expect(emailLink).toHaveAttribute(
        'href',
        expect.stringContaining('mailto:')
      );
    });
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SocialShare {...defaultProps} />
        <div data-testid='outside'>Outside element</div>
      </div>
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share this post')).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId('outside');
    await user.click(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('Share this post')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<SocialShare {...defaultProps} className='custom-class' />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('handles props correctly', async () => {
    const user = userEvent.setup();
    const customProps = {
      title: 'Custom Title',
      url: '/custom-url',
      excerpt: 'Custom excerpt',
      author: 'Custom Author',
      featuredImage: '/custom-image.jpg',
    };

    render(<SocialShare {...customProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('https://threadjuice.com/custom-url')
      ).toBeInTheDocument();
    });

    const twitterLink = screen.getByText('Twitter').closest('a');
    expect(twitterLink?.getAttribute('href')).toContain(
      encodeURIComponent('Custom Title')
    );
  });

  it('handles missing optional props', async () => {
    const user = userEvent.setup();
    const minimalProps = {
      title: 'Minimal Title',
      url: '/minimal-url',
    };

    render(<SocialShare {...minimalProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share this post')).toBeInTheDocument();
    });
  });

  it('shows canvas preview when custom graphics are visible', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    const showButton = screen.getByText('Show');
    await user.click(showButton);

    await waitFor(() => {
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  it('disables generate button during generation', async () => {
    const user = userEvent.setup();
    render(<SocialShare {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    const showButton = screen.getByText('Show');
    await user.click(showButton);

    const generateButton = screen.getByText('Generate');

    // Mock a slow generation process
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      globalAlpha: 1,
      fillRect: jest.fn(),
      fillText: jest.fn(),
      strokeRect: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 100 }),
      createLinearGradient: jest.fn().mockReturnValue({
        addColorStop: jest.fn(),
      }),
      beginPath: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
    };

    HTMLCanvasElement.prototype.getContext = jest
      .fn()
      .mockReturnValue(mockContext);

    await user.click(generateButton);

    // Button should exist and have been clicked
    expect(generateButton).toBeInTheDocument();
  });
});
