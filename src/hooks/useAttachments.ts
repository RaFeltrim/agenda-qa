import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';

export interface CardAttachment {
  id: string;
  card_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export function useAttachments(cardId: string) {
  const [attachments, setAttachments] = useState<CardAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAttachments = useCallback(async () => {
    if (!cardId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_attachments')
        .select(`
          *,
          uploader:uploaded_by (id, email, full_name)
        `)
        .eq('card_id', cardId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const formattedAttachments = (data || []).map(attachment => ({
        ...attachment,
        uploaded_by_name: attachment.uploader?.full_name || attachment.uploader?.email || 'Unknown User'
      }));

      setAttachments(formattedAttachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchAttachments();

    const channel = supabase
      .channel(`card-attachments:${cardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_attachments',
          filter: `card_id=eq.${cardId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAttachment: CardAttachment = {
              id: payload.new.id,
              card_id: payload.new.card_id,
              filename: payload.new.filename,
              file_url: payload.new.file_url,
              file_size: payload.new.file_size,
              mime_type: payload.new.mime_type,
              uploaded_by: payload.new.uploaded_by,
              uploaded_by_name: payload.new.uploader?.full_name || payload.new.uploader?.email || 'Unknown User',
              uploaded_at: payload.new.uploaded_at
            };
            setAttachments(prev => [newAttachment, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setAttachments(prev => prev.filter(att => att.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardId, fetchAttachments]);

  const uploadAttachment = async (file: File) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${cardId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      // 3. Save metadata to database
      const { data, error: dbError } = await supabase
        .from('card_attachments')
        .insert({
          card_id: cardId,
          filename: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  };

  const deleteAttachment = async (id: string) => {
    if (!user) return;

    try {
      // 1. Get attachment to delete
      const { data: attachment, error: fetchError } = await supabase
        .from('card_attachments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete from database
      const { error: deleteError } = await supabase
        .from('card_attachments')
        .delete()
        .eq('id', id)
        .eq('uploaded_by', user.id);

      if (deleteError) throw deleteError;

      // 3. Delete from storage (extract path from URL)
      if (attachment.file_url.includes('/storage/v1/object/public/attachments/')) {
        const path = attachment.file_url.split('/storage/v1/object/public/attachments/')[1];
        await supabase.storage.from('attachments').remove([path]);
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    attachments,
    loading,
    uploadAttachment,
    deleteAttachment,
    getFileIcon,
    formatFileSize,
    refresh: fetchAttachments
  };
}
