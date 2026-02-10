import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { toastError, toastSuccess } from '../lib/toast';
import type { Sprint } from '../types';

/** DB row type for sprints table */
interface SprintDBRow {
    id: string;
    nome: string;
    objetivo: string | null;
    data_inicio: string;
    data_fim: string;
    status: string;
    project_id: string | null;
    created_by: string;
    deleted_at: string | null;
}

/** Map DB row to frontend Sprint type */
function mapFromDB(row: SprintDBRow): Sprint {
    return {
        id: row.id,
        name: row.nome,
        goal: row.objetivo || '',
        startDate: row.data_inicio,
        endDate: row.data_fim,
        status: (row.status as Sprint['status']) || 'planning',
        projectId: row.project_id,
    };
}

interface SprintStore {
    sprints: Sprint[];
    activeSprintId: string | null;
    loading: boolean;

    fetchSprints: () => Promise<void>;
    addSprint: (sprint: Omit<Sprint, 'id' | 'status'> & { id?: string; status?: Sprint['status'] }) => Promise<void>;
    updateSprint: (id: string, updates: Partial<Sprint>) => Promise<void>;
    setActiveSprint: (id: string | null) => void;
    archiveSprint: (id: string) => Promise<void>;
}

export const useSprintStore = create<SprintStore>((set) => ({
    sprints: [],
    activeSprintId: null,
    loading: false,

    fetchSprints: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('sprints')
                .select('id, nome, objetivo, data_inicio, data_fim, status, project_id, created_by, deleted_at')
                .is('deleted_at', null)
                .order('data_inicio', { ascending: false });

            if (error) {
                // Gracefully handle missing table
                if (error.code === 'PGRST205') {
                    console.warn('[SprintStore] Table "sprints" not found — run migration SQL');
                } else {
                    console.error('[SprintStore] fetchSprints error:', error);
                }
                set({ loading: false, sprints: [] });
                return;
            }

            const sprints = (data || []).map(mapFromDB);
            const activeSprint = sprints.find((s) => s.status === 'active');

            set({
                sprints,
                activeSprintId: activeSprint?.id || null,
                loading: false,
            });
        } catch (err) {
            console.error('[SprintStore] fetchSprints exception:', err);
            toastError('Erro inesperado ao carregar sprints');
            set({ loading: false });
        }
    },

    addSprint: async (newSprintData) => {
        try {
            const { data: session } = await supabase.auth.getSession();
            const userId = session?.session?.user?.id;
            if (!userId) {
                toastError('Login necessário para criar sprint');
                return;
            }

            const { data, error } = await supabase
                .from('sprints')
                .insert({
                    nome: newSprintData.name,
                    objetivo: newSprintData.goal || null,
                    data_inicio: newSprintData.startDate,
                    data_fim: newSprintData.endDate,
                    status: newSprintData.status || 'planning',
                    project_id: newSprintData.projectId || null,
                    created_by: userId,
                })
                .select()
                .single();

            if (error) {
                console.error('[SprintStore] addSprint error:', error);
                toastError('Erro ao criar sprint');
                return;
            }

            const newSprint = mapFromDB(data as SprintDBRow);
            set((state) => ({
                sprints: [newSprint, ...state.sprints],
            }));
            toastSuccess('Sprint criada com sucesso');
        } catch (err) {
            console.error('[SprintStore] addSprint exception:', err);
            toastError('Erro inesperado ao criar sprint');
        }
    },

    updateSprint: async (id, updates) => {
        try {
            const dbUpdates: Record<string, unknown> = {};
            if (updates.name !== undefined) dbUpdates.nome = updates.name;
            if (updates.goal !== undefined) dbUpdates.objetivo = updates.goal;
            if (updates.startDate !== undefined) dbUpdates.data_inicio = updates.startDate;
            if (updates.endDate !== undefined) dbUpdates.data_fim = updates.endDate;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

            const { error } = await supabase
                .from('sprints')
                .update(dbUpdates)
                .eq('id', id);

            if (error) {
                console.error('[SprintStore] updateSprint error:', error);
                toastError('Erro ao atualizar sprint');
                return;
            }

            set((state) => ({
                sprints: state.sprints.map((s) => (s.id === id ? { ...s, ...updates } : s)),
            }));
            toastSuccess('Sprint atualizada');
        } catch (err) {
            console.error('[SprintStore] updateSprint exception:', err);
            toastError('Erro inesperado ao atualizar sprint');
        }
    },

    setActiveSprint: (id) => {
        set({ activeSprintId: id });
    },

    archiveSprint: async (id) => {
        try {
            const { error } = await supabase
                .from('sprints')
                .update({ status: 'archived' })
                .eq('id', id);

            if (error) {
                console.error('[SprintStore] archiveSprint error:', error);
                toastError('Erro ao arquivar sprint');
                return;
            }

            set((state) => ({
                sprints: state.sprints.map((s) =>
                    s.id === id ? { ...s, status: 'archived' as const } : s
                ),
            }));
            toastSuccess('Sprint arquivada');
        } catch (err) {
            console.error('[SprintStore] archiveSprint exception:', err);
            toastError('Erro inesperado ao arquivar sprint');
        }
    },
}));
