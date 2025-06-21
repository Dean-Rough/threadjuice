/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrendingFeed from '../TrendingFeed';
import { usePosts, usePostsByCategory } from '@/hooks/usePosts';

// Mock the hooks
jest.mock('@/hooks/usePosts');
const mockUsePosts = usePosts as jest.MockedFunction<typeof usePosts>;
const mockUsePostsByCategory = usePostsByCategory as jest.MockedFunction<
  typeof usePostsByCategory
>;

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
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

// Mock personas
jest.mock('@/data/personas', () => ({
  getRandomPersona: () => ({
    id: 'test-persona',
    name: 'Test Writer',
    tone: 'sarcastic',
    bio: 'Test bio',
    avatar: '/test-avatar.jpg',
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Flame: () => <div data-testid='flame-icon' />,
  Eye: () => <div data-testid='eye-icon' />,
  MessageCircle: () => <div data-testid='message-icon' />,
  Share2: () => <div data-testid='share-icon' />,
  Filter: () => <div data-testid='filter-icon' />,
}));

const mockPosts = [
  {
    id: 1,
    title: 'Test Viral Post',
    img: 'test.jpg',
    group: 'test-group',
    trending: true,
    category: 'gaming',
    author: 'Test Author',
    date: '2024-01-01',
    engagement: {
      views: '10.5k',
      comments: 150,
      shares: 75,
    },
  },
  {
    id: 2,
    title: 'Another Test Post',
    img: 'test2.jpg',
    group: 'test-group',
    trending: false,
    category: 'tech',
    author: 'Another Author',
    date: '2024-01-02',
    engagement: {
      views: '5.2k',
      comments: 89,
      shares: 42,
    },
  },
];

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('TrendingFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUsePosts.mockReturnValue({
      data: { posts: mockPosts },
      isLoading: false,
      error: null,
    } as any);

    mockUsePostsByCategory.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
  });

  it('shows loading spinner when data is loading', () => {
    mockUsePosts.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    renderWithQueryClient(<TrendingFeed />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading viral content...')).toBeInTheDocument();
  });

  it('shows error message when data fails to load', () => {
    mockUsePosts.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any);

    renderWithQueryClient(<TrendingFeed />);

    expect(screen.getByText('Error Loading Content')).toBeInTheDocument();
    expect(
      screen.getByText('Please try refreshing the page.')
    ).toBeInTheDocument();
  });

  it('renders posts with proper structure', () => {
    renderWithQueryClient(<TrendingFeed />);

    expect(screen.getByText('Test Viral Post')).toBeInTheDocument();
    expect(screen.getByText('Another Test Post')).toBeInTheDocument();
  });

  it('renders category filter buttons with centralized categories', () => {
    renderWithQueryClient(<TrendingFeed />);

    // Should show category filters using centralized category system
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('viral')).toBeInTheDocument();
    expect(screen.getByText('gaming')).toBeInTheDocument();
  });

  it('shows correct post count', () => {
    renderWithQueryClient(<TrendingFeed />);

    expect(screen.getByText('2 viral stories')).toBeInTheDocument();
  });

  it('filters posts by category when filter is clicked', async () => {
    const categoryPosts = [mockPosts[0]]; // Only gaming post
    mockUsePostsByCategory.mockReturnValue({
      data: categoryPosts,
      isLoading: false,
      error: null,
    } as any);

    renderWithQueryClient(<TrendingFeed />);

    const gamingFilter = screen.getByText('gaming');
    fireEvent.click(gamingFilter);

    await waitFor(() => {
      expect(screen.getByText('1 viral story')).toBeInTheDocument();
    });
  });

  it('shows engagement stats with consistent icons', () => {
    renderWithQueryClient(<TrendingFeed />);

    expect(screen.getByText('10.5k')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('renders in grid layout by default', () => {
    renderWithQueryClient(<TrendingFeed />);

    const feedContainer = screen.getByClassName('posts-grid');
    expect(feedContainer).toHaveClass('layout-grid');
  });

  it('shows featured post when featured prop is true', () => {
    renderWithQueryClient(<TrendingFeed featured={true} />);

    expect(screen.getByText('⚡ FEATURED')).toBeInTheDocument();
  });

  it('uses centralized LoadingSpinner component', () => {
    mockUsePosts.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    renderWithQueryClient(<TrendingFeed />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('role', 'status');
  });
});
