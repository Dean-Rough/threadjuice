/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextEditor } from '../RichTextEditor';

// Mock execCommand since it's not available in jsdom
Object.defineProperty(document, 'execCommand', {
  value: jest.fn(),
  writable: true,
});

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  value: jest.fn(() => ({
    toString: () => '', // No selected text
  })),
  writable: true,
});

describe('RichTextEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders editor with placeholder', () => {
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
        placeholder="Start writing..."
      />
    );

    // Check that the editor is rendered with contenteditable
    const editor = document.querySelector('[contenteditable]');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('data-placeholder', 'Start writing...');
  });

  it('renders with initial content', () => {
    const initialContent = '<p>Hello world</p>';
    render(
      <RichTextEditor
        value={initialContent}
        onChange={mockOnChange}
      />
    );

    // The content is set via dangerouslySetInnerHTML
    const editor = document.querySelector('[contenteditable]');
    expect(editor?.innerHTML).toBe(initialContent);
  });

  it('renders all formatting toolbar buttons', () => {
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    // Test for key formatting buttons
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Underline')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 3')).toBeInTheDocument();
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
    expect(screen.getByTitle('Numbered List')).toBeInTheDocument();
    expect(screen.getByTitle('Insert Link')).toBeInTheDocument();
    expect(screen.getByTitle('Insert Image')).toBeInTheDocument();
    expect(screen.getByTitle('Undo')).toBeInTheDocument();
    expect(screen.getByTitle('Redo')).toBeInTheDocument();
  });

  it('calls onChange when content is modified', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const editor = document.querySelector('[contenteditable]') as HTMLElement;
    expect(editor).toBeInTheDocument();

    // Simulate typing in the editor
    await user.click(editor);
    
    // Simulate input event
    editor.innerHTML = '<p>Test content</p>';
    fireEvent.input(editor);

    expect(mockOnChange).toHaveBeenCalledWith('<p>Test content</p>');
  });

  it('executes bold command when bold button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const boldButton = screen.getByTitle('Bold');
    await user.click(boldButton);

    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
  });

  it('executes italic command when italic button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const italicButton = screen.getByTitle('Italic');
    await user.click(italicButton);

    expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);
  });

  it('opens link modal when link button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const linkButton = screen.getByTitle('Insert Link');
    await user.click(linkButton);

    expect(screen.getByRole('heading', { name: 'Insert Link' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Link text')).toBeInTheDocument();
  });

  it('closes link modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const linkButton = screen.getByTitle('Insert Link');
    await user.click(linkButton);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(screen.queryByRole('heading', { name: 'Insert Link' })).not.toBeInTheDocument();
  });

  it('inserts link when valid URL is provided', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const linkButton = screen.getByTitle('Insert Link');
    await user.click(linkButton);

    const urlInput = screen.getByPlaceholderText('https://example.com');
    const linkTextInput = screen.getByPlaceholderText('Link text');
    
    await user.type(urlInput, 'https://example.com');
    await user.type(linkTextInput, 'Example Link');

    // Get the insert button within the modal (not the toolbar button)
    const insertButtons = screen.getAllByRole('button', { name: 'Insert Link' });
    const modalInsertButton = insertButtons[1]; // Second one is in the modal
    await user.click(modalInsertButton);

    // Should call createLink when linkText is provided (as it becomes selectedText)
    expect(document.execCommand).toHaveBeenCalledWith(
      'createLink', 
      false, 
      'https://example.com'
    );
  });

  it('disables insert button when URL is empty', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const linkButton = screen.getByTitle('Insert Link');
    await user.click(linkButton);

    // Get the insert button within the modal (not the toolbar button)
    const insertButtons = screen.getAllByRole('button', { name: 'Insert Link' });
    const modalInsertButton = insertButtons[1]; // Second one is in the modal
    expect(modalInsertButton).toBeDisabled();
  });

  it('prompts for image URL when image button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock window.prompt
    const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('https://example.com/image.jpg');
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const imageButton = screen.getByTitle('Insert Image');
    await user.click(imageButton);

    expect(mockPrompt).toHaveBeenCalledWith('Enter image URL:');
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertHTML',
      false,
      '<img src="https://example.com/image.jpg" alt="Inserted image" style="max-width: 100%; height: auto;" />'
    );

    mockPrompt.mockRestore();
  });

  it('applies heading format when heading buttons are clicked', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const h1Button = screen.getByTitle('Heading 1');
    await user.click(h1Button);

    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h1');
  });

  it('applies list format when list buttons are clicked', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const bulletListButton = screen.getByTitle('Bullet List');
    await user.click(bulletListButton);

    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);

    const numberedListButton = screen.getByTitle('Numbered List');
    await user.click(numberedListButton);

    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false, undefined);
  });

  it('applies text alignment when alignment buttons are clicked', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const alignLeftButton = screen.getByTitle('Align Left');
    await user.click(alignLeftButton);

    expect(document.execCommand).toHaveBeenCalledWith('justifyLeft', false, undefined);

    const alignCenterButton = screen.getByTitle('Align Center');
    await user.click(alignCenterButton);

    expect(document.execCommand).toHaveBeenCalledWith('justifyCenter', false, undefined);
  });

  it('calls onChange on blur event', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value="<p>Initial content</p>"
        onChange={mockOnChange}
      />
    );

    const editor = document.querySelector('[contenteditable]') as HTMLElement;
    
    await user.click(editor);
    editor.innerHTML = '<p>Modified content</p>';
    fireEvent.blur(editor);

    expect(mockOnChange).toHaveBeenCalledWith('<p>Modified content</p>');
  });

  it('applies custom className', () => {
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
        className="custom-editor"
      />
    );

    const editor = document.querySelector('.rich-text-editor');
    expect(editor).toHaveClass('custom-editor');
  });

  it('applies custom min height', () => {
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
        minHeight="400px"
      />
    );

    const editorContent = document.querySelector('[contenteditable]') as HTMLElement;
    expect(editorContent.style.minHeight).toBe('400px');
  });

  it('executes undo and redo commands', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const undoButton = screen.getByTitle('Undo');
    await user.click(undoButton);
    expect(document.execCommand).toHaveBeenCalledWith('undo', false, undefined);

    const redoButton = screen.getByTitle('Redo');
    await user.click(redoButton);
    expect(document.execCommand).toHaveBeenCalledWith('redo', false, undefined);
  });

  it('handles quote formatting', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const quoteButton = screen.getByTitle('Quote');
    await user.click(quoteButton);

    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'blockquote');
  });

  it('handles code block formatting', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const codeButton = screen.getByTitle('Code Block');
    await user.click(codeButton);

    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'pre');
  });
});