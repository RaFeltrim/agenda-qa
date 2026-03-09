import { useState, useEffect } from 'react';
import { X, MessageSquare, Save, Trash2, Paperclip, Activity } from 'lucide-react';
import type { Card, CardStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComments';
import { useAttachments } from '../../hooks/useAttachments';
import CardComments from './CardComments';
import CardAttachments from './CardAttachments';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Card) => void;
  onDelete?: (cardId: string) => void;
}

const STATUS_OPTIONS: { value: CardStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'bg-slate-400' },
  { value: 'em-progresso', label: 'Em Progresso', color: 'bg-blue-500' },
  { value: 'bloqueado', label: 'Bloqueado', color: 'bg-red-500' },
  { value: 'concluido', label: 'Concluído', color: 'bg-emerald-500' },
];

const PRIORITY_OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Normal' },
  { value: true, label: 'Urgente' },
];

export default function CardModal({ card, isOpen, onClose, onSave, onDelete }: CardModalProps) {
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'user';

  // Tab state
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'activity'>('details');
  
  // Comments and attachments hooks
  const {
    comments,
    loading: commentsLoading,
    addComment,
    editComment,
    deleteComment
  } = useComments(card?.id || '');
  
  const {
    attachments,
    loading: attachmentsLoading,
    uploadAttachment,
    deleteAttachment,
    getFileIcon,
    formatFileSize
  } = useAttachments(card?.id || '');

  const [formData, setFormData] = useState<Partial<Card>>({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (card) {
      setFormData({ ...card });
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const handleChange = (field: keyof Card, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && canEdit) {
      const currentTags = formData.tags || [];
      setFormData((prev) => ({
        ...prev,
        tags: [...currentTags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (canEdit) {
      const currentTags = formData.tags || [];
      setFormData((prev) => ({
        ...prev,
        tags: currentTags.filter((tag) => tag !== tagToRemove),
      }));
    }
  };

  const handleSave = () => {
    onSave(formData as Card);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && canEdit) {
      onDelete(card.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {card.titulo || card.title || 'Card Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'comments'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'attachments'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Paperclip className="w-4 h-4" />
              Attachments ({attachments.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.titulo || formData.title || ''}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.descricao || formData.description || ''}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    disabled={!canEdit}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 resize-none"
                  />
                </div>

                {/* Status & Priority Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || 'backlog'}
                      onChange={(e) => handleChange('status', e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.urgente ? 'true' : 'false'}
                      onChange={(e) => handleChange('urgente', e.target.value === 'true')}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.prazo ? formData.prazo.split('T')[0] : ''}
                    onChange={(e) => handleChange('prazo', e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel || ''}
                    onChange={(e) => handleChange('responsavel', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Enter name..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                      >
                        {tag}
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <CardComments
                comments={comments}
                loading={commentsLoading}
                onAddComment={addComment}
                onEditComment={editComment}
                onDeleteComment={deleteComment}
              />
            )}

            {activeTab === 'attachments' && (
              <CardAttachments
                attachments={attachments}
                loading={attachmentsLoading}
                onUpload={uploadAttachment}
                onDelete={deleteAttachment}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
              />
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Activity log coming soon...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between rounded-b-2xl">
          <div>
            {canEdit && onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
