import { useState } from 'react';
import { Upload, Download, Trash2, Eye } from 'lucide-react';
import type { CardAttachment } from '../../hooks/useAttachments';
import { useAuth } from '../../hooks/useAuth';

interface CardAttachmentsProps {
  attachments: CardAttachment[];
  loading: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  getFileIcon: (mimeType: string) => string;
  formatFileSize: (bytes: number) => string;
}

export default function CardAttachments({
  attachments,
  loading,
  onUpload,
  onDelete,
  getFileIcon,
  formatFileSize
}: CardAttachmentsProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete attachment.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canDelete = (attachment: CardAttachment) => {
    return user?.id === attachment.uploaded_by;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer flex flex-col items-center gap-2 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {isUploading ? 'Uploading...' : 'Upload Attachment'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Max file size: 50MB
            </p>
          </div>
        </label>
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
            Loading attachments...
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
            No attachments yet
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              {/* File Icon */}
              <div className="text-2xl">
                {getFileIcon(attachment.mime_type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                  {attachment.filename}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatFileSize(attachment.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.uploaded_at)}</span>
                  <span>•</span>
                  <span>{attachment.uploaded_by_name}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <a
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </a>
                
                <a
                  href={attachment.file_url}
                  download={attachment.filename}
                  className="p-2 text-slate-500 hover:text-green-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>

                {canDelete(attachment) && (
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
