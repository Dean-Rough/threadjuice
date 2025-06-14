import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/ui/PostCard';
import { Post } from '@/types/database';

const mockPost: Post = {
  id: '1',
  title: 'Test Post Title',
  slug: 'test-post-title',
  content: 'This is test content for the post',
  excerpt: 'This is a test excerpt',
  featured_image: '/test-image.jpg',
  category: 'Technology',
  persona_name: 'The Snarky Sage',
  is_trending: true,
  view_count: 1500,
  comment_count: 25,
  share_count: 10,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  status: 'published',
  user_id: 'user1',
  reddit_thread_id: null,
  reddit_url: null,
  tags: ['tech', 'trending'],
  seo_title: null,
  seo_description: null,
  social_image: null,
};

describe('PostCard', () => {
  it('renders post title correctly', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders post excerpt when showExcerpt is true', () => {
    render(<PostCard post={mockPost} showExcerpt={true} />);
    expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
  });

  it('does not render excerpt when showExcerpt is false', () => {
    render(<PostCard post={mockPost} showExcerpt={false} />);
    expect(
      screen.queryByText('This is a test excerpt')
    ).not.toBeInTheDocument();
  });

  it('renders metadata when showMetadata is true', () => {
    render(<PostCard post={mockPost} showMetadata={true} />);

    expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument(); // view count
    expect(screen.getByText('25')).toBeInTheDocument(); // comment count
    expect(screen.getByText('10')).toBeInTheDocument(); // share count
  });

  it('does not render metadata when showMetadata is false', () => {
    render(<PostCard post={mockPost} showMetadata={false} />);

    expect(screen.queryByText('The Snarky Sage')).not.toBeInTheDocument();
    expect(screen.queryByText('Jan 1, 2023')).not.toBeInTheDocument();
  });

  it('renders trending badge for trending posts', () => {
    render(<PostCard post={mockPost} />);
    expect(
      document.querySelector('.post-card__trending-badge')
    ).toBeInTheDocument();
  });

  it('does not render trending badge for non-trending posts', () => {
    const nonTrendingPost = { ...mockPost, is_trending: false };
    render(<PostCard post={nonTrendingPost} />);
    expect(
      document.querySelector('.post-card__trending-badge')
    ).not.toBeInTheDocument();
  });

  it('renders category badge and link', () => {
    render(<PostCard post={mockPost} />);

    const categoryLink = screen.getByRole('link', { name: /technology/i });
    expect(categoryLink).toBeInTheDocument();
    expect(categoryLink).toHaveAttribute('href', '/category/technology');
  });

  it('renders post image with correct alt text', () => {
    render(<PostCard post={mockPost} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test Post Title');
  });

  it('uses default image when featured_image is null', () => {
    const postWithoutImage = { ...mockPost, featured_image: null };
    render(<PostCard post={postWithoutImage} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/assets/img/blog/blog01.jpg');
  });

  it('applies correct variant class', () => {
    render(<PostCard post={mockPost} variant='featured' />);
    expect(document.querySelector('.post-card--featured')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<PostCard post={mockPost} className='custom-class' />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders correct post link', () => {
    render(<PostCard post={mockPost} />);

    const postLinks = screen.getAllByRole('link', { name: /test post title/i });
    expect(postLinks[0]).toHaveAttribute('href', '/posts/test-post-title');
  });

  it('renders author link correctly', () => {
    render(<PostCard post={mockPost} />);

    const authorLink = screen.getByRole('link', { name: /the snarky sage/i });
    expect(authorLink).toHaveAttribute('href', '/author/the-snarky-sage');
  });

  it('handles missing persona_name gracefully', () => {
    const postWithoutPersona = { ...mockPost, persona_name: null };
    render(<PostCard post={postWithoutPersona} />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('handles missing category gracefully', () => {
    const postWithoutCategory = { ...mockPost, category: null };
    render(<PostCard post={postWithoutCategory} />);

    expect(screen.getByText('General')).toBeInTheDocument();
  });
});
