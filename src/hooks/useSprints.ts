import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Sprint } from '../types';

export function useSprints(initialSprints: Sprint[] = []) {
    const [sprints, setSprints] = useState<Sprint[]>(initialSprints);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSprints = useCallback(async (projectId?: string) => {
        try {
            setLoading(true);
            setError(null);
            
            let query = supabase
                .from('sprints')
                .select('*')
                .order('data_inicio', { ascending: false });

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setSprints(data as Sprint[]);
        } catch (err) {
            console.error('Error fetching sprints:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch sprints');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSprints();
    }, [fetchSprints]);

    const createSprint = async (sprint: Omit<Sprint, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('sprints')
                .insert(sprint)
                .select()
                .single();

            if (error) throw error;
            setSprints(prev => [data as Sprint, ...prev]);
            return data;
        } catch (err) {
            console.error('Error creating sprint:', err);
            throw err;
        }
    };

    const updateSprint = async (id: string, updates: Partial<Sprint>) => {
        const originalSprints = [...sprints];
        
        // Optimistic update
        setSprints(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

        try {
            const { error } = await supabase
                .from('sprints')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating sprint:', err);
            setSprints(originalSprints);
            throw err;
        }
    };

    const deleteSprint = async (id: string) => {
        const originalSprints = [...sprints];
        
        // Optimistic delete
        setSprints(prev => prev.filter(s => s.id !== id));

        try {
            const { error } = await supabase
                .from('sprints')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error('Error deleting sprint:', err);
            setSprints(originalSprints);
            throw err;
        }
    };

    const completeSprint = async (id: string) => {
        return updateSprint(id, { status: 'completed' });
    };

    const archiveSprint = async (id: string) => {
        return updateSprint(id, { status: 'archived' });
    };

    const getActiveSprint = useCallback(() => {
        return sprints.find(s => s.status === 'active');
    }, [sprints]);

    return {
        sprints,
        loading,
        error,
        create: createSprint,
        update: updateSprint,
        remove: deleteSprint,
        complete: completeSprint,
        archive: archiveSprint,
        refresh: fetchSprints,
        getActiveSprint
    };
}
