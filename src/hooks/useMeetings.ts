import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Meeting } from '../types';

export function useMeetings(initialMeetings: Meeting[] = []) {
    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMeetings = useCallback(async (projectId?: string) => {
        try {
            setLoading(true);
            setError(null);
            
            let query = supabase
                .from('meetings')
                .select('*')
                .order('date', { ascending: true });

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setMeetings(data as Meeting[]);
        } catch (err) {
            console.error('Error fetching meetings:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    const createMeeting = async (meeting: Omit<Meeting, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('meetings')
                .insert(meeting)
                .select()
                .single();

            if (error) throw error;
            setMeetings(prev => [...prev, data as Meeting].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
            ));
            return data;
        } catch (err) {
            console.error('Error creating meeting:', err);
            throw err;
        }
    };

    const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
        const originalMeetings = [...meetings];
        
        setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

        try {
            const { error } = await supabase
                .from('meetings')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating meeting:', err);
            setMeetings(originalMeetings);
            throw err;
        }
    };

    const deleteMeeting = async (id: string) => {
        const originalMeetings = [...meetings];
        
        setMeetings(prev => prev.filter(m => m.id !== id));

        try {
            const { error } = await supabase
                .from('meetings')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error('Error deleting meeting:', err);
            setMeetings(originalMeetings);
            throw err;
        }
    };

    const confirmMeeting = async (id: string) => {
        return updateMeeting(id, { status: 'confirmed' });
    };

    const cancelMeeting = async (id: string) => {
        return updateMeeting(id, { status: 'canceled' });
    };

    const completeMeeting = async (id: string) => {
        return updateMeeting(id, { status: 'completed' });
    };

    const getTodayMeetings = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return meetings.filter(m => m.date === today);
    }, [meetings]);

    const getUpcomingMeetings = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return meetings.filter(m => m.date >= today && m.status !== 'canceled');
    }, [meetings]);

    return {
        meetings,
        loading,
        error,
        create: createMeeting,
        update: updateMeeting,
        remove: deleteMeeting,
        confirm: confirmMeeting,
        cancel: cancelMeeting,
        complete: completeMeeting,
        refresh: fetchMeetings,
        getTodayMeetings,
        getUpcomingMeetings
    };
}
