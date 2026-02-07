import { create } from 'zustand';
import { supabase, validateSession } from '../services/supabase';
import { toastError, toastSuccess } from '../lib/toast';
import { validateMeetingInput, sanitizeDate, sanitizeTime, sanitizeString } from '../lib/validation';
import dayjs from 'dayjs';

export interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    description?: string;
    status: 'a-agendar' | 'confirmada' | 'realizada';
    meetingLink?: string;
    createdBy?: string;
}

/** DB row type for meetings table (columns selected in fetchMeetings) */
interface MeetingDBRow {
    id: string;
    titulo: string;
    data: string;
    horario_inicio: string;
    descricao: string | null;
    status: string;
    link_reuniao: string | null;
    created_by: string;
}

interface MeetingStore {
    isModalOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
    meetings: Meeting[];
    loading: boolean;
    error: string | null;
    currentUserId: string | null;
    createMeeting: () => void;
    saveMeeting: (data: Partial<Meeting>) => Promise<void>;
    moveMeeting: (id: string, fromIndex: number, toIndex: number, newStatus: string) => Promise<void>;
    deleteMeeting: (id: string) => Promise<void>;
    fetchMeetings: () => Promise<void>;
    selectedMeeting: Meeting | null;
    setSelectedMeeting: (meeting: Meeting | null) => void;
    setCurrentUserId: (userId: string | null) => void;
}

const safeUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/** Insert audit log for meeting changes */
async function insertMeetingAuditLog(
    userId: string | null,
    action: string,
    meetingId: string,
    details: Record<string, unknown>
): Promise<void> {
    try {
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action,
            entity_type: 'meetings',
            entity_id: meetingId,
            details,
            created_at: new Date().toISOString()
        });
    } catch (err) {
        console.error('[MeetingAudit] Failed to insert audit log:', err);
    }
}

