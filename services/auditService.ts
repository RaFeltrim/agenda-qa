// Comprehensive Audit Service for User Activity Logging
// Implements logging for all requested activities: edit, delete, archive, comments, downloads

import { supabase } from './supabaseClient';

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'COMMENT_ADD' | 'COMMENT_EDIT' | 'COMMENT_DELETE' | 'DOWNLOAD_KANBAN' | 'LOGIN' | 'LOGOUT';
  changed_by: string;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  additional_info?: Record<string, any> | null;
  created_at: string;
}

export interface AuditFilters {
  user_id?: string;
  table_name?: string;
  action?: string;
  record_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export class AuditService {
  // Main method to create audit logs
  static async logActivity(
    action: AuditLogEntry['action'],
    tableName: string,
    recordId: string,
    userId: string,
    oldValues?: Record<string, any> | null,
    newValues?: Record<string, any> | null,
    additionalInfo?: Record<string, any>
  ): Promise<void> {
    try {
      // Get client information
      const clientInfo = this.getClientInfo();
      
      const auditEntry: Omit<AuditLogEntry, 'id' | 'created_at'> = {
        table_name: tableName,
        record_id: recordId,
        action,
        changed_by: userId,
        old_values: oldValues ?? null,
        new_values: newValues ?? null,
        ip_address: clientInfo.ipAddress,
        user_agent: clientInfo.userAgent,
        session_id: clientInfo.sessionId,
        additional_info: additionalInfo ?? null
      };

      // Insert into database
      const { error } = await supabase
        .from('audit_logs')
        .insert(auditEntry);

      if (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error to avoid breaking main functionality
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Silent fail - audit logs shouldn't break main application
    }
  }

  // Specific logging methods for each activity type
  
  // Card Operations
  static async logCardEdit(cardId: string, userId: string, oldValues: Record<string, any>, newValues: Record<string, any>): Promise<void> {
    return this.logActivity('UPDATE', 'cards', cardId, userId, oldValues, newValues, {
      entity_type: 'card',
      operation: 'edit'
    });
  }

  static async logCardDelete(cardId: string, userId: string, cardData: Record<string, any>): Promise<void> {
    return this.logActivity('DELETE', 'cards', cardId, userId, cardData, null, {
      entity_type: 'card',
      operation: 'delete'
    });
  }

  static async logCardArchive(cardId: string, userId: string, oldStatus: string, newStatus: string): Promise<void> {
    return this.logActivity('ARCHIVE', 'cards', cardId, userId, 
      { status: oldStatus }, 
      { status: newStatus },
      {
        entity_type: 'card',
        operation: 'archive'
      }
    );
  }

  // Comment Operations
  static async logCommentAdd(commentId: string, cardId: string, userId: string, commentText: string): Promise<void> {
    return this.logActivity('COMMENT_ADD', 'card_comments', commentId, userId, null, 
      { card_id: cardId, text: commentText }, 
      {
        entity_type: 'comment',
        operation: 'add',
        parent_card_id: cardId
      }
    );
  }

  static async logCommentEdit(commentId: string, userId: string, oldText: string, newText: string): Promise<void> {
    return this.logActivity('COMMENT_EDIT', 'card_comments', commentId, userId,
      { text: oldText },
      { text: newText },
      {
        entity_type: 'comment',
        operation: 'edit'
      }
    );
  }

  static async logCommentDelete(commentId: string, userId: string, commentData: Record<string, any>): Promise<void> {
    return this.logActivity('COMMENT_DELETE', 'card_comments', commentId, userId, commentData, null, {
      entity_type: 'comment',
      operation: 'delete'
    });
  }

  // Download Operations
  static async logKanbanDownload(userId: string, filters: Record<string, any>, downloadFormat: string): Promise<void> {
    const downloadId = `download_${Date.now()}_${userId}`;
    return this.logActivity('DOWNLOAD_KANBAN', 'reports', downloadId, userId, null, 
      { 
        report_type: 'kanban_board',
        filters,
        format: downloadFormat,
        download_time: new Date().toISOString()
      },
      {
        entity_type: 'report',
        operation: 'download_kanban'
      }
    );
  }

  // Sprint Operations
  static async logSprintEdit(sprintId: string, userId: string, oldValues: Record<string, any>, newValues: Record<string, any>): Promise<void> {
    return this.logActivity('UPDATE', 'sprints', sprintId, userId, oldValues, newValues, {
      entity_type: 'sprint',
      operation: 'edit'
    });
  }

  static async logSprintArchive(sprintId: string, userId: string, oldStatus: string, newStatus: string): Promise<void> {
    return this.logActivity('ARCHIVE', 'sprints', sprintId, userId,
      { status: oldStatus },
      { status: newStatus },
      {
        entity_type: 'sprint',
        operation: 'archive'
      }
    );
  }

  // Authentication Operations
  static async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    return this.logActivity('LOGIN', 'auth', userId, userId, null, 
      { login_time: new Date().toISOString(), ip_address: ipAddress, user_agent: userAgent },
      { entity_type: 'auth', operation: 'login' }
    );
  }

  static async logLogout(userId: string): Promise<void> {
    return this.logActivity('LOGOUT', 'auth', userId, userId, null,
      { logout_time: new Date().toISOString() },
      { entity_type: 'auth', operation: 'logout' }
    );
  }

  // Bulk Operations
  static async logBulkOperation(
    operationType: string,
    entityType: string,
    userId: string,
    affectedRecords: string[],
    additionalInfo?: Record<string, any>
  ): Promise<void> {
    const bulkId = `bulk_${operationType}_${Date.now()}`;
    return this.logActivity(
      operationType as any,
      entityType,
      bulkId,
      userId,
      null,
      { 
        affected_records: affectedRecords,
        count: affectedRecords.length,
        operation_time: new Date().toISOString()
      },
      {
        entity_type: entityType,
        operation: `bulk_${operationType.toLowerCase()}`,
        ...additionalInfo
      }
    );
  }

  // Query Methods
  static async getAuditLogs(filters: AuditFilters = {}): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:changed_by(username, full_name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.user_id) {
        query = query.eq('changed_by', filters.user_id);
      }
      
      if (filters.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.record_id) {
        query = query.eq('record_id', filters.record_id);
      }
      
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      
      if (filters.limit) {
        query = query.range(
          filters.offset || 0,
          (filters.offset || 0) + filters.limit - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Audit logs query error:', error);
      return [];
    }
  }

  static async getEntityAuditTrail(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({
      table_name: entityType,
      record_id: entityId
    });
  }

  static async getUserActivity(userId: string, daysBack: number = 30): Promise<AuditLogEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    return this.getAuditLogs({
      user_id: userId,
      start_date: startDate.toISOString(),
      limit: 1000
    });
  }

