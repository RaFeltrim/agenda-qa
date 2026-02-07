import { create } from 'zustand';
import type { Sprint } from '../types';

interface SprintStore {
    sprints: Sprint[];
    activeSprintId: string | null;
    loading: boolean;

    fetchSprints: () => Promise<void>;
    addSprint: (sprint: Omit<Sprint, 'id' | 'status'> & { id?: string, status?: Sprint['status'] }) => void;
    updateSprint: (id: string, updates: Partial<Sprint>) => void;
    setActiveSprint: (id: string | null) => void;
    archiveSprint: (id: string) => void;
}

export const useSprintStore = create<SprintStore>((set) => ({
    sprints: [],
    activeSprintId: null,
    loading: false,

    fetchSprints: async () => {
        set({ loading: true });
        // Mock fetch
        setTimeout(() => {
            set({
                sprints: [
                    { id: '1', name: 'Sprint 1', goal: 'MVP', startDate: '2026-01-01', endDate: '2026-01-14', status: 'completed' },
                    { id: '2', name: 'Sprint 2', goal: 'Features', startDate: '2026-01-15', endDate: '2026-01-29', status: 'active' }
                ],
                activeSprintId: '2',
                loading: false
            });
        }, 500);
    },

    addSprint: (newSprintData) => {
        const newSprint: Sprint = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
            status: 'planning', // Default status
            ...newSprintData,
        };

        set((state) => ({
            sprints: [...state.sprints, newSprint]
        }));
    },

    updateSprint: (id, updates) => {
        set((state) => ({
            sprints: state.sprints.map((s) => (s.id === id ? { ...s, ...updates } : s))
        }));
    },

    setActiveSprint: (id) => {
        set({ activeSprintId: id });
    },

    archiveSprint: (id) => {
        set((state) => ({
            sprints: state.sprints.map((s) => (s.id === id ? { ...s, status: 'archived' } : s))
        }));
    }
}));
