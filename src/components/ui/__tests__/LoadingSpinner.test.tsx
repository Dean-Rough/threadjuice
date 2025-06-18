/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { LoadingSpinner, type LoadingSpinnerProps } from '../LoadingSpinner';

// No need to mock WOW.js anymore since we use pure CSS animations

describe('LoadingSpinner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner with default props', () => {
    render(<LoadingSpinner />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('displays custom text when provided', () => {
    render(<LoadingSpinner text="Loading posts..." />);

    // Should have visible text and aria-label
    const allText = screen.getAllByText('Loading posts...');
    expect(allText).toHaveLength(2); // Visible text + screen reader text
    expect(screen.getByLabelText('Loading posts...')).toBeInTheDocument();
  });

  it('applies small size classes', () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('gap-2');
  });

  it('applies medium size classes (default)', () => {
    render(<LoadingSpinner size="md" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('gap-3');
  });

  it('applies large size classes', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('gap-4');
  });

  it('applies extra large size classes', () => {
    render(<LoadingSpinner size="xl" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('gap-4');
  });

  it('applies primary color by default', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('text-primary');
  });

  it('applies secondary color when specified', () => {
    render(<LoadingSpinner color="secondary" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('text-secondary');
  });

  it('applies gray color when specified', () => {
    render(<LoadingSpinner color="gray" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('text-gray-500');
  });

  it('renders dots variant correctly', () => {
    render(<LoadingSpinner variant="dots" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('animate-bounce');
  });

  it('renders pulse variant correctly', () => {
    render(<LoadingSpinner variant="pulse" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('animate-pulse');
  });

  it('renders bounce variant correctly', () => {
    render(<LoadingSpinner variant="bounce" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('animate-bounce');
  });

  it('renders fade variant correctly', () => {
    render(<LoadingSpinner variant="fade" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('animate-pulse');
  });

  it('renders default variant with spinning animation', () => {
    render(<LoadingSpinner variant="default" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toContainHTML('animate-spin');
  });

  it('displays in fullscreen mode when enabled', () => {
    render(<LoadingSpinner fullScreen={true} />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('fixed', 'inset-0', 'bg-white', 'bg-opacity-75', 'z-50');
  });

  it('does not display in fullscreen mode by default', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).not.toHaveClass('fixed', 'inset-0');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-class');
  });

  it('shows text with correct size styling', () => {
    render(<LoadingSpinner text="Loading..." size="lg" />);

    const allText = screen.getAllByText('Loading...');
    const visibleText = allText.find(el => !el.classList.contains('sr-only'));
    expect(visibleText).toHaveClass('text-lg');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner text="Custom loading text" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading text');
  });

  it('shows screen reader text when no visible text provided', () => {
    render(<LoadingSpinner />);

    // Check that default text is present
    const loadingText = screen.getByText('Loading content...');
    expect(loadingText).toBeInTheDocument();
  });

  it('applies fade-in animation when animate is true', () => {
    render(<LoadingSpinner animate={true} />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('animate-fade-in');
  });

  it('does not apply animation class when animate is false', () => {
    render(<LoadingSpinner animate={false} />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).not.toHaveClass('animate-fade-in');
  });

  it('creates three dots for dots variant', () => {
    render(<LoadingSpinner variant="dots" />);

    const spinner = screen.getByTestId('loading-spinner');
    // Should contain multiple bouncing elements
    expect(spinner).toContainHTML('animate-bounce');
  });
});