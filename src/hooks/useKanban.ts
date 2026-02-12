import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Card, CardStatus } from '../types';

export function useKanban(initialCards: Card[] = []) {
    const [cards, setCards] = useState<Card[]>(initialCards);
    const [loading, setLoading] = useState(true);

    const fetchCards = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setCards(data as Card[]);
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchCards();

        // Realtime subscription
        const channel = supabase
            .channel('public:cards')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    setCards(prev => [payload.new as Card, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setCards(prev => prev.map(c => c.id === payload.new.id ? payload.new as Card : c));
                } else if (payload.eventType === 'DELETE') {
                    setCards(prev => prev.filter(c => c.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchCards]);

    const moveCard = async (cardId: string, newStatus: CardStatus) => {
        // 1. Optimistic Update
        const originalCards = [...cards];
        const cardToUpdate = cards.find(c => c.id === cardId);

        if (!cardToUpdate || cardToUpdate.status === newStatus) return;

        // Update local state immediately
        setCards(prev => prev.map(card =>
            card.id === cardId ? { ...card, status: newStatus, updatedAt: new Date().toISOString() } : card
        ));

        try {
            // 2. Persist to Supabase
            const { error } = await supabase
                .from('cards')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', cardId);

            if (error) throw error;

        } catch (error) {
            // 3. Rollback on error
            console.error('Error moving card:', error);
            setCards(originalCards);
        }
    };

    const addCard = async (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const { data, error } = await supabase
                .from('cards')
                .insert(card)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding card:', error);
            throw error;
        }
    };

    const deleteCard = async (id: string) => {
        // Optimistic delete
        const originalCards = [...cards];
        setCards(prev => prev.filter(c => c.id !== id));

        try {
            const { error } = await supabase
                .from('cards')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Delete failed', error);
            setCards(originalCards);
            throw error;
        }
    };

    const updateCard = async (id: string, updates: Partial<Card>) => {
        // Optimistic
        setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        try {
            const { error } = await supabase.from('cards').update(updates).eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error(err);
            fetchCards(); // Revert
            throw err;
        }
    };

    return {
        cards,
        loading,
        create: addCard,
        update: updateCard,
        remove: deleteCard,
        moveCard,
        refresh: fetchCards,
        setCards
    };
}
