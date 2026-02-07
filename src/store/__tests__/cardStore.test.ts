import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore } from '../cardStore';
import type { Card } from '../../types';

describe('Card Store', () => {
    beforeEach(() => {
        useCardStore.setState({ cards: [] });
    });

    it('should create a card', () => {
        const newCard: Omit<Card, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'New Feature',
            status: 'todo',
            priority: 'high',
            tags: [],
            subTasks: [],
            comments: [],
            attachments: [],
            history: []
        };

        useCardStore.getState().addCard(newCard);

        const { cards } = useCardStore.getState();
        expect(cards).toHaveLength(1);
        expect(cards[0].title).toBe('New Feature');
        expect(cards[0].id).toBeDefined();
    });

    it('should move a card', () => {
        const cardId = 'card-1';
        useCardStore.setState({
            cards: [{
                id: cardId,
                title: 'Move Me',
                status: 'todo',
                priority: 'low',
                tags: [],
                subTasks: [],
                comments: [],
                attachments: [],
                history: [],
                createdAt: '',
                updatedAt: ''
            }]
        });

        useCardStore.getState().moveCard(cardId, 'done');

        const { cards } = useCardStore.getState();
        expect(cards[0].status).toBe('done');
    });

    it('should add a subtask', () => {
        const cardId = 'card-1';
        useCardStore.setState({
            cards: [{
                id: cardId, title: 'Parent', status: 'todo', priority: 'low',
                subTasks: [], tags: [], comments: [], attachments: [], history: [], createdAt: '', updatedAt: ''
            }]
        });

        useCardStore.getState().addSubTask(cardId, 'Subtask 1');
        const { cards } = useCardStore.getState();
        expect(cards[0].subTasks).toHaveLength(1);
        expect(cards[0].subTasks[0].text).toBe('Subtask 1');
    });
});
