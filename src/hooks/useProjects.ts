import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Project } from '../types';

export function useProjects(initialProjects: Project[] = []) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data as Project[]);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const createProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert(project)
                .select()
                .single();

            if (error) throw error;
            setProjects(prev => [data as Project, ...prev]);
            return data;
        } catch (err) {
            console.error('Error creating project:', err);
            throw err;
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        const originalProjects = [...projects];
        
        // Optimistic update
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        try {
            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating project:', err);
            setProjects(originalProjects);
            throw err;
        }
    };

    const deleteProject = async (id: string) => {
        const originalProjects = [...projects];
        
        // Optimistic delete
        setProjects(prev => prev.filter(p => p.id !== id));

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error('Error deleting project:', err);
            setProjects(originalProjects);
            throw err;
        }
    };

    return {
        projects,
        loading,
        error,
        create: createProject,
        update: updateProject,
        remove: deleteProject,
        refresh: fetchProjects
    };
}
