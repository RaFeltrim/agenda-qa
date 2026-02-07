import { describe, it, expect } from 'vitest';
import { useMeetingStore } from '../store/meetingStore';
import { useCardStore } from '../store/cardStore';

// We trust that Supabase client is configured with real env vars from .test.env or .env
// This test simulates a user flow: Auth (Mocked or Real?) -> meeting -> card

describe('Integration Flow: QA Workflow', () => {
    it('should create a meeting and persist it (Round Trip)', async () => {
        const { saveMeeting, fetchMeetings } = useMeetingStore.getState();

        // 1. Create Meeting
        const meetingData = {
            title: 'Integration Test Meeting ' + Date.now(),
            date: '2025-12-25', // Future date
            time: '10:00:00',
            description: 'Automated test meeting',
            status: 'a-agendar' as const,
            meetingLink: 'https://test.com'
        };

        await saveMeeting(meetingData);

        // 2. Fetch from "DB" (Supabase)
        // We need to wait a bit or trust fetchMeetings works
        await fetchMeetings();

        const { meetings } = useMeetingStore.getState();
        const created = meetings.find(m => m.title === meetingData.title);

        expect(created).toBeDefined();
        expect(created?.description).toBe(meetingData.description);
        expect(created?.meetingLink).toBe(meetingData.meetingLink);

        // Cleanup
        if (created) {
            await useMeetingStore.getState().deleteMeeting(created.id);
        }
    });

    it('should create a card and persist it', async () => {
        const { addCard, fetchCards } = useCardStore.getState();

        const cardData = {
            title: 'Integration Test Card ' + Date.now(),
            description: 'Testing Supabase persistence',
            status: 'todo' as const,
            priority: 'medium' as const,
            tags: ['test'],
            subTasks: [],
            comments: [],
            attachments: [],
            history: []
        };

        // Note: addCard is void (optimistic) in current store implementation? 
        // I changed it to Promise<void> in previous turn.
        await addCard(cardData);

        // Fetch to verify persistence
        await fetchCards();

        const { cards } = useCardStore.getState();
        const created = cards.find(c => c.title === cardData.title);

        expect(created).toBeDefined();
        expect(created?.id).toBeDefined();

        // Cleanup
        if (created) {
            await useCardStore.getState().deleteCard(created.id);
        }
    });
});