export const useMeetingStore = create<MeetingStore>((set, get) => ({
    meetings: [],
    loading: false,
    error: null,
    currentUserId: null,
    isModalOpen: false,
    selectedMeeting: null,

    setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
    setSelectedMeeting: (meeting) => set({ selectedMeeting: meeting }),
    setCurrentUserId: (userId) => set({ currentUserId: userId }),

    fetchMeetings: async () => {
        set({ loading: true, error: null });
        try {
            // Validate session before fetching
            const session = await validateSession();
            if (!session.isValid) {
                set({ error: 'Authentication required', loading: false });
                return;
            }

            // Select only required columns (avoid data leakage)
            const { data, error } = await supabase
                .from('meetings')
                .select('id, titulo, data, horario_inicio, descricao, status, link_reuniao, created_by')
                .is('deleted_at', null)
                .order('data', { ascending: false });

            if (error) throw error;

            const mappedMeetings = (data || []).map((m: MeetingDBRow) => ({
                id: m.id,
                title: m.titulo,
                date: m.data ? dayjs(m.data).format('YYYY-MM-DD') : '',
                time: m.horario_inicio || '',
                description: m.descricao || undefined,
                status: (m.status || 'a-agendar') as Meeting['status'],
                meetingLink: m.link_reuniao || undefined,
                createdBy: m.created_by
            })) as Meeting[];

            set({ meetings: mappedMeetings, currentUserId: session.userId });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar reuniões';
            console.error('Erro ao buscar reuniões:', error);
            set({ error: errorMessage });
        } finally {
            set({ loading: false });
        }
    },

    createMeeting: () => {
        set({ selectedMeeting: null, isModalOpen: true });
    },

    saveMeeting: async (data) => {
        const state = get();
        const isEdit = !!state.selectedMeeting;
        const previousMeetings = [...state.meetings]; // Store for rollback
        
        // Validate session
        const session = await validateSession();
        if (!session.isValid || !session.userId) {
            toastError('Sessão expirada. Por favor, faça login novamente.');
            set({ error: 'Authentication required' });
            return;
        }

        // Validate input data using validation utility
        const validation = validateMeetingInput({
            title: data.title,
            date: data.date,
            time: data.time,
            description: data.description,
            status: data.status,
            meetingLink: data.meetingLink
        });

        if (!validation.isValid) {
            const errorMsg = validation.errors.map(e => e.message).join(', ');
            toastError(`Dados inválidos: ${errorMsg}`);
            return;
        }

        let finalMeeting: Meeting;

        if (isEdit && state.selectedMeeting) {
            finalMeeting = { ...state.selectedMeeting, ...data } as Meeting;
            
            // Optimistic update
            set({
                meetings: state.meetings.map(m => m.id === finalMeeting.id ? finalMeeting : m),
                isModalOpen: false,
                selectedMeeting: null
            });

            const dbPayload = {
                titulo: sanitizeString(finalMeeting.title) || finalMeeting.title,
                data: sanitizeDate(finalMeeting.date) || dayjs(finalMeeting.date).format('YYYY-MM-DD'),
                horario_inicio: sanitizeTime(finalMeeting.time) || finalMeeting.time,
                descricao: sanitizeString(finalMeeting.description) || null,
                status: finalMeeting.status,
                link_reuniao: sanitizeString(finalMeeting.meetingLink) || null,
                updated_at: new Date().toISOString(),
                updated_by: session.userId
            };

            const { error } = await supabase
                .from('meetings')
                .update(dbPayload)
                .eq('id', finalMeeting.id);

            if (error) {
                console.error('Supabase update failed:', error);
                // Rollback to previous state
                set({ meetings: previousMeetings, error: error.message });
                toastError(`Erro ao atualizar reunião: ${error.message}`);
                return;
            } else {
                // Audit log for update
                await insertMeetingAuditLog(
                    session.userId,
                    'MEETING_UPDATED',
                    finalMeeting.id,
                    { title: finalMeeting.title, changes: data }
                );
                toastSuccess('Reunião atualizada com sucesso!');
            }

        } else {
            const newId = safeUUID();
            finalMeeting = {
                ...data,
                id: newId,
                status: (data.status as Meeting['status']) || 'a-agendar',
                createdBy: session.userId
            } as Meeting;

            // Optimistic update
            set({
                meetings: [...state.meetings, finalMeeting],
                isModalOpen: false
            });

            const dbPayload = {
                id: newId,
                titulo: sanitizeString(finalMeeting.title) || finalMeeting.title,
                data: sanitizeDate(finalMeeting.date) || dayjs(finalMeeting.date).format('YYYY-MM-DD'),
                horario_inicio: sanitizeTime(finalMeeting.time) || finalMeeting.time,
                descricao: sanitizeString(finalMeeting.description) || null,
                status: finalMeeting.status,
                link_reuniao: sanitizeString(finalMeeting.meetingLink) || null,
                created_by: session.userId,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('meetings').insert(dbPayload);
            
            if (error) {
                console.error('Supabase insert failed:', error);
                // Rollback to previous state
                set({ meetings: previousMeetings, error: error.message });
                toastError(`Erro ao criar reunião: ${error.message}`);
            } else {
                // Audit log for creation
                await insertMeetingAuditLog(
                    session.userId,
                    'MEETING_CREATED',
                    newId,
                    { title: finalMeeting.title }
                );
                toastSuccess('Reunião criada com sucesso!');
            }
        }
    },

    deleteMeeting: async (id) => {
        const state = get();
        const previousMeetings = [...state.meetings]; // Store for rollback
        
        // Validate session
        const session = await validateSession();
        if (!session.isValid || !session.userId) {
            toastError('Sessão expirada. Por favor, faça login novamente.');
            set({ error: 'Authentication required' });
            return;
        }

        const meetingToDelete = state.meetings.find(m => m.id === id);
        if (!meetingToDelete) return;

        // Optimistic update
        set({ meetings: state.meetings.filter(m => m.id !== id) });

        // Soft delete with updated_by tracking
        const { error } = await supabase
            .from('meetings')
            .update({
                deleted_at: new Date().toISOString(),
                updated_by: session.userId
            })
            .eq('id', id);

        if (error) {
            console.error('Supabase delete failed:', error);
            // Rollback to previous state
            set({ meetings: previousMeetings, error: error.message });
            toastError(`Erro ao excluir reunião: ${error.message}`);
        } else {
            // Audit log for deletion
            await insertMeetingAuditLog(
                session.userId,
                'MEETING_DELETED',
                id,
                { title: meetingToDelete.title }
            );
            toastSuccess('Reunião excluída com sucesso!');
        }
    },

    moveMeeting: async (id, _from, _to, newStatus) => {
        const state = get();
        const previousMeetings = [...state.meetings]; // Store for rollback
        const meeting = state.meetings.find(m => m.id === id);
        if (!meeting) return;

        const oldStatus = meeting.status;
        
        // Validate session
        const session = await validateSession();
        if (!session.isValid || !session.userId) {
            toastError('Sessão expirada. Por favor, faça login novamente.');
            set({ error: 'Authentication required' });
            return;
        }

        // Optimistic update
        set((state) => ({
            meetings: state.meetings.map(m =>
                m.id === id ? { ...m, status: newStatus as Meeting['status'] } : m
            )
        }));

        const { error } = await supabase
            .from('meetings')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
                updated_by: session.userId
            })
            .eq('id', id);

        if (error) {
            console.error('Failed to update status on server', error);
            // Rollback to previous state
            set({ meetings: previousMeetings, error: error.message });
            toastError(`Erro ao mover reunião: ${error.message}`);
        } else {
            // Audit log for status change
            await insertMeetingAuditLog(
                session.userId,
                'MEETING_STATUS_CHANGE',
                id,
                {
                    title: meeting.title,
                    old_status: oldStatus,
                    new_status: newStatus
                }
            );
        }
    }
}));
