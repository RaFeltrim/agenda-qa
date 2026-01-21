import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useSupabaseData<T>(
    tableName: string,
    orderBy: string = 'created_at',
    initialData: T[] = []
) {
    const [data, setData] = useState<T[]>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const { data: result, error: fetchError } = await supabase
                .from(tableName)
                .select('*')
                .order(orderBy, { ascending: false });

            if (fetchError) throw fetchError;
            setData(result as T[]);
        } catch (err: any) {
            setError(err.message);
            console.error(`Error fetching ${tableName}:`, err);
        } finally {
            setLoading(false);
        }
    }, [tableName, orderBy]);

    useEffect(() => {
        fetchData();

        // Set up Realtime subscription
        const channel: RealtimeChannel = supabase
            .channel(`public:${tableName}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setData((prev) => [payload.new as T, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setData((prev) =>
                            prev.map((item: any) =>
                                item.id === payload.new.id ? payload.new : item
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setData((prev) =>
                            prev.filter((item: any) => item.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableName, fetchData]);

    const create = async (item: Omit<T, 'id'>) => {
        const { data: newItem, error } = await supabase
            .from(tableName)
            .insert(item)
            .select()
            .single();

        if (error) {
            setError(error.message);
            throw error;
        }
        return newItem;
    };

    const update = async (id: string, updates: Partial<T>) => {
        const { data: updatedItem, error } = await supabase
            .from(tableName)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            setError(error.message);
            throw error;
        }
        return updatedItem;
    };

    const remove = async (id: string) => {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
            setError(error.message);
            throw error;
        }
    };

    return { data, loading, error, create, update, remove, refresh: fetchData };
}
