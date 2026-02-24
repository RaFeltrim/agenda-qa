import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useCardStore } from '../store/cardStore';

/**
 * useRealtimeCards
 * V3: Subscribes to Supabase Realtime for live card updates.
 * Requires migration 002_v3_indexes_and_realtime.sql to be applied.
 *
 * NOTE: Only activate after migrating Supabase to Pro plan.
 * Free tier Realtime is limited to 2 concurrent connections.
 */
export function useRealtimeCards(projectId?: string) {
    const refreshCards = useCardStore((s) => s.fetchCards);

    useEffect(() => {
        // Guard: only subscribe if Realtime is explicitly enabled via feature flag
        if (import.meta.env.VITE_ENABLE_REALTIME !== 'true') return;

        const channel = supabase
            .channel('realtime:cards')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'cards',
                    ...(projectId ? { filter: `project_id=eq.${projectId}` } : {}),
                },
                (payload) => {
                    console.debug('[Realtime] cards change:', payload.eventType);
                    refreshCards(); // Re-fetch cards on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, refreshCards]);
}
