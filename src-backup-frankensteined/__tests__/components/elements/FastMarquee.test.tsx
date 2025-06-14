import { render, screen } from '@testing-library/react';
import { FastMarquee } from '@/components/elements/FastMarquee';

// Mock react-fast-marquee
jest.mock('react-fast-marquee', () => {
  return function MockMarquee({
    children,
    direction,
    speed,
    delay,
    loop,
    gradient,
    gradientColor,
    gradientWidth,
    pauseOnHover,
    pauseOnClick,
    style,
  }: any) {
    return (
      <div
        data-testid='marquee-mock'
        data-direction={direction}
        data-speed={speed}
        data-delay={delay}
        data-loop={loop}
        data-gradient={gradient}
        data-gradient-color={gradientColor}
        data-gradient-width={gradientWidth}
        data-pause-on-hover={pauseOnHover}
        data-pause-on-click={pauseOnClick}
        style={style}
      >
        {children}
      </div>
    );
  };
});

describe('FastMarquee', () => {
  it('renders children correctly', () => {
    render(
      <FastMarquee>
        <span>Scrolling text content</span>
      </FastMarquee>
    );

    expect(screen.getByText('Scrolling text content')).toBeInTheDocument();
    expect(screen.getByTestId('marquee-mock')).toBeInTheDocument();
  });

  it('applies default props', () => {
    render(
      <FastMarquee>
        <span>Default props test</span>
      </FastMarquee>
    );

    const marquee = screen.getByTestId('marquee-mock');
    expect(marquee).toHaveAttribute('data-direction', 'left');
    expect(marquee).toHaveAttribute('data-speed', '50');
    expect(marquee).toHaveAttribute('data-delay', '0');
    expect(marquee).toHaveAttribute('data-loop', '0');
    expect(marquee).toHaveAttribute('data-gradient', 'true');
    expect(marquee).toHaveAttribute('data-gradient-color', 'white');
    expect(marquee).toHaveAttribute('data-gradient-width', '200');
    expect(marquee).toHaveAttribute('data-pause-on-hover', 'false');
    expect(marquee).toHaveAttribute('data-pause-on-click', 'false');
  });

  it('applies custom props', () => {
    render(
      <FastMarquee
        direction='right'
        speed={100}
        delay={5}
        loop={3}
        gradient={false}
        gradientColor='blue'
        gradientWidth={150}
        pauseOnHover={true}
        pauseOnClick={true}
      >
        <span>Custom props test</span>
      </FastMarquee>
    );

    const marquee = screen.getByTestId('marquee-mock');
    expect(marquee).toHaveAttribute('data-direction', 'right');
    expect(marquee).toHaveAttribute('data-speed', '100');
    expect(marquee).toHaveAttribute('data-delay', '5');
    expect(marquee).toHaveAttribute('data-loop', '3');
    expect(marquee).toHaveAttribute('data-gradient', 'false');
    expect(marquee).toHaveAttribute('data-gradient-color', 'blue');
    expect(marquee).toHaveAttribute('data-gradient-width', '150');
    expect(marquee).toHaveAttribute('data-pause-on-hover', 'true');
    expect(marquee).toHaveAttribute('data-pause-on-click', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FastMarquee className='custom-marquee'>
        <span>Class test</span>
      </FastMarquee>
    );

    const wrapper = container.querySelector('.fast-marquee');
    expect(wrapper).toHaveClass('fast-marquee', 'custom-marquee');
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red', height: '50px' };

    render(
      <FastMarquee style={customStyle}>
        <span>Style test</span>
      </FastMarquee>
    );

    const marquee = screen.getByTestId('marquee-mock');
    expect(marquee).toHaveStyle('background-color: red');
    expect(marquee).toHaveStyle('height: 50px');
  });

  it('supports different directions', () => {
    const directions = ['left', 'right', 'up', 'down'] as const;

    directions.forEach(direction => {
      const { rerender } = render(
        <FastMarquee direction={direction}>
          <span>{direction} direction</span>
        </FastMarquee>
      );

      const marquee = screen.getByTestId('marquee-mock');
      expect(marquee).toHaveAttribute('data-direction', direction);

      rerender(<div />); // Clear for next iteration
    });
  });

  it('handles multiple children', () => {
    render(
      <FastMarquee>
        <span>First item</span>
        <span>Second item</span>
        <div>Third item</div>
      </FastMarquee>
    );

    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(screen.getByText('Third item')).toBeInTheDocument();
  });
});
