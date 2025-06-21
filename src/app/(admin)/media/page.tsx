'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Search,
  Filter,
  LayoutGrid,
  List,
  Download,
  Trash2,
  Eye,
  Copy,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  File,
  Plus,
  Calendar,
  HardDrive,
} from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  dimensions?: {
    width: number;
    height: number;
  };
  alt?: string;
  caption?: string;
}

export default function MediaManagementPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'image' | 'video' | 'audio' | 'document'
  >('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from API
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          name: 'reddit-drama-thumbnail.jpg',
          type: 'image',
          url: '/api/media/reddit-drama-thumbnail.jpg',
          size: 245760,
          mimeType: 'image/jpeg',
          uploadedAt: '2024-06-15T10:00:00Z',
          uploadedBy: 'Admin',
          dimensions: { width: 1200, height: 630 },
          alt: 'Reddit drama discussion thumbnail',
          caption: 'Thumbnail for viral Reddit drama post',
        },
        {
          id: '2',
          name: 'ai-takeover-video.mp4',
          type: 'video',
          url: '/api/media/ai-takeover-video.mp4',
          size: 15728640,
          mimeType: 'video/mp4',
          uploadedAt: '2024-06-14T15:30:00Z',
          uploadedBy: 'Admin',
          dimensions: { width: 1920, height: 1080 },
        },
        {
          id: '3',
          name: 'crypto-meme-collection.png',
          type: 'image',
          url: '/api/media/crypto-meme-collection.png',
          size: 512000,
          mimeType: 'image/png',
          uploadedAt: '2024-06-13T12:15:00Z',
          uploadedBy: 'Admin',
          dimensions: { width: 800, height: 600 },
        },
      ];
      setFiles(mockFiles);
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // In real app, upload to your media service
        // console.log('Uploading file:', file.name);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      }
      await loadMediaFiles();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    if (
      confirm(
        `Delete ${selectedFiles.length} file(s)? This action cannot be undone.`
      )
    ) {
      // In real app, call delete API
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // In real app, show toast notification
    // console.log('URL copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: MediaFile['type']) => {
    const icons = {
      image: ImageIcon,
      video: Video,
      audio: Music,
      document: FileText,
    };
    return icons[type] || File;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Media Library</h1>
          <p className='mt-2 text-gray-600'>
            Upload and manage your images, videos, and documents.
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className='flex items-center rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50'
          >
            <Upload className='mr-2 h-4 w-4' />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>

          <input
            ref={fileInputRef}
            type='file'
            multiple
            accept='image/*,video/*,audio/*,.pdf,.doc,.docx'
            onChange={handleFileUpload}
            className='hidden'
          />
        </div>
      </div>

      {/* Filters and Controls */}
      <div className='mb-6 rounded-lg bg-white shadow'>
        <div className='border-b border-gray-200 p-6'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            {/* Search */}
            <div className='max-w-md flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  placeholder='Search files...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              {/* Filter by type */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className='rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              >
                <option value='all'>All Types</option>
                <option value='image'>Images</option>
                <option value='video'>Videos</option>
                <option value='audio'>Audio</option>
                <option value='document'>Documents</option>
              </select>

              {/* View mode toggle */}
              <div className='flex rounded-md border border-gray-300'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <LayoutGrid className='h-4 w-4' />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className='border-b border-gray-200 bg-orange-50 p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-700'>
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}{' '}
                selected
              </span>
              <div className='flex space-x-2'>
                <button
                  onClick={handleBulkDelete}
                  className='rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700'
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Grid/List */}
        <div className='p-6'>
          {viewMode === 'grid' ? (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
              {filteredFiles.map(file => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      selectedFiles.includes(file.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    {/* Selection checkbox */}
                    <div className='absolute left-2 top-2 z-10'>
                      <input
                        type='checkbox'
                        checked={selectedFiles.includes(file.id)}
                        onChange={e => {
                          e.stopPropagation();
                          handleSelectFile(file.id);
                        }}
                        className='rounded'
                      />
                    </div>

                    {/* File preview */}
                    <div className='flex aspect-square items-center justify-center bg-gray-100'>
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.alt || file.name}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <FileIcon className='h-12 w-12 text-gray-400' />
                      )}
                    </div>

                    {/* File info */}
                    <div className='p-3'>
                      <p
                        className='truncate text-sm font-medium text-gray-900'
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className='absolute inset-0 flex items-center justify-center space-x-2 bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
                        className='rounded-full bg-white p-2 text-gray-600 hover:text-gray-900'
                        title='View details'
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          copyToClipboard(file.url);
                        }}
                        className='rounded-full bg-white p-2 text-gray-600 hover:text-gray-900'
                        title='Copy URL'
                      >
                        <Copy className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='w-12 p-3 text-left'>
                      <input
                        type='checkbox'
                        checked={
                          selectedFiles.length === filteredFiles.length &&
                          filteredFiles.length > 0
                        }
                        onChange={handleSelectAll}
                        className='rounded'
                      />
                    </th>
                    <th className='p-3 text-left font-medium text-gray-900'>
                      Name
                    </th>
                    <th className='p-3 text-left font-medium text-gray-900'>
                      Type
                    </th>
                    <th className='p-3 text-left font-medium text-gray-900'>
                      Size
                    </th>
                    <th className='p-3 text-left font-medium text-gray-900'>
                      Uploaded
                    </th>
                    <th className='p-3 text-left font-medium text-gray-900'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <tr
                        key={file.id}
                        className='border-b border-gray-100 hover:bg-gray-50'
                      >
                        <td className='p-3'>
                          <input
                            type='checkbox'
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => handleSelectFile(file.id)}
                            className='rounded'
                          />
                        </td>
                        <td className='p-3'>
                          <div className='flex items-center space-x-3'>
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.alt || file.name}
                                className='h-10 w-10 rounded object-cover'
                              />
                            ) : (
                              <div className='flex h-10 w-10 items-center justify-center rounded bg-gray-100'>
                                <FileIcon className='h-5 w-5 text-gray-400' />
                              </div>
                            )}
                            <div>
                              <p className='font-medium text-gray-900'>
                                {file.name}
                              </p>
                              {file.dimensions && (
                                <p className='text-sm text-gray-500'>
                                  {file.dimensions.width} ×{' '}
                                  {file.dimensions.height}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className='p-3'>
                          <span className='text-sm capitalize text-gray-600'>
                            {file.type}
                          </span>
                        </td>
                        <td className='p-3'>
                          <span className='text-sm text-gray-600'>
                            {formatFileSize(file.size)}
                          </span>
                        </td>
                        <td className='p-3'>
                          <div className='text-sm text-gray-600'>
                            <div>{formatDate(file.uploadedAt)}</div>
                            <div className='text-xs text-gray-500'>
                              by {file.uploadedBy}
                            </div>
                          </div>
                        </td>
                        <td className='p-3'>
                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => setSelectedFile(file)}
                              className='p-1 text-gray-400 hover:text-blue-600'
                              title='View details'
                            >
                              <Eye className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => copyToClipboard(file.url)}
                              className='p-1 text-gray-400 hover:text-green-600'
                              title='Copy URL'
                            >
                              <Copy className='h-4 w-4' />
                            </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className='p-1 text-gray-400 hover:text-orange-600'
                              title='Download'
                            >
                              <Download className='h-4 w-4' />
                            </a>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    'Delete this file? This action cannot be undone.'
                                  )
                                ) {
                                  setFiles(prev =>
                                    prev.filter(f => f.id !== file.id)
                                  );
                                }
                              }}
                              className='p-1 text-gray-400 hover:text-red-600'
                              title='Delete'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className='py-12 text-center'>
              <HardDrive className='mx-auto mb-4 h-12 w-12 text-gray-400' />
              <h3 className='mb-2 text-lg font-medium text-gray-900'>
                No files found
              </h3>
              <p className='text-gray-600'>
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload your first file to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Details Modal */}
      {selectedFile && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white'>
            <div className='border-b border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>File Details</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ×
                </button>
              </div>
            </div>

            <div className='p-6'>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Preview */}
                <div>
                  {selectedFile.type === 'image' ? (
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.alt || selectedFile.name}
                      className='w-full rounded-lg'
                    />
                  ) : (
                    <div className='flex h-64 w-full items-center justify-center rounded-lg bg-gray-100'>
                      {(() => {
                        const FileIcon = getFileIcon(selectedFile.type);
                        return <FileIcon className='h-16 w-16 text-gray-400' />;
                      })()}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className='space-y-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      File Name
                    </label>
                    <p className='text-gray-900'>{selectedFile.name}</p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      File URL
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='text'
                        value={selectedFile.url}
                        readOnly
                        className='flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm'
                      />
                      <button
                        onClick={() => copyToClipboard(selectedFile.url)}
                        className='p-2 text-gray-400 hover:text-gray-600'
                        title='Copy URL'
                      >
                        <Copy className='h-4 w-4' />
                      </button>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-1 block text-sm font-medium text-gray-700'>
                        Type
                      </label>
                      <p className='capitalize text-gray-900'>
                        {selectedFile.type}
                      </p>
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-medium text-gray-700'>
                        Size
                      </label>
                      <p className='text-gray-900'>
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  {selectedFile.dimensions && (
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='mb-1 block text-sm font-medium text-gray-700'>
                          Width
                        </label>
                        <p className='text-gray-900'>
                          {selectedFile.dimensions.width}px
                        </p>
                      </div>
                      <div>
                        <label className='mb-1 block text-sm font-medium text-gray-700'>
                          Height
                        </label>
                        <p className='text-gray-900'>
                          {selectedFile.dimensions.height}px
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      Uploaded
                    </label>
                    <p className='text-gray-900'>
                      {formatDate(selectedFile.uploadedAt)} by{' '}
                      {selectedFile.uploadedBy}
                    </p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      Alt Text
                    </label>
                    <input
                      type='text'
                      value={selectedFile.alt || ''}
                      onChange={e => {
                        // In real app, update file metadata
                        // console.log('Update alt text:', e.target.value);
                      }}
                      placeholder='Describe this image...'
                      className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                    />
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      Caption
                    </label>
                    <textarea
                      value={selectedFile.caption || ''}
                      onChange={e => {
                        // In real app, update file metadata
                        // console.log('Update caption:', e.target.value);
                      }}
                      placeholder='Add a caption...'
                      rows={3}
                      className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                    />
                  </div>

                  <div className='flex space-x-3 pt-4'>
                    <a
                      href={selectedFile.url}
                      download={selectedFile.name}
                      className='flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                    >
                      <Download className='mr-2 h-4 w-4' />
                      Download
                    </a>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            'Delete this file? This action cannot be undone.'
                          )
                        ) {
                          setFiles(prev =>
                            prev.filter(f => f.id !== selectedFile.id)
                          );
                          setSelectedFile(null);
                        }
                      }}
                      className='flex items-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
