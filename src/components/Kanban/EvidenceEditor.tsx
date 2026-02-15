import { useState } from 'react';
import { X, Edit3, Trash2, Save, ExternalLink, FileText, Image, Download } from 'lucide-react';
import type { CardAttachment } from '../../hooks/useAttachments';

interface EvidenceEditorProps {
  attachment: CardAttachment;
  onUpdate: (id: string, filename: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function EvidenceEditor({
  attachment,
  onUpdate,
  onDelete,
  onClose
}: EvidenceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(attachment.filename);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (editName.trim() && editName !== attachment.filename) {
      try {
        await onUpdate(attachment.id, editName.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update filename:', error);
        alert('Failed to update filename');
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${attachment.filename}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(attachment.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete attachment:', error);
        alert('Failed to delete attachment');
        setIsDeleting(false);
      }
    }
  };

  const getFileType = () => {
    if (attachment.mime_type.startsWith('image/')) return 'image';
    if (attachment.mime_type === 'application/pdf') return 'pdf';
    if (attachment.mime_type.startsWith('video/')) return 'video';
    if (attachment.mime_type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fileType = getFileType();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {fileType === 'image' && '🖼️'}
              {fileType === 'pdf' && '📄'}
              {fileType === 'video' && '🎬'}
              {fileType === 'audio' && '🎵'}
              {fileType === 'file' && '📁'}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(attachment.filename);
                  }}
                  className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {attachment.filename}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Uploaded by {attachment.uploaded_by_name} • {formatDate(attachment.uploaded_at)}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Rename"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            
            <a
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <a
              href={attachment.file_url}
              download={attachment.filename}
              className="p-2 text-slate-500 hover:text-green-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {fileType === 'image' ? (
            <div className="text-center">
              <img
                src={attachment.file_url}
                alt={attachment.filename}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg mx-auto"
              />
            </div>
          ) : fileType === 'pdf' ? (
            <div className="text-center">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-8 inline-flex flex-col items-center">
                <FileText className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-slate-700 dark:text-slate-300 mb-2">PDF Document</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Click the external link icon to view in browser
                </p>
              </div>
            </div>
          ) : fileType === 'video' ? (
            <div className="text-center">
              <video
                src={attachment.file_url}
                controls
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg mx-auto"
              />
            </div>
          ) : fileType === 'audio' ? (
            <div className="text-center">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-8 inline-flex flex-col items-center">
                <FileText className="w-16 h-16 text-purple-500 mb-4" />
                <p className="text-slate-700 dark:text-slate-300 mb-2">Audio File</p>
                <audio src={attachment.file_url} controls className="w-full max-w-md" />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-8 inline-flex flex-col items-center">
                <FileText className="w-16 h-16 text-slate-500 mb-4" />
                <p className="text-slate-700 dark:text-slate-300 mb-2">File</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {attachment.filename}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Click download to save this file
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
