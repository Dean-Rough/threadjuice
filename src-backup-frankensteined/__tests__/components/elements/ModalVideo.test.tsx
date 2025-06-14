import { render, screen, fireEvent } from '@testing-library/react';
import { ModalVideoComponent } from '@/components/elements/ModalVideo';

// Mock react-modal-video
jest.mock('react-modal-video', () => {
  return function MockModalVideo({ isOpen, onClose, channel, videoId }: any) {
    if (!isOpen) return null;

    return (
      <div
        data-testid='modal-video'
        data-channel={channel}
        data-video-id={videoId}
      >
        <button onClick={onClose} data-testid='close-modal'>
          Close
        </button>
        Mock Modal Video
      </div>
    );
  };
});

// Mock CSS import
jest.mock('react-modal-video/css/modal-video.css', () => ({}));

describe('ModalVideoComponent', () => {
  it('renders trigger element with children', () => {
    render(
      <ModalVideoComponent channel='youtube' videoId='test123'>
        <button>Play Video</button>
      </ModalVideoComponent>
    );

    expect(
      screen.getByRole('button', { name: 'Play Video' })
    ).toBeInTheDocument();
  });

  it('opens modal when trigger is clicked', () => {
    render(
      <ModalVideoComponent channel='youtube' videoId='test123'>
        <span>Click me</span>
      </ModalVideoComponent>
    );

    const trigger = screen.getByText('Click me');
    fireEvent.click(trigger);

    expect(screen.getByTestId('modal-video')).toBeInTheDocument();
    expect(screen.getByTestId('modal-video')).toHaveAttribute(
      'data-channel',
      'youtube'
    );
    expect(screen.getByTestId('modal-video')).toHaveAttribute(
      'data-video-id',
      'test123'
    );
  });

  it('opens modal when trigger is activated with Enter key', () => {
    render(
      <ModalVideoComponent channel='vimeo' videoId='456789'>
        <div>Press Enter</div>
      </ModalVideoComponent>
    );

    const trigger = screen.getByText('Press Enter').parentElement;
    fireEvent.keyDown(trigger!, { key: 'Enter' });

    expect(screen.getByTestId('modal-video')).toBeInTheDocument();
    expect(screen.getByTestId('modal-video')).toHaveAttribute(
      'data-channel',
      'vimeo'
    );
  });

  it('opens modal when trigger is activated with Space key', () => {
    render(
      <ModalVideoComponent channel='custom' videoId='custom123'>
        <div>Press Space</div>
      </ModalVideoComponent>
    );

    const trigger = screen.getByText('Press Space').parentElement;
    fireEvent.keyDown(trigger!, { key: ' ' });

    expect(screen.getByTestId('modal-video')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(
      <ModalVideoComponent channel='youtube' videoId='test123'>
        <button>Open</button>
      </ModalVideoComponent>
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByTestId('modal-video')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('modal-video')).not.toBeInTheDocument();
  });

  it('applies custom className to trigger', () => {
    render(
      <ModalVideoComponent
        channel='youtube'
        videoId='test123'
        className='custom-trigger'
      >
        <span>Trigger</span>
      </ModalVideoComponent>
    );

    const trigger = screen.getByText('Trigger').parentElement;
    expect(trigger).toHaveClass('modal-video-trigger', 'custom-trigger');
  });

  it('has proper accessibility attributes', () => {
    render(
      <ModalVideoComponent channel='youtube' videoId='test123'>
        <span>Video Trigger</span>
      </ModalVideoComponent>
    );

    const trigger = screen.getByText('Video Trigger').parentElement;
    expect(trigger).toHaveAttribute('role', 'button');
    expect(trigger).toHaveAttribute('tabIndex', '0');
  });

  it('supports different video channels', () => {
    const { rerender } = render(
      <ModalVideoComponent channel='youtube' videoId='yt123'>
        <button>YouTube</button>
      </ModalVideoComponent>
    );

    fireEvent.click(screen.getByRole('button', { name: 'YouTube' }));
    expect(screen.getByTestId('modal-video')).toHaveAttribute(
      'data-channel',
      'youtube'
    );

    rerender(
      <ModalVideoComponent channel='vimeo' videoId='vm456'>
        <button>Vimeo</button>
      </ModalVideoComponent>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Vimeo' }));
    expect(screen.getByTestId('modal-video')).toHaveAttribute(
      'data-channel',
      'vimeo'
    );
  });
});
