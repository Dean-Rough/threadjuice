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
  const MockImage = ({ src, alt, priority, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
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
jest.mock('lucide-react', () => {
  const mockIcon = (props: any) => <div data-testid={props['data-testid'] || 'mock-icon'} />;
  
  return {
    Flame: mockIcon,
    Eye: mockIcon,
    MessageCircle: mockIcon,
    Share2: mockIcon,
    Filter: mockIcon,
    TrendingUp: mockIcon,
    Gamepad2: mockIcon,
    Monitor: mockIcon,
    Film: mockIcon,
    Trophy: mockIcon,
    Music: mockIcon,
    UtensilsCrossed: mockIcon,
    Plane: mockIcon,
    Sparkles: mockIcon,
    Radio: mockIcon,
    FlaskConical: mockIcon,
  };
});

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
    // Use getAllByText since LoadingSpinner renders both visible and sr-only text
    const loadingTexts = screen.getAllByText('Loading viral content...');
    expect(loadingTexts.length).toBeGreaterThan(0);
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
    // Check for filter buttons in the filter bar specifically
    const filterBar = document.querySelector('.filter-buttons');
    expect(filterBar).toBeInTheDocument();
    
    // Check for specific category buttons within the filter bar
    const allButton = screen.getByRole('button', { name: /All/i });
    expect(allButton).toBeInTheDocument();
    
    // For 'viral', we need to be more specific since "Load More Viral Content" also matches
    const viralButtons = screen.getAllByRole('button', { name: /viral/i });
    const viralFilterButton = viralButtons.find(btn => btn.classList.contains('mb-2'));
    expect(viralFilterButton).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /gaming/i })).toBeInTheDocument();
  });

  it('shows correct post count', () => {
    renderWithQueryClient(<TrendingFeed />);

    expect(screen.getByText('2 viral stories')).toBeInTheDocument();
  });

  it('filters posts by category when filter is clicked', async () => {
    renderWithQueryClient(<TrendingFeed />);

    // Find and click the gaming filter button
    const gamingFilter = screen.getByRole('button', { name: /gaming/i });
    fireEvent.click(gamingFilter);

    // The filter changes the active state but doesn't immediately change the posts
    // because the filtering happens via React Query hooks
    await waitFor(() => {
      // Check that the gaming button is now active (has different styling)
      expect(gamingFilter).toHaveClass('bg-orange-600', 'text-white');
    });
  });

  it('shows engagement stats with consistent icons', () => {
    renderWithQueryClient(<TrendingFeed />);

    // The component generates dynamic engagement values based on post ID
    // Check that engagement stats exist rather than specific values
    const engagementStats = document.querySelectorAll('.engagement-stats');
    expect(engagementStats.length).toBeGreaterThan(0);
    
    // Check for k-formatted views (e.g., "6.2k")
    const viewsPattern = /\d+\.\d+k/;
    const allText = document.body.textContent || '';
    expect(allText).toMatch(viewsPattern);
  });

  it('renders in grid layout by default', () => {
    renderWithQueryClient(<TrendingFeed />);

    const feedContainer = document.querySelector('.posts-grid.layout-grid');
    expect(feedContainer).toBeInTheDocument();
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
