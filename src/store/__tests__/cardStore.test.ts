import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore } from '../cardStore';
import type { Card } from '../../types';

/**
 * CardStore Unit Tests
 * 
 * These tests validate the Zustand store's state management logic.
 * Since addCard is async and depends on Supabase, we test state manipulation
 * directly using setState for predictable, isolated tests.
 */

const createMockCard = (overrides?: Partial<Card>): Card => ({
    id: `card-${Date.now()}`,
    title: 'Test Card',
    status: 'todo',
    priority: 'medium',
    tags: [],
    subTasks: [],
    comments: [],
    attachments: [],
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

describe('Card Store - State Management', () => {
    beforeEach(() => {
        useCardStore.setState({ cards: [], loading: false, error: null, currentUserId: null });
    });

    it('should initialize with empty cards array', () => {
        const { cards } = useCardStore.getState();
        expect(cards).toHaveLength(0);
    });

    it('should set cards via setState', () => {
        const mockCards = [createMockCard({ id: 'card-1', title: 'First' })];
        useCardStore.setState({ cards: mockCards });

        const { cards } = useCardStore.getState();
        expect(cards).toHaveLength(1);
        expect(cards[0].title).toBe('First');
        expect(cards[0].id).toBe('card-1');
    });

    it('should move a card status', () => {
        const cardId = 'card-1';
        useCardStore.setState({
            cards: [createMockCard({ id: cardId, status: 'todo' })],
        });

        // moveCard is async but also does optimistic update via setState
        useCardStore.getState().moveCard(cardId, 'done');

        const { cards } = useCardStore.getState();
        expect(cards[0].status).toBe('done');
    });

    it('should add a subtask optimistically', () => {
        const cardId = 'card-1';
        useCardStore.setState({
            cards: [createMockCard({ id: cardId })],
        });

        useCardStore.getState().addSubTask(cardId, 'Subtask 1');

        const { cards } = useCardStore.getState();
        expect(cards[0].subTasks?.length).toBe(1);
        expect(cards[0].subTasks?.[0].text).toBe('Subtask 1');
        expect(cards[0].subTasks?.[0].completed).toBe(false);
    });

    it('should toggle a subtask', () => {
        const cardId = 'card-1';
        const subTaskId = 'sub-1';
        useCardStore.setState({
            cards: [createMockCard({
                id: cardId,
                subTasks: [{ id: subTaskId, text: 'Task', completed: false }],
            })],
        });

        useCardStore.getState().toggleSubTask(cardId, subTaskId);

        const { cards } = useCardStore.getState();
        expect(cards[0].subTasks?.[0].completed).toBe(true);
    });

    it('should add a comment optimistically', () => {
        const cardId = 'card-1';
        useCardStore.setState({
            cards: [createMockCard({ id: cardId })],
        });

        useCardStore.getState().addComment(cardId, 'Hello!', 'user-123');

        const { cards } = useCardStore.getState();
        expect(cards[0].comments?.length).toBe(1);
        expect(cards[0].comments?.[0].text).toBe('Hello!');
        expect(cards[0].comments?.[0].authorId).toBe('user-123');
    });

    it('should delete a comment optimistically', () => {
        const cardId = 'card-1';
        const commentId = 'comment-1';
        useCardStore.setState({
            cards: [createMockCard({
                id: cardId,
                comments: [{ id: commentId, authorId: 'user-1', text: 'Test', createdAt: '' }],
            })],
        });

        useCardStore.getState().deleteComment(cardId, commentId);

        const { cards } = useCardStore.getState();
        expect(cards[0].comments?.length).toBe(0);
    });

    it('should add an attachment optimistically', () => {
        const cardId = 'card-1';
        useCardStore.setState({
            cards: [createMockCard({ id: cardId })],
        });

        useCardStore.getState().addAttachment(cardId, {
            name: 'file.pdf',
            type: 'file',
            url: 'https://example.com/file.pdf',
            uploadedBy: 'user-1'
        });

        const { cards } = useCardStore.getState();
        expect(cards[0].attachments?.length).toBe(1);
        expect(cards[0].attachments?.[0].name).toBe('file.pdf');
    });

    it('should set currentUserId', () => {
        useCardStore.getState().setCurrentUserId('user-123');

        const { currentUserId } = useCardStore.getState();
        expect(currentUserId).toBe('user-123');
    });

    it('should handle loading state', () => {
        useCardStore.setState({ loading: true });
        expect(useCardStore.getState().loading).toBe(true);

        useCardStore.setState({ loading: false });
        expect(useCardStore.getState().loading).toBe(false);
    });

    it('should handle error state', () => {
        useCardStore.setState({ error: 'Something went wrong' });
        expect(useCardStore.getState().error).toBe('Something went wrong');
    });
});
