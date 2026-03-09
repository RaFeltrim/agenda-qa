import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';

import { useAuth } from './useAuth';

export interface CardComment {
  id: string;
  card_id: string;
  content: string;
  author_id: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
}

export function useComments(cardId: string) {
  const [comments, setComments] = useState<CardComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!cardId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_comments')
        .select(`
          *,
          author:author_id (id, email, full_name)
        `)
        .eq('card_id', cardId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments = (data || []).map(comment => ({
        ...comment,
        author_name: comment.author?.full_name || comment.author?.email || 'Unknown User'
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`card-comments:${cardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_comments',
          filter: `card_id=eq.${cardId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newComment: CardComment = {
              id: payload.new.id,
              card_id: payload.new.card_id,
              content: payload.new.content,
              author_id: payload.new.author_id,
              author_name: payload.new.author?.full_name || payload.new.author?.email || 'Unknown User',
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              is_edited: payload.new.is_edited
            };
            setComments(prev => [...prev, newComment]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedComment: CardComment = {
              id: payload.new.id,
              card_id: payload.new.card_id,
              content: payload.new.content,
              author_id: payload.new.author_id,
              author_name: payload.new.author?.full_name || payload.new.author?.email || 'Unknown User',
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              is_edited: payload.new.is_edited
            };
            setComments(prev => 
              prev.map(comment => 
                comment.id === payload.new.id ? updatedComment : comment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardId, fetchComments]);

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('card_comments')
        .insert({
          card_id: cardId,
          content: content.trim(),
          author_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const editComment = async (id: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('card_comments')
        .update({
          content: content.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('author_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  };

  const deleteComment = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('card_comments')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  return {
    comments,
    loading,
    addComment,
    editComment,
    deleteComment,
    refresh: fetchComments
  };
}
