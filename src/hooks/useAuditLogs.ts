import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuditService, AuditFilters, AuditLogEntry } from '../services/auditService';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useAuditLogs(filters: AuditFilters = {}) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AuditService.getAuditLogs(filters);
            setLogs(data);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]); // Dependency on filters JSON string to strict comparison

    useEffect(() => {
        fetchLogs();

        // Set up Realtime subscription
        // Note: Complex filtering in Realtime is limited, so we often subscribe to the table
        // and filter client-side or re-fetch. For efficiency in this specific app,
        // we will re-fetch on any change to 'audit_logs' that strictly matches our criteria
        // or just listen to all changes on 'audit_logs' if the volume is low (which it is for now).

        // Optimisation: If we are filtering by record_id (e.g. Card Modal), we can filter the subscription event.
        let filterConfig: any = { event: '*', schema: 'public', table: 'audit_logs' };
        if (filters.record_id) {
            filterConfig.filter = `record_id=eq.${filters.record_id}`;
        }

        const channel: RealtimeChannel = supabase
            .channel(`audit_logs:${JSON.stringify(filters)}`)
            .on(
                'postgres_changes',
                filterConfig,
                () => {
                    // Simple strategy: Re-fetch list to ensure consistency with complex filters (joins, etc.)
                    fetchLogs();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchLogs, JSON.stringify(filters)]);

    return { logs, loading, error, refresh: fetchLogs };
}
