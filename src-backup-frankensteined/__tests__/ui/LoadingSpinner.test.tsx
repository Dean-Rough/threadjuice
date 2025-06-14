import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    const hiddenText = screen.getByText('Loading...');
    expect(hiddenText).toHaveClass('sr-only');
  });

  it('should render with custom text', () => {
    const customText = 'Please wait...';
    render(<LoadingSpinner text={customText} />);

    expect(screen.getByText(customText)).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument(); // sr-only text
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size='small' />);
    let container = screen
      .getByRole('status')
      .closest('.sarsa-loading-spinner');
    expect(container).toHaveClass('sarsa-loading-spinner--small');

    rerender(<LoadingSpinner size='large' />);
    container = screen.getByRole('status').closest('.sarsa-loading-spinner');
    expect(container).toHaveClass('sarsa-loading-spinner--large');
  });

  it('should apply correct variant classes', () => {
    const { rerender } = render(<LoadingSpinner variant='dots' />);
    let container = screen
      .getByRole('status')
      .closest('.sarsa-loading-spinner');
    expect(container).toHaveClass('sarsa-loading-spinner--dots');

    rerender(<LoadingSpinner variant='sarsa' />);
    container = screen.getByRole('status').closest('.sarsa-loading-spinner');
    expect(container).toHaveClass('sarsa-loading-spinner--sarsa');
  });

  it('should render dots variant correctly', () => {
    render(<LoadingSpinner variant='dots' />);

    const dotsContainer = screen
      .getByRole('status')
      .querySelector('.sarsa-loading-spinner__dots');
    expect(dotsContainer).toBeInTheDocument();

    const dots = dotsContainer?.querySelectorAll('.sarsa-loading-spinner__dot');
    expect(dots).toHaveLength(3);
    expect(dots?.[0]).toHaveClass('sarsa-loading-spinner__dot--1');
    expect(dots?.[1]).toHaveClass('sarsa-loading-spinner__dot--2');
    expect(dots?.[2]).toHaveClass('sarsa-loading-spinner__dot--3');
  });

  it('should render pulse variant correctly', () => {
    render(<LoadingSpinner variant='pulse' />);

    const pulseContainer = screen
      .getByRole('status')
      .querySelector('.sarsa-loading-spinner__pulse');
    expect(pulseContainer).toBeInTheDocument();

    const rings = pulseContainer?.querySelectorAll(
      '.sarsa-loading-spinner__pulse-ring'
    );
    expect(rings).toHaveLength(3);
    expect(rings?.[0]).toHaveClass('sarsa-loading-spinner__pulse-ring--1');
    expect(rings?.[1]).toHaveClass('sarsa-loading-spinner__pulse-ring--2');
    expect(rings?.[2]).toHaveClass('sarsa-loading-spinner__pulse-ring--3');
  });

  it('should render bars variant correctly', () => {
    render(<LoadingSpinner variant='bars' />);

    const barsContainer = screen
      .getByRole('status')
      .querySelector('.sarsa-loading-spinner__bars');
    expect(barsContainer).toBeInTheDocument();

    const bars = barsContainer?.querySelectorAll('.sarsa-loading-spinner__bar');
    expect(bars).toHaveLength(4);
    expect(bars?.[0]).toHaveClass('sarsa-loading-spinner__bar--1');
    expect(bars?.[1]).toHaveClass('sarsa-loading-spinner__bar--2');
    expect(bars?.[2]).toHaveClass('sarsa-loading-spinner__bar--3');
    expect(bars?.[3]).toHaveClass('sarsa-loading-spinner__bar--4');
  });

  it('should render sarsa variant with logo correctly', () => {
    render(<LoadingSpinner variant='sarsa' />);

    const sarsaContainer = screen
      .getByRole('status')
      .querySelector('.sarsa-loading-spinner__sarsa');
    expect(sarsaContainer).toBeInTheDocument();

    const logo = sarsaContainer?.querySelector('.sarsa-loading-spinner__logo');
    expect(logo).toBeInTheDocument();

    const logoInner = logo?.querySelector('.sarsa-loading-spinner__logo-inner');
    expect(logoInner).toBeInTheDocument();
    expect(logoInner?.querySelector('span:first-child')).toHaveTextContent('T');
    expect(logoInner?.querySelector('span:last-child')).toHaveTextContent('J');

    const wave = sarsaContainer?.querySelector('.sarsa-loading-spinner__wave');
    expect(wave).toBeInTheDocument();

    const waveBars = wave?.querySelectorAll('.sarsa-loading-spinner__wave-bar');
    expect(waveBars).toHaveLength(5);
  });

  it('should render default variant with SVG circle', () => {
    render(<LoadingSpinner variant='default' />);

    const circleContainer = screen
      .getByRole('status')
      .querySelector('.sarsa-loading-spinner__circle');
    expect(circleContainer).toBeInTheDocument();

    const svg = circleContainer?.querySelector('.sarsa-loading-spinner__svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 50 50');

    const circle = svg?.querySelector('.sarsa-loading-spinner__path');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '25');
    expect(circle).toHaveAttribute('cy', '25');
    expect(circle).toHaveAttribute('r', '20');
    expect(circle).toHaveAttribute('fill', 'none');
    expect(circle).toHaveAttribute('stroke', 'currentColor');
  });

  it('should render with WOWAnimation when animated is true', () => {
    render(<LoadingSpinner animated={true} />);

    const wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toBeInTheDocument();
    expect(wowAnimation).toHaveAttribute('data-animation', 'zoomIn');
    expect(wowAnimation).toHaveClass('sarsa-loading-spinner');
  });

  it('should render without WOWAnimation when animated is false', () => {
    render(<LoadingSpinner animated={false} />);

    expect(screen.queryByTestId('wow-animation')).not.toBeInTheDocument();
    expect(
      screen.getByRole('status').closest('.sarsa-loading-spinner')
    ).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner className={customClass} />);

    const container = screen
      .getByRole('status')
      .closest('.sarsa-loading-spinner');
    expect(container).toHaveClass(customClass);
  });

  it('should combine all class modifiers correctly', () => {
    render(
      <LoadingSpinner size='large' variant='pulse' className='custom-class' />
    );

    const container = screen
      .getByRole('status')
      .closest('.sarsa-loading-spinner');
    expect(container).toHaveClass(
      'sarsa-loading-spinner',
      'sarsa-loading-spinner--large',
      'sarsa-loading-spinner--pulse',
      'custom-class'
    );
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner text='Loading content...' />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');

    const srText = screen.getByText('Loading...');
    expect(srText).toHaveClass('sr-only');

    const visibleText = screen.getByText('Loading content...');
    expect(visibleText).not.toHaveClass('sr-only');
  });
});