  static async getRecentActivity(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ limit });
  }

  // Utility Methods
  private static getClientInfo(): { ipAddress: string; userAgent: string; sessionId: string } {
    // In a real implementation, you'd get this from the server or use a service
    // For now, we'll use placeholder values
    return {
      ipAddress: typeof window !== 'undefined' ? 
        (window as any).clientInformation?.ipAddress || '127.0.0.1' : '127.0.0.1',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      sessionId: typeof sessionStorage !== 'undefined' ? 
        sessionStorage.getItem('session_id') || `sess_${Date.now()}` : `sess_${Date.now()}`
    };
  }

  // Analytics Methods
  static async getActivitySummary(userId?: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('action, table_name, created_at');

      if (userId) {
        query = query.eq('changed_by', userId);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get activity summary:', error);
        return {};
      }

      // Process data for summary statistics
      const summary: any = {
        totalActions: data?.length || 0,
        actionsByType: {},
        actionsByTable: {},
        dailyActivity: {}
      };

      data?.forEach((log: any) => {
        // Count by action type
        summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
        
        // Count by table
        summary.actionsByTable[log.table_name] = (summary.actionsByTable[log.table_name] || 0) + 1;
        
        // Daily activity count
        const dateStr = new Date(log.created_at).toISOString().split('T')[0];
        if (dateStr) {
          summary.dailyActivity[dateStr] = (summary.dailyActivity[dateStr] || 0) + 1;
        }
      });

      return summary;
    } catch (error) {
      console.error('Activity summary error:', error);
      return {};
    }
  }
}