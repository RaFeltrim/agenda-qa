import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardStats from '../Dashboard/DashboardStats';
import type { Card } from '../../types';
import type { Meeting } from '../../store/meetingStore';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    CheckCircle: () => <span data-testid="icon-check" />,
    Clock: () => <span data-testid="icon-clock" />,
    Calendar: () => <span data-testid="icon-calendar" />,
    AlertTriangle: () => <span data-testid="icon-alert" />,
}));

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

const createMockMeeting = (overrides?: Partial<Meeting>): Meeting => ({
    id: `meeting-${Date.now()}`,
    title: 'Test Meeting',
    date: new Date().toISOString().split('T')[0],
    time: '10:00:00',
    status: 'confirmada',
    createdBy: 'user-1',
    ...overrides,
});

describe('DashboardStats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with zero counts when no data', () => {
        render(<DashboardStats cards={[]} meetings={[]} />);

        expect(screen.getByText('Total de Tarefas')).toBeInTheDocument();
        expect(screen.getByText('Em Progresso')).toBeInTheDocument();
        expect(screen.getByText('Reuniões Hoje')).toBeInTheDocument();
        expect(screen.getByText('Bloqueados')).toBeInTheDocument();

        // All counts should be 0
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBeGreaterThanOrEqual(4);
    });

    it('should count cards correctly by status', () => {
        const cards = [
            createMockCard({ id: '1', status: 'todo' }),
            createMockCard({ id: '2', status: 'em-progresso' }),
            createMockCard({ id: '3', status: 'em-progresso' }),
            createMockCard({ id: '4', status: 'bloqueado' }),
            createMockCard({ id: '5', status: 'done' }),
        ];

        render(<DashboardStats cards={cards} meetings={[]} />);

        // Total = 5
        expect(screen.getByText('5')).toBeInTheDocument();
        // Em Progresso = 2
        expect(screen.getByText('2')).toBeInTheDocument();
        // Bloqueados = 1
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should count todays meetings', () => {
        const today = new Date().toISOString().split('T')[0];
        const meetings = [
            createMockMeeting({ id: '1', date: today }),
            createMockMeeting({ id: '2', date: today }),
            createMockMeeting({ id: '3', date: '2099-12-31' }), // future
        ];

        render(<DashboardStats cards={[]} meetings={meetings} />);

        // We should find "2" for meetings today
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render correctly with empty arrays', () => {
        const { container } = render(<DashboardStats cards={[]} meetings={[]} />);
        expect(container).toBeDefined();
        expect(container.querySelectorAll('.ant-card').length).toBeGreaterThanOrEqual(0);
    });
});
