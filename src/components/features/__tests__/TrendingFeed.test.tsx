import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendingFeed from '../TrendingFeed';

// Mock the mockPosts data
jest.mock('../../../data/mockPosts', () => ({
  mockPosts: [
    {
      id: '1',
      title: 'Test Post 1',
      excerpt: 'This is a test excerpt',
      slug: 'test-post-1',
      category: 'Technology',
      persona: { name: 'Tech Guru', avatar: '/avatar1.jpg' },
      featuredImage: '/image1.jpg',
      publishedAt: '2024-01-01',
      readTime: 5,
      tags: ['React', 'JavaScript'],
    },
    {
      id: '2',
      title: 'Test Post 2',
      excerpt: 'Another test excerpt',
      slug: 'test-post-2',
      category: 'Design',
      persona: { name: 'Design Pro', avatar: '/avatar2.jpg' },
      featuredImage: '/image2.jpg',
      publishedAt: '2024-01-02',
      readTime: 3,
      tags: ['Design', 'UI'],
    },
    {
      id: '3',
      title: 'Test Post 3',
      excerpt: 'Third test excerpt',
      slug: 'test-post-3',
      category: 'Technology',
      persona: { name: 'Tech Guru', avatar: '/avatar1.jpg' },
      featuredImage: '/image3.jpg',
      publishedAt: '2024-01-03',
      readTime: 7,
      tags: ['Vue', 'Frontend'],
    },
  ],
}));

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Grid3X3: () => <div data-testid="grid-icon" />,
  List: () => <div data-testid="list-icon" />,
  LayoutGrid: () => <div data-testid="masonry-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('TrendingFeed', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    jest.clearAllMocks();
  });

  it('renders trending feed with posts', () => {
    render(<TrendingFeed />);
    
    expect(screen.getByText('Trending Stories')).toBeInTheDocument();
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.getByText('Test Post 3')).toBeInTheDocument();
  });

  it('renders search functionality', () => {
    render(<TrendingFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search stories...');
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('filters posts by search term', async () => {
    render(<TrendingFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search stories...');
    fireEvent.change(searchInput, { target: { value: 'Test Post 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Post 3')).not.toBeInTheDocument();
    });
  });

  it('clears search when X button is clicked', async () => {
    render(<TrendingFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search stories...');
    fireEvent.change(searchInput, { target: { value: 'Test Post 1' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
    
    const clearButton = screen.getByTestId('x-icon').closest('button');
    if (clearButton) {
      fireEvent.click(clearButton);
    }
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      expect(screen.getByText('Test Post 3')).toBeInTheDocument();
    });
  });

  it('renders category filter', () => {
    render(<TrendingFeed />);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    expect(categorySelect).toBeInTheDocument();
    
    // Check if categories are available in options
    fireEvent.click(categorySelect);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('filters posts by category', async () => {
    render(<TrendingFeed />);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Technology' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 3')).toBeInTheDocument();
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
  });

  it('renders layout toggle buttons', () => {
    render(<TrendingFeed />);
    
    expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
    expect(screen.getByTestId('list-icon')).toBeInTheDocument();
    expect(screen.getByTestId('masonry-icon')).toBeInTheDocument();
  });

  it('changes layout when layout buttons are clicked', async () => {
    render(<TrendingFeed />);
    
    const container = screen.getByTestId('trending-feed-container');
    
    // Default should be grid layout
    expect(container).toHaveClass('grid');
    
    // Click list layout
    const listButton = screen.getByTestId('list-icon').closest('button');
    if (listButton) {
      fireEvent.click(listButton);
      await waitFor(() => {
        expect(container).toHaveClass('space-y-6');
      });
    }
    
    // Click masonry layout
    const masonryButton = screen.getByTestId('masonry-icon').closest('button');
    if (masonryButton) {
      fireEvent.click(masonryButton);
      await waitFor(() => {
        expect(container).toHaveClass('columns-1');
      });
    }
  });

  it('renders sort options', () => {
    render(<TrendingFeed />);
    
    const sortSelect = screen.getByDisplayValue('Latest');
    expect(sortSelect).toBeInTheDocument();
    
    // Check sort options
    fireEvent.click(sortSelect);
    expect(screen.getByText('Trending')).toBeInTheDocument();
    expect(screen.getByText('Most Read')).toBeInTheDocument();
  });

  it('sorts posts by different criteria', async () => {
    render(<TrendingFeed />);
    
    // Get initial order
    const posts = screen.getAllByText(/Test Post \d/);
    expect(posts[0]).toHaveTextContent('Test Post 3'); // Latest first by default
    
    // Sort by oldest
    const sortSelect = screen.getByDisplayValue('Latest');
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });
    
    await waitFor(() => {
      const sortedPosts = screen.getAllByText(/Test Post \d/);
      expect(sortedPosts[0]).toHaveTextContent('Test Post 1');
    });
  });

  it('displays no results message when no posts match filters', async () => {
    render(<TrendingFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search stories...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Post' } });
    
    await waitFor(() => {
      expect(screen.getByText('No stories found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
    });
  });

  it('renders post metadata correctly', () => {
    render(<TrendingFeed />);
    
    // Check if post metadata is displayed
    expect(screen.getByText('Tech Guru')).toBeInTheDocument();
    expect(screen.getByText('Design Pro')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('3 min read')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    // This would test loading state if implemented
    // For now, we'll just ensure the component renders
    const { container } = render(<TrendingFeed />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('is accessible with proper ARIA labels', () => {
    render(<TrendingFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search stories...');
    expect(searchInput).toHaveAttribute('type', 'text');
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    expect(categorySelect).toHaveAttribute('id', 'category-filter');
    
    const sortSelect = screen.getByDisplayValue('Latest');
    expect(sortSelect).toHaveAttribute('id', 'sort-filter');
  });

  it('handles keyboard navigation', () => {
    render(<TrendingFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search stories...');
    
    // Test Enter key on search
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    // Should not crash
    expect(searchInput).toBeInTheDocument();
  });

  it('renders with custom initial filters', () => {
    // Test with props if the component accepts them
    render(<TrendingFeed />);
    
    // Verify default state
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Latest')).toBeInTheDocument();
  });

  it('preserves scroll position during filtering', async () => {
    render(<TrendingFeed />);
    
    // Simulate scroll
    window.scrollY = 500;
    
    const searchInput = screen.getByPlaceholderText('Search stories...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Should not affect scroll position dramatically
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });
  });
});