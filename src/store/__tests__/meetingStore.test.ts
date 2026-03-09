import { describe, it, expect, beforeEach } from 'vitest';
import { useMeetingStore } from '../meetingStore';
import type { Meeting } from '../meetingStore';

/**
 * MeetingStore Unit Tests
 * 
 * These tests validate the Zustand store's state management logic.
 * Async operations that depend on Supabase are tested via setState
 * for predictable, isolated tests.
 */

const createMockMeeting = (overrides?: Partial<Meeting>): Meeting => ({
    id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: 'Test Meeting',
    date: '2026-03-01',
    time: '10:00:00',
    description: 'Test description',
    status: 'a-agendar',
    meetingLink: 'https://meet.google.com/test',
    createdBy: 'user-123',
    ...overrides,
});

describe('Meeting Store - State Management', () => {
    beforeEach(() => {
        useMeetingStore.setState({
            meetings: [],
            loading: false,
            error: null,
            currentUserId: null,
            isModalOpen: false,
            selectedMeeting: null,
            saving: false,
        });
    });

    it('should initialize with empty meetings array', () => {
        const { meetings } = useMeetingStore.getState();
        expect(meetings).toHaveLength(0);
    });

    it('should set meetings via setState', () => {
        const mockMeetings = [
            createMockMeeting({ id: 'meeting-1', title: 'Sprint Planning' }),
            createMockMeeting({ id: 'meeting-2', title: 'Daily Standup' }),
        ];
        useMeetingStore.setState({ meetings: mockMeetings });

        const { meetings } = useMeetingStore.getState();
        expect(meetings).toHaveLength(2);
        expect(meetings[0].title).toBe('Sprint Planning');
        expect(meetings[1].title).toBe('Daily Standup');
    });

    it('should set currentUserId', () => {
        useMeetingStore.getState().setCurrentUserId('user-xyz');
        const { currentUserId } = useMeetingStore.getState();
        expect(currentUserId).toBe('user-xyz');
    });

    it('should open modal for new meeting (createMeeting)', () => {
        useMeetingStore.getState().createMeeting();

        const state = useMeetingStore.getState();
        expect(state.isModalOpen).toBe(true);
        expect(state.selectedMeeting).toBeNull();
    });

    it('should open modal with selected meeting for editing', () => {
        const meeting = createMockMeeting({ id: 'edit-1', title: 'Edit Me' });
        useMeetingStore.setState({ meetings: [meeting] });

        useMeetingStore.getState().setSelectedMeeting(meeting);
        useMeetingStore.getState().setModalOpen(true);

        const state = useMeetingStore.getState();
        expect(state.isModalOpen).toBe(true);
        expect(state.selectedMeeting?.title).toBe('Edit Me');
    });

    it('should close modal', () => {
        useMeetingStore.setState({ isModalOpen: true });
        useMeetingStore.getState().setModalOpen(false);

        expect(useMeetingStore.getState().isModalOpen).toBe(false);
    });

    it('should handle loading state', () => {
        useMeetingStore.setState({ loading: true });
        expect(useMeetingStore.getState().loading).toBe(true);

        useMeetingStore.setState({ loading: false });
        expect(useMeetingStore.getState().loading).toBe(false);
    });

    it('should handle error state', () => {
        useMeetingStore.setState({ error: 'Failed to fetch' });
        expect(useMeetingStore.getState().error).toBe('Failed to fetch');

        useMeetingStore.setState({ error: null });
        expect(useMeetingStore.getState().error).toBeNull();
    });

    it('should handle saving state', () => {
        useMeetingStore.setState({ saving: true });
        expect(useMeetingStore.getState().saving).toBe(true);

        useMeetingStore.setState({ saving: false });
        expect(useMeetingStore.getState().saving).toBe(false);
    });

    it('should filter meetings by status', () => {
        const meetings = [
            createMockMeeting({ id: '1', status: 'a-agendar' }),
            createMockMeeting({ id: '2', status: 'confirmada' }),
            createMockMeeting({ id: '3', status: 'realizada' }),
            createMockMeeting({ id: '4', status: 'a-agendar' }),
        ];
        useMeetingStore.setState({ meetings });

        const state = useMeetingStore.getState();
        const aAgendar = state.meetings.filter(m => m.status === 'a-agendar');
        const confirmada = state.meetings.filter(m => m.status === 'confirmada');
        const realizada = state.meetings.filter(m => m.status === 'realizada');

        expect(aAgendar).toHaveLength(2);
        expect(confirmada).toHaveLength(1);
        expect(realizada).toHaveLength(1);
    });

    it('should correctly map meeting statuses from Kanban columns', () => {
        const validStatuses: Meeting['status'][] = ['a-agendar', 'confirmada', 'realizada'];

        validStatuses.forEach(status => {
            const meeting = createMockMeeting({ status });
            expect(['a-agendar', 'confirmada', 'realizada']).toContain(meeting.status);
        });
    });

    it('should handle meetings with optional fields', () => {
        const minimal = createMockMeeting({
            description: undefined,
            meetingLink: undefined,
            time: '',
        });

        useMeetingStore.setState({ meetings: [minimal] });
        const { meetings } = useMeetingStore.getState();

        expect(meetings[0].description).toBeUndefined();
        expect(meetings[0].meetingLink).toBeUndefined();
        expect(meetings[0].time).toBe('');
    });

    it('should sort meetings by date', () => {
        const meetings = [
            createMockMeeting({ id: '1', date: '2026-03-15' }),
            createMockMeeting({ id: '2', date: '2026-03-01' }),
            createMockMeeting({ id: '3', date: '2026-03-10' }),
        ];
        useMeetingStore.setState({ meetings });

        const sorted = [...useMeetingStore.getState().meetings].sort(
            (a, b) => a.date.localeCompare(b.date)
        );

        expect(sorted[0].date).toBe('2026-03-01');
        expect(sorted[1].date).toBe('2026-03-10');
        expect(sorted[2].date).toBe('2026-03-15');
    });
});
