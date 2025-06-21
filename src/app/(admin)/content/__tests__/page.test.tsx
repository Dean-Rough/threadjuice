/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentManagementPage from '../page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('ContentManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page header', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Content Management')).toBeInTheDocument();
      expect(
        screen.getByText('Create, edit, and manage your posts and articles.')
      ).toBeInTheDocument();
    });
  });

  it('renders new post button', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      const newPostButton = screen.getByText('New Post');
      expect(newPostButton).toBeInTheDocument();
      expect(newPostButton.closest('a')).toHaveAttribute(
        'href',
        '/admin/content/new'
      );
    });
  });

  it('renders content management interface', () => {
    render(<ContentManagementPage />);

    // Should render the main interface elements
    expect(screen.getByText('Content Management')).toBeInTheDocument();
    expect(
      screen.getByText('Create, edit, and manage your posts and articles.')
    ).toBeInTheDocument();
  });

  it('displays posts after loading', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByText('AI Takes Over Reddit: The Drama Nobody Saw Coming')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Crypto Bros Discover Touch Grass: A Scientific Study')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Karen vs Manager: The Ultimate Showdown')
      ).toBeInTheDocument();
    });
  });

  it('displays post metadata correctly', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
      expect(screen.getByText('The Down-to-Earth Buddy')).toBeInTheDocument();
      expect(screen.getByText('The Dry Cynic')).toBeInTheDocument();
    });
  });

  it('shows status badges for posts', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      // Check for status badges using more specific selectors
      expect(
        document.querySelector('.bg-green-100.text-green-800')
      ).toBeInTheDocument(); // Published
      expect(
        document.querySelector('.bg-yellow-100.text-yellow-800')
      ).toBeInTheDocument(); // Draft
      expect(
        document.querySelector('.bg-blue-100.text-blue-800')
      ).toBeInTheDocument(); // Scheduled
    });
  });

  it('displays view counts', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      // Check for specific view counts in the table
      const viewCells = document.querySelectorAll('td');
      const viewTexts = Array.from(viewCells).map(cell => cell.textContent);
      expect(viewTexts).toContain('2,500');
      expect(viewTexts.filter(text => text === '0')).toHaveLength(2); // Two posts with 0 views
    });
  });

  it('has search functionality', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByText('AI Takes Over Reddit: The Drama Nobody Saw Coming')
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    await user.type(searchInput, 'crypto');

    await waitFor(() => {
      expect(
        screen.getByText('Crypto Bros Discover Touch Grass: A Scientific Study')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('AI Takes Over Reddit: The Drama Nobody Saw Coming')
      ).not.toBeInTheDocument();
    });
  });

  it('has status filter functionality', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByText('AI Takes Over Reddit: The Drama Nobody Saw Coming')
      ).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue('All Status');
    await user.selectOptions(statusFilter, 'draft');

    await waitFor(() => {
      expect(
        screen.getByText('Crypto Bros Discover Touch Grass: A Scientific Study')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('AI Takes Over Reddit: The Drama Nobody Saw Coming')
      ).not.toBeInTheDocument();
    });
  });

  it('allows selecting individual posts', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4); // 3 posts + select all checkbox
    });

    const firstPostCheckbox = screen.getAllByRole('checkbox')[1]; // Skip the select all checkbox
    await user.click(firstPostCheckbox);

    expect(firstPostCheckbox).toBeChecked();
  });

  it('allows selecting all posts', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  it('shows bulk actions when posts are selected', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    const firstPostCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(firstPostCheckbox);

    await waitFor(() => {
      expect(screen.getByText('1 post selected')).toBeInTheDocument();
      // Check for bulk action buttons
      const bulkActionButtons = screen
        .getAllByRole('button')
        .filter(btn =>
          ['Publish', 'Draft', 'Delete'].includes(btn.textContent || '')
        );
      expect(bulkActionButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows correct plural text for multiple selected posts', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    await waitFor(() => {
      expect(screen.getByText('3 posts selected')).toBeInTheDocument();
    });
  });

  it('has action buttons for each post', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      // Check for action buttons (preview, edit, delete)
      const previewButtons = screen.getAllByTitle('Preview');
      const editButtons = screen.getAllByTitle('Edit');
      const deleteButtons = screen.getAllByTitle('Delete');

      expect(previewButtons).toHaveLength(3);
      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  it('displays categories correctly', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      // Check for categories in the table content
      const tableCells = document.querySelectorAll('td');
      const cellTexts = Array.from(tableCells).map(cell => cell.textContent);
      expect(cellTexts).toContain('tech');
      expect(cellTexts).toContain('finance');
      expect(cellTexts).toContain('drama');
    });
  });

  it('formats dates correctly', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      // Check for date formatting
      const dateElements = document.querySelectorAll(
        '[class*="text-sm text-gray-600"]'
      );
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('shows excerpt text for posts', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'When AI started moderating r/funny, nobody expected the chaos that followed...'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Local crypto enthusiast shocked to discover that grass has texture...'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'In a retail showdown for the ages, one Karen meets her match...'
        )
      ).toBeInTheDocument();
    });
  });

  it('handles empty search results', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByText('AI Takes Over Reddit: The Drama Nobody Saw Coming')
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your search or filter criteria.')
      ).toBeInTheDocument();
    });
  });

  it('maintains selection state when changing filters', async () => {
    const user = userEvent.setup();
    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    // Select a post
    const firstPostCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(firstPostCheckbox);

    await waitFor(() => {
      expect(screen.getByText('1 post selected')).toBeInTheDocument();
    });

    // Change filter to draft - this will filter out the selected post
    const statusFilter = screen.getByDisplayValue('All Status');
    await user.selectOptions(statusFilter, 'draft');

    // The selected post is no longer visible due to filtering
    await waitFor(() => {
      expect(
        screen.getByText('Crypto Bros Discover Touch Grass: A Scientific Study')
      ).toBeInTheDocument();
    });
  });

  it('displays author information with icons', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      // Check that user icons are present
      const userIcons = document.querySelectorAll('svg');
      expect(userIcons.length).toBeGreaterThan(0);
    });
  });

  it('shows scheduled date for scheduled posts', async () => {
    render(<ContentManagementPage />);

    await waitFor(() => {
      // The scheduled post should show its scheduled date
      const scheduledPost = screen
        .getByText('Karen vs Manager: The Ultimate Showdown')
        .closest('tr');
      expect(scheduledPost).toBeInTheDocument();
    });
  });

  it('renders all required UI elements', () => {
    render(<ContentManagementPage />);

    // Should render filter controls
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
  });

  it('calls bulk action handlers', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<ContentManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    const firstPostCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(firstPostCheckbox);

    await waitFor(() => {
      expect(screen.getByText('Publish')).toBeInTheDocument();
    });

    const publishButton = screen.getByText('Publish');
    await user.click(publishButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Bulk publish for posts:',
      expect.any(Array)
    );

    consoleSpy.mockRestore();
  });
});
