import { supabase } from './supabase';
import type { AuditLog } from '../types';

export const auditService = {
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Audit log: No user found, skipping audit log');
        return;
      }

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        user_name: user.email?.split('@')[0] || 'Unknown',
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  },

  async getAuditLogs(
    entityType?: string,
    entityId?: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  },

  async getUserActivity(userId: string, limit: number = 20): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      return [];
    }
  },

  // Card-specific audit logging
  async logCardAction(
    action: string,
    cardId: string,
    userId: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    await this.logAction(action, 'card', cardId, { ...details, userId });
  },

  // Project-specific audit logging
  async logProjectAction(
    action: string,
    projectId: string,
    userId: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    await this.logAction(action, 'project', projectId, { ...details, userId });
  },

  // Sprint-specific audit logging
  async logSprintAction(
    action: string,
    sprintId: string,
    userId: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    await this.logAction(action, 'sprint', sprintId, { ...details, userId });
  },
};
