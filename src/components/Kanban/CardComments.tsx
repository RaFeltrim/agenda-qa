import { useState } from 'react';
import { Send, Edit3, Trash2, Check, X } from 'lucide-react';
import type { CardComment } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../UserAvatar';

interface CardCommentsProps {
  comments: CardComment[];
  loading: boolean;
  onAddComment: (content: string) => Promise<void>;
  onEditComment: (id: string, content: string) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

export default function CardComments({
  comments,
  loading,
  onAddComment,
  onEditComment,
  onDeleteComment
}: CardCommentsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (id: string) => {
    if (!editContent.trim()) return;
    
    try {
      await onEditComment(id, editContent);
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDeleteComment(id);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <div className="flex gap-2">
        <UserAvatar 
          name={user?.email?.split('@')[0] || 'You'} 
          size="sm" 
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <UserAvatar 
                name={comment.author_name || 'Unknown'} 
                size="sm" 
              />
              
              <div className="flex-1">
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditContent('');
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm hover:bg-slate-300 dark:hover:bg-slate-600"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.is_edited && (
                        <span className="text-xs text-slate-400 italic">
                          (edited)
                        </span>
                      )}
                      
                      {/* Action buttons (only for comment owner) */}
                      {user?.id === comment.author_id && (
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
