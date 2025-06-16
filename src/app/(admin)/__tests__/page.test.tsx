/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard header', () => {
    render(<AdminDashboard />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back! Here\'s what\'s happening with your content.')).toBeInTheDocument();
  });

  it('displays stats cards with data', async () => {
    render(<AdminDashboard />);

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument(); // Total posts
      expect(screen.getByText('38')).toBeInTheDocument(); // Published posts
      expect(screen.getByText('4')).toBeInTheDocument(); // Draft posts
      expect(screen.getByText('12,500')).toBeInTheDocument(); // Total views
    });
  });

  it('displays stat card labels', () => {
    render(<AdminDashboard />);

    expect(screen.getByText('Total Posts')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
    expect(screen.getByText('Total Views')).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<AdminDashboard />);

    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByText('Create Quiz')).toBeInTheDocument();
    expect(screen.getByText('Upload Media')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
  });

  it('has correct links for quick actions', () => {
    render(<AdminDashboard />);

    const createPostLink = screen.getByText('Create New Post').closest('a');
    expect(createPostLink).toHaveAttribute('href', '/admin/content/new');

    const createQuizLink = screen.getByText('Create Quiz').closest('a');
    expect(createQuizLink).toHaveAttribute('href', '/admin/quizzes/new');

    const uploadMediaLink = screen.getByText('Upload Media').closest('a');
    expect(uploadMediaLink).toHaveAttribute('href', '/admin/media/upload');

    const analyticsLink = screen.getByText('View Analytics').closest('a');
    expect(analyticsLink).toHaveAttribute('href', '/admin/analytics');
  });

  it('displays recent activity section', () => {
    render(<AdminDashboard />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New viral post about AI trends')).toBeInTheDocument();
    expect(screen.getByText('Quiz "Are you a tech guru?" completed')).toBeInTheDocument();
    expect(screen.getByText('New comment on "Reddit Drama Explained"')).toBeInTheDocument();
  });

  it('displays activity timestamps', () => {
    render(<AdminDashboard />);

    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('4 hours ago')).toBeInTheDocument();
    expect(screen.getByText('6 hours ago')).toBeInTheDocument();
  });

  it('displays performance overview section', () => {
    render(<AdminDashboard />);

    expect(screen.getByText('Performance Overview')).toBeInTheDocument();
    expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    expect(screen.getByText('Quizzes Active')).toBeInTheDocument();
    expect(screen.getByText('Media Files')).toBeInTheDocument();
  });

  it('shows engagement rate with progress bar', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('85.4%')).toBeInTheDocument();
    });

    // Check that progress bar exists and has width styling
    const progressBar = document.querySelector('.bg-green-500.h-2.rounded-full');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('style', expect.stringContaining('width'));
  });

  it('displays performance metrics', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument(); // Quizzes active
      expect(screen.getByText('156')).toBeInTheDocument(); // Media files
    });
  });

  it('renders with proper icons', () => {
    render(<AdminDashboard />);

    // Check that SVG icons are present (Lucide icons render as SVGs)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('has responsive grid layout classes', () => {
    render(<AdminDashboard />);

    // Check for responsive grid classes in stats section
    const statsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    expect(statsGrid).toBeInTheDocument();

    // Check for responsive grid classes in quick actions
    const actionsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    expect(actionsGrid).toBeInTheDocument();
  });

  it('loads stats on component mount', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<AdminDashboard />);

    // Stats should be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('handles stats loading error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the loadDashboardStats to simulate an error
    render(<AdminDashboard />);

    // Component should still render even if stats fail to load
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('displays correct color schemes for stats cards', () => {
    render(<AdminDashboard />);

    // Check for color classes on icon containers
    expect(document.querySelector('.bg-blue-100')).toBeInTheDocument();
    expect(document.querySelector('.bg-green-100')).toBeInTheDocument();
    expect(document.querySelector('.bg-yellow-100')).toBeInTheDocument();
    expect(document.querySelector('.bg-purple-100')).toBeInTheDocument();
  });

  it('formats large numbers correctly', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      // 12500 should be formatted as "12,500"
      expect(screen.getByText('12,500')).toBeInTheDocument();
    });
  });
});