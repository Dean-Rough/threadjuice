'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Quote,
  Image,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

interface ToolbarButton {
  icon: React.ComponentType<any>;
  command: string;
  title: string;
  value?: string;
  action?: () => void;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  className = '',
  minHeight = '300px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange]
  );

  const formatText = (command: string, value?: string) => {
    execCommand(command, value);
  };

  const insertLink = () => {
    if (linkUrl) {
      const selectedText = window.getSelection()?.toString() || linkText;
      if (selectedText) {
        execCommand('createLink', linkUrl);
      } else {
        const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
        execCommand('insertHTML', linkHtml);
      }
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const imageHtml = `<img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto;" />`;
      execCommand('insertHTML', imageHtml);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toolbarButtons = [
    {
      group: 'format',
      buttons: [
        { icon: Bold, command: 'bold', title: 'Bold' },
        { icon: Italic, command: 'italic', title: 'Italic' },
        { icon: Underline, command: 'underline', title: 'Underline' },
      ],
    },
    {
      group: 'headings',
      buttons: [
        {
          icon: Heading1,
          command: 'formatBlock',
          value: 'h1',
          title: 'Heading 1',
        },
        {
          icon: Heading2,
          command: 'formatBlock',
          value: 'h2',
          title: 'Heading 2',
        },
        {
          icon: Heading3,
          command: 'formatBlock',
          value: 'h3',
          title: 'Heading 3',
        },
        { icon: Type, command: 'formatBlock', value: 'p', title: 'Paragraph' },
      ],
    },
    {
      group: 'lists',
      buttons: [
        { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
        {
          icon: ListOrdered,
          command: 'insertOrderedList',
          title: 'Numbered List',
        },
        {
          icon: Quote,
          command: 'formatBlock',
          value: 'blockquote',
          title: 'Quote',
        },
      ],
    },
    {
      group: 'align',
      buttons: [
        { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
      ],
    },
    {
      group: 'media',
      buttons: [
        {
          icon: Link,
          command: 'custom',
          action: () => setIsLinkModalOpen(true),
          title: 'Insert Link',
        },
        {
          icon: Image,
          command: 'custom',
          action: insertImage,
          title: 'Insert Image',
        },
        {
          icon: Code,
          command: 'formatBlock',
          value: 'pre',
          title: 'Code Block',
        },
      ],
    },
    {
      group: 'history',
      buttons: [
        { icon: Undo, command: 'undo', title: 'Undo' },
        { icon: Redo, command: 'redo', title: 'Redo' },
      ],
    },
  ];

  return (
    <div
      className={`rich-text-editor rounded-lg border border-gray-300 ${className}`}
    >
      {/* Toolbar */}
      <div className='rounded-t-lg border-b border-gray-200 bg-gray-50 p-3'>
        <div className='flex flex-wrap gap-1'>
          {toolbarButtons.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className='mr-2 flex border-r border-gray-300 pr-2 last:border-r-0'
            >
              {group.buttons.map((button, buttonIndex) => (
                <button
                  key={buttonIndex}
                  type='button'
                  onClick={() => {
                    const typedButton = button as ToolbarButton;
                    if (typedButton.action) {
                      typedButton.action();
                    } else {
                      formatText(typedButton.command, typedButton.value);
                    }
                  }}
                  className='rounded p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900'
                  title={button.title}
                >
                  <button.icon className='h-4 w-4' />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onBlur={handleContentChange}
        className='prose prose-gray max-w-none p-4 outline-none'
        style={{ minHeight }}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-96 rounded-lg bg-white p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Insert Link</h3>
            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Link URL *
                </label>
                <input
                  type='url'
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder='https://example.com'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Link Text (optional)
                </label>
                <input
                  type='text'
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  placeholder='Link text'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
              </div>
            </div>
            <div className='mt-6 flex justify-end space-x-3'>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className='rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl}
                className='rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Styles */}
      <style jsx>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }

        .rich-text-editor .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .rich-text-editor .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .rich-text-editor .prose h3 {
          font-size: 1.2em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .rich-text-editor .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .rich-text-editor .prose pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }

        .rich-text-editor .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .rich-text-editor .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }

        .rich-text-editor .prose a {
          color: #ea580c;
          text-decoration: underline;
        }

        .rich-text-editor .prose a:hover {
          color: #c2410c;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
