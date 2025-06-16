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
  HardDrive
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
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
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
          caption: 'Thumbnail for viral Reddit drama post'
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
          dimensions: { width: 1920, height: 1080 }
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
          dimensions: { width: 800, height: 600 }
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
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // In real app, upload to your media service
        console.log('Uploading file:', file.name);
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
    
    if (confirm(`Delete ${selectedFiles.length} file(s)? This action cannot be undone.`)) {
      // In real app, call delete API
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // In real app, show toast notification
    console.log('URL copied to clipboard');
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
      document: FileText
    };
    return icons[type] || File;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-2">Upload and manage your images, videos, and documents.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Filter by type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>

              {/* View mode toggle */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="p-4 bg-orange-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Grid/List */}
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedFiles.includes(file.id) 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectFile(file.id);
                        }}
                        className="rounded"
                      />
                    </div>

                    {/* File preview */}
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.alt || file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>

                    {/* File info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
                        className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-900"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(file.url);
                        }}
                        className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-900"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-3 font-medium text-gray-900">Name</th>
                    <th className="text-left p-3 font-medium text-gray-900">Type</th>
                    <th className="text-left p-3 font-medium text-gray-900">Size</th>
                    <th className="text-left p-3 font-medium text-gray-900">Uploaded</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => handleSelectFile(file.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.alt || file.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              {file.dimensions && (
                                <p className="text-sm text-gray-500">
                                  {file.dimensions.width} × {file.dimensions.height}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="capitalize text-sm text-gray-600">{file.type}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">{formatFileSize(file.size)}</span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-gray-600">
                            <div>{formatDate(file.uploadedAt)}</div>
                            <div className="text-xs text-gray-500">by {file.uploadedBy}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedFile(file)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(file.url)}
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-1 text-gray-400 hover:text-orange-600"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => {
                                if (confirm('Delete this file? This action cannot be undone.')) {
                                  setFiles(prev => prev.filter(f => f.id !== file.id));
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
            <div className="text-center py-12">
              <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload your first file to get started.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">File Details</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <div>
                  {selectedFile.type === 'image' ? (
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.alt || selectedFile.name}
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      {(() => {
                        const FileIcon = getFileIcon(selectedFile.type);
                        return <FileIcon className="w-16 h-16 text-gray-400" />;
                      })()}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                    <p className="text-gray-900">{selectedFile.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={selectedFile.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedFile.url)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <p className="text-gray-900 capitalize">{selectedFile.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <p className="text-gray-900">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>

                  {selectedFile.dimensions && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                        <p className="text-gray-900">{selectedFile.dimensions.width}px</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                        <p className="text-gray-900">{selectedFile.dimensions.height}px</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded</label>
                    <p className="text-gray-900">{formatDate(selectedFile.uploadedAt)} by {selectedFile.uploadedBy}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={selectedFile.alt || ''}
                      onChange={(e) => {
                        // In real app, update file metadata
                        console.log('Update alt text:', e.target.value);
                      }}
                      placeholder="Describe this image..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                    <textarea
                      value={selectedFile.caption || ''}
                      onChange={(e) => {
                        // In real app, update file metadata
                        console.log('Update caption:', e.target.value);
                      }}
                      placeholder="Add a caption..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <a
                      href={selectedFile.url}
                      download={selectedFile.name}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                    <button
                      onClick={() => {
                        if (confirm('Delete this file? This action cannot be undone.')) {
                          setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
                          setSelectedFile(null);
                        }
                      }}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
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