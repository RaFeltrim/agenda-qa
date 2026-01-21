import { supabase } from './supabaseClient';

// Type definition for comment read tracking
export interface CommentRead {
  id: string;
  card_id: string;
  user_id: string;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Check if a card has unread comments for the current user
 */
export const hasUnreadComments = async (cardId: string, userId: string): Promise<boolean> => {
  try {
    // First, get the most recent comment timestamp for this card
    const { data: latestComment, error: commentError } = await supabase
      .from('comentarios')
      .select('created_at')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (commentError && commentError.code !== 'PGRST116') {
      console.error('Error fetching latest comment:', commentError);
      return false;
    }

    // If no comments exist, return false
    if (!latestComment) {
      return false;
    }

    // Get the user's last read timestamp for this card
    const { data: readRecord, error: readError } = await supabase
      .from('comment_reads')
      .select('last_read_at')
      .eq('card_id', cardId)
      .eq('user_id', userId)
      .single();

    if (readError && readError.code !== 'PGRST116') {
      console.error('Error fetching read record:', readError);
      return false;
    }

    // If no read record exists or the comment is newer than the last read time
    if (!readRecord || new Date(latestComment.created_at) > new Date(readRecord.last_read_at)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking unread comments:', error);
    return false;
  }
};

/**
 * Mark comments as read for the current user on a specific card
 */
export const markCommentsAsRead = async (cardId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comment_reads')
      .upsert(
        {
          card_id: cardId,
          user_id: userId,
          last_read_at: new Date().toISOString(),
        },
        {
          onConflict: 'card_id,user_id',
        }
      );

    if (error) {
      console.error('Error marking comments as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking comments as read:', error);
    return false;
  }
};

/**
 * Get all unread comment counts for multiple cards
 */
export const getUnreadCommentsForCards = async (
  cardIds: string[],
  userId: string
): Promise<Record<string, boolean>> => {
  try {
    const result: Record<string, boolean> = {};

    // For each card, check if it has unread comments
    for (const cardId of cardIds) {
      result[cardId] = await hasUnreadComments(cardId, userId);
    }

    return result;
  } catch (error) {
    console.error('Error getting unread comments for cards:', error);
    return {};
  }
};

/**
 * Bulk mark multiple cards as read
 */
export const markMultipleCardsAsRead = async (
  cardIds: string[],
  userId: string
): Promise<boolean> => {
  try {
    const updates = cardIds.map(cardId => ({
      card_id: cardId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('comment_reads').upsert(updates, {
      onConflict: 'card_id,user_id',
    });

    if (error) {
      console.error('Error bulk marking cards as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error bulk marking cards as read:', error);
    return false;
  }
};
