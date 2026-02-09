import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { toastError, toastSuccess } from '../lib/toast';
import { sanitizeString, sanitizeDate, sanitizeStringArray } from '../lib/validation';
import {
    cardsService,
    mapStatusFromDb,
    type DBCardStatus,
    type DBCardPriority,
    type FrontendCardStatus
} from '../services/cardsService';
import type { Card, CardStatus, SubTask, Comment, Attachment, Priority } from '../types';

/** Type guard for DB card row */
interface DBCardRow {
    id: string;
    titulo: string;
    descricao: string | null;
    status: DBCardStatus;
    priority: DBCardPriority;
    tags: string[] | null;
    prazo: string | null;
    sub_tasks: SubTask[] | null;
    comentarios: Comment[] | null;
    anexos: Attachment[] | null;
    historico: { id: string; action: string; userId: string; timestamp: string }[] | null;
    created_at: string;
    updated_at: string;
    sprint_id: string | null;
}

/** Map DB row to frontend Card type */
function mapDbRowToCard(row: DBCardRow): Card {
    return {
        id: row.id,
        title: row.titulo,
        description: row.descricao ?? undefined,
        status: mapStatusFromDb(row.status),
        priority: (row.priority || 'medium') as Priority,
        tags: row.tags || [],
        dueDate: row.prazo ?? undefined,
        subTasks: row.sub_tasks || [],
        comments: row.comentarios || [],
        attachments: row.anexos || [],
        history: row.historico || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        sprintId: row.sprint_id
    };
}

interface CardStore {
    cards: Card[];
    loading: boolean;
    error: string | null;
    currentUserId: string | null;

    setCurrentUserId: (userId: string | null) => void;
    fetchCards: () => Promise<void>;
    addCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
    deleteCard: (id: string) => Promise<void>;
    moveCard: (id: string, newStatus: CardStatus) => Promise<void>;
    addSubTask: (cardId: string, text: string) => Promise<void>;
    toggleSubTask: (cardId: string, subTaskId: string) => Promise<void>;
    addComment: (cardId: string, text: string, authorId: string) => Promise<void>;
    deleteComment: (cardId: string, commentId: string) => Promise<void>;
    addAttachment: (cardId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => Promise<void>;
    deleteAttachment: (cardId: string, attachmentId: string) => Promise<void>;
}

const safeUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useCardStore = create<CardStore>((set, get) => ({
    cards: [],
    loading: false,
    error: null,
    currentUserId: null,

    setCurrentUserId: (userId: string | null) => {
        set({ currentUserId: userId });
    },

    fetchCards: async () => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .is('deleted_at', null)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            const mappedCards: Card[] = (data || []).map((row: DBCardRow) => mapDbRowToCard(row));

            set({ cards: mappedCards });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cards';
            console.error('Error fetching cards:', error);
            set({ error: errorMessage });
        } finally {
            set({ loading: false });
        }
    },

    addCard: async (cardData) => {
        const state = get();
        const userId = state.currentUserId;


                // BUG-013 fix: require authentication before creating cards
                if (!userId) {
                                toastError('Login necessário para criar cards');
                                return;
                }

        
        // Validate required fields
        const title = sanitizeString(cardData.title);
        if (!title) {
            toastError('Título é obrigatório');
            return;
        }
        
        // Use cardsService for proper DB integration with audit logging
        const result = await cardsService.create(
            {
                titulo: title,
                descricao: sanitizeString(cardData.description) || undefined,
                status: cardData.status as FrontendCardStatus,
                priority: (cardData.priority || 'medium') as DBCardPriority,
                tags: sanitizeStringArray(cardData.tags),
                prazo: sanitizeDate(cardData.dueDate) || undefined,
                urgente: false,
                sprint_id: cardData.sprintId ?? undefined
            },
            userId!
        );

        if (result.success && result.data) {
            const newCard = mapDbRowToCard(result.data as unknown as DBCardRow);
            set((state) => ({ cards: [newCard, ...state.cards] }));
            toastSuccess('Card criado com sucesso!');
        } else {
            console.error('Error creating card:', result.error);
            set({ error: result.error?.message || 'Failed to create card' });
            toastError(`Erro ao criar card: ${result.error?.message || 'Erro desconhecido'}`);
        }
    },

    updateCard: async (id, updates) => {
        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const userId = state.currentUserId;
        const updatedAt = new Date().toISOString();

        // Build sanitized updates object - only include fields that are being updated
        const sanitizedUpdates: Partial<Card> = { updatedAt };
        
        if (updates.title !== undefined) {
            const sanitized = sanitizeString(updates.title);
            if (sanitized) sanitizedUpdates.title = sanitized;
        }
        if (updates.description !== undefined) {
            sanitizedUpdates.description = sanitizeString(updates.description) || undefined;
        }
        if (updates.tags !== undefined) {
            sanitizedUpdates.tags = sanitizeStringArray(updates.tags);
        }
        if (updates.dueDate !== undefined) {
            sanitizedUpdates.dueDate = sanitizeDate(updates.dueDate) || undefined;
        }
        if (updates.status !== undefined) {
            sanitizedUpdates.status = updates.status;
        }
        if (updates.priority !== undefined) {
            sanitizedUpdates.priority = updates.priority;
        }
        if (updates.subTasks !== undefined) {
            sanitizedUpdates.subTasks = updates.subTasks;
        }
        if (updates.comments !== undefined) {
            sanitizedUpdates.comments = updates.comments;
        }
        if (updates.attachments !== undefined) {
            sanitizedUpdates.attachments = updates.attachments;
        }

        // Optimistic Update
        set((state) => ({
            cards: state.cards.map((c) => (c.id === id ? { ...c, ...sanitizedUpdates } : c))
        }));

        // Use cardsService for status/priority changes (with audit logging)
        if (updates.status !== undefined || updates.priority !== undefined) {
            const result = await cardsService.patch(
                id,
                {
                    status: updates.status as FrontendCardStatus | undefined,
                    priority: updates.priority as DBCardPriority | undefined,
                    titulo: sanitizedUpdates.title,
                    descricao: sanitizedUpdates.description,
                    tags: sanitizedUpdates.tags,
                    prazo: sanitizedUpdates.dueDate
                },
                userId
            );

            if (!result.success) {
                console.error('Error updating card:', result.error);
                // Rollback to previous state
                set({ cards: previousCards, error: result.error?.message || 'Failed to update card' });
                toastError(`Erro ao atualizar card: ${result.error?.message || 'Erro desconhecido'}`);
            }
            return;
        }

        // For non-status/priority updates, use direct supabase call
        interface DBUpdatePayload {
            updated_at: string;
            titulo?: string;
            descricao?: string;
            tags?: string[];
            prazo?: string;
            sub_tasks?: SubTask[];
            comentarios?: Comment[];
            anexos?: Attachment[];
        }

        const dbUpdates: DBUpdatePayload = { updated_at: updatedAt };
        if (sanitizedUpdates.title !== undefined) dbUpdates.titulo = sanitizedUpdates.title || undefined;
        if (sanitizedUpdates.description !== undefined) dbUpdates.descricao = sanitizedUpdates.description || undefined;
        if (sanitizedUpdates.tags !== undefined) dbUpdates.tags = sanitizedUpdates.tags;
        if (sanitizedUpdates.dueDate !== undefined) dbUpdates.prazo = sanitizedUpdates.dueDate || undefined;
        if (updates.subTasks !== undefined) dbUpdates.sub_tasks = updates.subTasks;
        if (updates.comments !== undefined) dbUpdates.comentarios = updates.comments;
        if (updates.attachments !== undefined) dbUpdates.anexos = updates.attachments;

        const { error } = await supabase.from('cards').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Error updating card:', error);
            // Rollback to previous state
            set({ cards: previousCards, error: error.message });
            toastError(`Erro ao atualizar card: ${error.message}`);
        }
    },

