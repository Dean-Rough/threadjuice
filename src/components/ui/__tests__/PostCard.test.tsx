/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard, type PostCardProps } from '../PostCard';

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('PostCard', () => {
  const mockProps: PostCardProps = {
    id: '1',
    title: 'Test Post Title',
    excerpt: 'This is a test excerpt for the post.',
    slug: 'test-post-title',
    category: 'viral',
    featuredImage: '/test-image.jpg',
    author: {
      id: 'author-1',
      name: 'The Snarky Sage',
      avatar: '/avatar.jpg',
      tone: 'sarcastic and deadpan',
    },
    publishedAt: '2024-01-15T10:00:00Z',
    readTime: 5,
    viewCount: 1250,
    commentCount: 45,
    shareCount: 12,
    isViral: true,
    tags: ['reddit', 'viral', 'humor'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders post card with all required elements', () => {
    render(<PostCard {...mockProps} />);

    expect(screen.getByTestId('post-card')).toBeInTheDocument();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test excerpt for the post.')
    ).toBeInTheDocument();
    expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('displays featured image when provided', () => {
    render(<PostCard {...mockProps} />);

    const image = screen.getByAltText('Test Post Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('shows fallback placeholder when no featured image', () => {
    const propsWithoutImage = { ...mockProps, featuredImage: undefined };
    render(<PostCard {...propsWithoutImage} />);

    expect(screen.queryByAltText('Test Post Title')).not.toBeInTheDocument();
    expect(screen.getByTestId('post-card')).toContainHTML('bg-gradient-to-br');
  });

  it('displays trending badge when post is viral', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByTestId('trending-badge')).toBeInTheDocument();
  });

  it('does not display trending badge when post is not viral', () => {
    const nonViralProps = { ...mockProps, isViral: false };
    render(<PostCard {...nonViralProps} />);
    expect(screen.queryByTestId('trending-badge')).not.toBeInTheDocument();
  });

  it('formats view count correctly', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('1.3K')).toBeInTheDocument(); // 1250 -> 1.3K
  });

  it('formats large view counts correctly', () => {
    const propsWithLargeViews = { ...mockProps, viewCount: 1500000 };
    render(<PostCard {...propsWithLargeViews} />);
    expect(screen.getByText('1.5M')).toBeInTheDocument();
  });

  it('displays tags when provided', () => {
    render(<PostCard {...mockProps} />);

    expect(screen.getByText('#reddit')).toBeInTheDocument();
    expect(screen.getByText('#viral')).toBeInTheDocument();
    expect(screen.getByText('#humor')).toBeInTheDocument();
  });

  it('limits displayed tags to 3', () => {
    const propsWithManyTags = {
      ...mockProps,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    render(<PostCard {...propsWithManyTags} />);

    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
    expect(screen.getByText('#tag3')).toBeInTheDocument();
    expect(screen.queryByText('#tag4')).not.toBeInTheDocument();
    expect(screen.queryByText('#tag5')).not.toBeInTheDocument();
  });

  it('formats date correctly for recent posts', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
    const recentProps = { ...mockProps, publishedAt: recentDate };
    render(<PostCard {...recentProps} />);

    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('formats date correctly for yesterday', () => {
    const yesterdayDate = new Date(
      Date.now() - 25 * 60 * 60 * 1000
    ).toISOString(); // 25 hours ago
    const yesterdayProps = { ...mockProps, publishedAt: yesterdayDate };
    render(<PostCard {...yesterdayProps} />);

    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('contains correct links to post detail page', () => {
    render(<PostCard {...mockProps} />);

    const titleLinks = screen.getAllByRole('link', { name: 'Test Post Title' });
    const readMoreLink = screen.getByRole('link', { name: /Read Full Story/i });

    // Should have image link and title link both pointing to post
    expect(titleLinks).toHaveLength(2);
    titleLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/blog/test-post-title');
    });
    expect(readMoreLink).toHaveAttribute('href', '/blog/test-post-title');
  });

  it('handles image error gracefully', () => {
    render(<PostCard {...mockProps} />);

    const image = screen.getByAltText('Test Post Title');
    fireEvent.error(image);

    expect(image).toHaveAttribute(
      'src',
      '/assets/img/lifestyle/life_style01.jpg'
    );
  });

  it('applies custom className when provided', () => {
    render(<PostCard {...mockProps} className='custom-class' />);

    const postCard = screen.getByTestId('post-card');
    expect(postCard).toHaveClass('custom-class');
  });

  it('renders persona badge', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByTestId('persona-badge')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByTestId('category-badge')).toBeInTheDocument();
  });

  it('displays all engagement metrics', () => {
    render(<PostCard {...mockProps} />);

    expect(screen.getByText('1.3K')).toBeInTheDocument(); // view count
    expect(screen.getByText('45')).toBeInTheDocument(); // comment count
    expect(screen.getByText('12')).toBeInTheDocument(); // share count
  });

  it('handles zero counts correctly', () => {
    const zeroCountProps = {
      ...mockProps,
      viewCount: 0,
      commentCount: 0,
      shareCount: 0,
    };
    render(<PostCard {...zeroCountProps} />);

    const metrics = screen.getAllByText('0');
    expect(metrics).toHaveLength(3); // view, comment, share counts
  });
});
