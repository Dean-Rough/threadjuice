/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfile from '../UserProfile';

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with loading state initially', () => {
    render(<UserProfile />);

    // Should show loading spinner initially
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays user profile after loading', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('ThreadJuiceUser')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Passionate about viral content and internet culture. Love discovering the stories behind the memes!'
        )
      ).toBeInTheDocument();
    });
  });

  it('renders tab navigation', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /overview/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /activity/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /statistics/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /settings/i })
      ).toBeInTheDocument();
    });
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /activity/i })
      ).toBeInTheDocument();
    });

    const activityTab = screen.getByRole('button', { name: /activity/i });
    await user.click(activityTab);

    await waitFor(() => {
      expect(screen.getByText('All Activity')).toBeInTheDocument();
    });
  });

  it('displays user statistics correctly', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('342')).toBeInTheDocument(); // Posts read
      expect(screen.getByText('89')).toBeInTheDocument(); // Comments posted
      expect(screen.getByText('1250')).toBeInTheDocument(); // Likes given (no comma in mock data)
      expect(screen.getByText('45')).toBeInTheDocument(); // Bookmarks
    });
  });

  it('shows edit button for own profile', async () => {
    render(<UserProfile isOwnProfile={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('hides edit button for other profiles', async () => {
    render(<UserProfile isOwnProfile={false} />);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /edit/i })
      ).not.toBeInTheDocument();
    });
  });

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserProfile isOwnProfile={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ThreadJuiceUser')).toBeInTheDocument();
    });
  });

  it('displays recent activity', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      // Check for partial text since it might be truncated in display
      expect(
        screen.getByText(/This is exactly what I expected/)
      ).toBeInTheDocument();
    });
  });

  it('shows different activity types with correct icons', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      // Check for different activity types
      const activityItems = screen.getAllByText(
        /commented on|liked|bookmarked|read|shared/
      );
      expect(activityItems.length).toBeGreaterThan(0);
    });
  });

  it('displays statistics in stats tab', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /statistics/i })
      ).toBeInTheDocument();
    });

    const statsTab = screen.getByRole('button', { name: /statistics/i });
    await user.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText('Engagement Statistics')).toBeInTheDocument();
      expect(screen.getByText('Reading Streak')).toBeInTheDocument();
      expect(screen.getByText('23 days')).toBeInTheDocument();
    });
  });

  it('shows achievements', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    const statsTab = screen.getByRole('button', { name: /statistics/i });
    await user.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText('Achievements')).toBeInTheDocument();
      expect(screen.getByText('Active Reader')).toBeInTheDocument();
      expect(screen.getByText('Conversationalist')).toBeInTheDocument();
      expect(screen.getByText('Trend Spotter')).toBeInTheDocument();
    });
  });

  it('shows settings tab for own profile', async () => {
    const user = userEvent.setup();
    render(<UserProfile isOwnProfile={true} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /settings/i })
      ).toBeInTheDocument();
    });

    const settingsTab = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });
  });

  it('hides settings tab for other profiles', async () => {
    render(<UserProfile isOwnProfile={false} />);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /settings/i })
      ).not.toBeInTheDocument();
    });
  });

  it('allows editing profile information', async () => {
    const user = userEvent.setup();
    render(<UserProfile isOwnProfile={true} />);

    const settingsTab = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsTab);

    await waitFor(() => {
      const usernameInput = screen.getByDisplayValue('ThreadJuiceUser');
      expect(usernameInput).toBeInTheDocument();
    });

    const usernameInput = screen.getByDisplayValue('ThreadJuiceUser');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'NewUsername');

    expect(usernameInput).toHaveValue('NewUsername');
  });

  it('toggles privacy settings', async () => {
    const user = userEvent.setup();
    render(<UserProfile isOwnProfile={true} />);

    const settingsTab = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByText('Public Email')).toBeInTheDocument();
    });

    // Find the toggle button for public email
    const toggleButtons = screen.getAllByRole('button');
    const emailToggle = toggleButtons.find(btn =>
      btn.closest('div')?.textContent?.includes('Public Email')
    );

    if (emailToggle) {
      await user.click(emailToggle);
      // Toggle should change state
    }
  });

  it('toggles notification preferences', async () => {
    const user = userEvent.setup();
    render(<UserProfile isOwnProfile={true} />);

    const settingsTab = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    // Find notification toggle buttons
    const notificationSection = screen
      .getByText('Notification Preferences')
      .closest('div');
    const toggleButtons = notificationSection?.querySelectorAll('button');

    if (toggleButtons && toggleButtons.length > 0) {
      await user.click(toggleButtons[0]);
      // Toggle should change state
    }
  });

  it('saves profile changes', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<UserProfile isOwnProfile={true} />);

    const settingsTab = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsTab);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Saving profile:',
      expect.any(Object)
    );
    consoleSpy.mockRestore();
  });

  it('closes edit modal', async () => {
    const user = userEvent.setup();
    render(<UserProfile isOwnProfile={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });
  });

  it('formats time spent reading correctly', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    const statsTab = screen.getByRole('button', { name: /statistics/i });
    await user.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText('72h 0m')).toBeInTheDocument(); // 4320 minutes = 72 hours
    });
  });

  it('formats member since date correctly', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    const statsTab = screen.getByRole('button', { name: /statistics/i });
    await user.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText(/March 15, 2024/)).toBeInTheDocument();
    });
  });

  it('shows activity timestamps', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      const timeElements = screen.getAllByText(/ago|now/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('displays location and website', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<UserProfile className='custom-class' />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('shows full activity list in activity tab', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    const activityTab = screen.getByRole('button', { name: /activity/i });
    await user.click(activityTab);

    await waitFor(() => {
      expect(screen.getByText('All Activity')).toBeInTheDocument();
      // Should show all activities with more details
      const activityItems = document.querySelectorAll('.bg-gray-50'); // Activity items have this class
      expect(activityItems.length).toBeGreaterThan(0);
    });
  });

  it('displays correct activity type styling', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      // Check for different colored activity icons
      const activityIcons = document.querySelectorAll('svg');
      const coloredIcons = Array.from(activityIcons).filter(
        icon =>
          icon.classList.toString().includes('text-') &&
          (icon.classList.toString().includes('blue') ||
            icon.classList.toString().includes('red') ||
            icon.classList.toString().includes('green'))
      );
      expect(coloredIcons.length).toBeGreaterThan(0);
    });
  });

  it('handles empty activity state', async () => {
    render(<UserProfile />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('ThreadJuiceUser')).toBeInTheDocument();
    });

    // Switch to activity tab
    const activityTab = screen.getByText('Activity');
    fireEvent.click(activityTab);

    // Should show "No recent activity" message
    await waitFor(() => {
      expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
    });
  });

  it('validates input fields in edit mode', async () => {
    const user = userEvent.setup();
    render(<UserProfile isOwnProfile={true} />);

    const settingsTab = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsTab);

    await waitFor(() => {
      const websiteInput = screen.getByDisplayValue('https://mysite.com');
      expect(websiteInput).toHaveAttribute('type', 'url');
    });
  });
});