    deleteCard: async (id) => {
        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const userId = state.currentUserId;
        
        // Optimistic update
        set((state) => ({ cards: state.cards.filter((c) => c.id !== id) }));
        
        // Soft delete with audit logging
        const result = await cardsService.delete(id, userId);
        if (!result.success) {
            console.error('Error deleting card:', result.error);
            // Rollback to previous state
            set({ cards: previousCards, error: result.error?.message || 'Failed to delete card' });
            toastError(`Erro ao excluir card: ${result.error?.message || 'Erro desconhecido'}`);
        } else {
            toastSuccess('Card excluído com sucesso!');
        }
    },

    moveCard: async (id, newStatus) => {
        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const userId = state.currentUserId;
        
        // Optimistic update
        set((state) => ({
            cards: state.cards.map((c) => (c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
        }));
        
        // Use cardsService for proper status change with audit logging
        const result = await cardsService.moveStatus(id, newStatus as FrontendCardStatus, userId);
        
        if (!result.success) {
            console.error('Error moving card:', result.error);
            // Rollback to previous state
            set({ cards: previousCards, error: result.error?.message || 'Failed to move card' });
            toastError(`Erro ao mover card: ${result.error?.message || 'Erro desconhecido'}`);
        }
    },

    addSubTask: async (cardId, text) => {
        // Validate input
        const sanitizedText = sanitizeString(text);
        if (!sanitizedText) {
            toastError('Texto da subtarefa é obrigatório');
            return;
        }

        const newSubTask: SubTask = {
            id: safeUUID(),
            text: sanitizedText,
            completed: false
        };

        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const card = state.cards.find(c => c.id === cardId);
        if (!card) return;

        const updatedSubTasks = [...card.subTasks, newSubTask];

        set((state) => ({
            cards: state.cards.map((c) =>
                c.id === cardId
                    ? { ...c, subTasks: updatedSubTasks, updatedAt: new Date().toISOString() }
                    : c
            )
        }));

        const { error } = await supabase
            .from('cards')
            .update({ sub_tasks: updatedSubTasks, updated_at: new Date().toISOString() })
            .eq('id', cardId);

        if (error) {
            console.error('Error adding subtask:', error);
            // Rollback to previous state
            set({ cards: previousCards });
            toastError(`Erro ao adicionar subtarefa: ${error.message}`);
        }
    },

    toggleSubTask: async (cardId, subTaskId) => {
        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const card = state.cards.find(c => c.id === cardId);
        if (!card) return;

        const updatedSubTasks = card.subTasks.map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
        );

        set((state) => ({
            cards: state.cards.map((c) =>
                c.id === cardId
                    ? { ...c, subTasks: updatedSubTasks, updatedAt: new Date().toISOString() }
                    : c
            )
        }));

        const { error } = await supabase
            .from('cards')
            .update({ sub_tasks: updatedSubTasks, updated_at: new Date().toISOString() })
            .eq('id', cardId);

        if (error) {
            console.error('Error toggling subtask:', error);
            // Rollback to previous state
            set({ cards: previousCards });
            toastError(`Erro ao atualizar subtarefa: ${error.message}`);
        }
    },

    addComment: async (cardId, text, authorId) => {
        // Validate input
        const sanitizedText = sanitizeString(text);
        if (!sanitizedText) {
            toastError('Texto do comentário é obrigatório');
            return;
        }

        const newComment: Comment = {
            id: safeUUID(),
            authorId,
            text: sanitizedText,
            createdAt: new Date().toISOString()
        };

        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const card = state.cards.find(c => c.id === cardId);
        if (!card) return;

        const updatedComments = [...card.comments, newComment];

        set((state) => ({
            cards: state.cards.map((c) =>
                c.id === cardId
                    ? { ...c, comments: updatedComments, updatedAt: new Date().toISOString() }
                    : c
            )
        }));

        const { error } = await supabase
            .from('cards')
            .update({ comentarios: updatedComments, updated_at: new Date().toISOString() })
            .eq('id', cardId);

        if (error) {
            console.error('Error adding comment:', error);
            // Rollback to previous state
            set({ cards: previousCards });
            toastError(`Erro ao adicionar comentário: ${error.message}`);
        }
    },

    deleteComment: async (cardId, commentId) => {
        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const card = state.cards.find(c => c.id === cardId);
        if (!card) return;

        const updatedComments = card.comments.filter(c => c.id !== commentId);

        set((state) => ({
            cards: state.cards.map((c) =>
                c.id === cardId
                    ? { ...c, comments: updatedComments, updatedAt: new Date().toISOString() }
                    : c
            )
        }));

        const { error } = await supabase
            .from('cards')
            .update({ comentarios: updatedComments, updated_at: new Date().toISOString() })
            .eq('id', cardId);

        if (error) {
            console.error('Error deleting comment:', error);
            // Rollback to previous state
            set({ cards: previousCards });
            toastError(`Erro ao excluir comentário: ${error.message}`);
        }
    },

    addAttachment: async (cardId, attachmentData) => {
        // Validate required fields
        if (!attachmentData.name || !attachmentData.url) {
            toastError('Nome e URL do anexo são obrigatórios');
            return;
        }

        const newAttachment: Attachment = {
            id: safeUUID(),
            uploadedAt: new Date().toISOString(),
            ...attachmentData,
            name: sanitizeString(attachmentData.name) || attachmentData.name,
            url: sanitizeString(attachmentData.url) || attachmentData.url
        };

        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const card = state.cards.find(c => c.id === cardId);
        if (!card) return;

        const updatedAttachments = [...card.attachments, newAttachment];

        set((state) => ({
            cards: state.cards.map((c) =>
                c.id === cardId
                    ? { ...c, attachments: updatedAttachments, updatedAt: new Date().toISOString() }
                    : c
            )
        }));

        const { error } = await supabase
            .from('cards')
            .update({ anexos: updatedAttachments, updated_at: new Date().toISOString() })
            .eq('id', cardId);

        if (error) {
            console.error('Error adding attachment:', error);
            // Rollback to previous state
            set({ cards: previousCards });
            toastError(`Erro ao adicionar anexo: ${error.message}`);
        }
    },

    deleteAttachment: async (cardId, attachmentId) => {
        const state = get();
        const previousCards = [...state.cards]; // Store for rollback
        const card = state.cards.find(c => c.id === cardId);
        if (!card) return;

        const updatedAttachments = card.attachments.filter(a => a.id !== attachmentId);

        set((state) => ({
            cards: state.cards.map((c) =>
                c.id === cardId
                    ? { ...c, attachments: updatedAttachments, updatedAt: new Date().toISOString() }
                    : c
            )
        }));

        const { error } = await supabase
            .from('cards')
            .update({ anexos: updatedAttachments, updated_at: new Date().toISOString() })
            .eq('id', cardId);

        if (error) {
            console.error('Error deleting attachment:', error);
            // Rollback to previous state
            set({ cards: previousCards });
            toastError(`Erro ao excluir anexo: ${error.message}`);
        }
    }
}));
