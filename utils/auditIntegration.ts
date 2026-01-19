// Integration Examples for Audit Logging
// Demonstrates how to add audit logging to existing components

import { AuditService } from '../services/auditService';

// Example 1: Adding audit logging to Card operations
export class CardAuditIntegration {
  // Original card update function
  static async updateCardOriginal(cardId: string, updates: any, currentUser: any) {
    // ... existing card update logic
    const response = await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    
    return response.json();
  }

  // Enhanced card update with audit logging
  static async updateCardWithAudit(cardId: string, updates: any, currentUser: any) {
    try {
      // Get current card data for audit trail
      const currentCard = await this.getCurrentCardData(cardId);
      
      // Perform the actual update
      const updatedCard = await this.updateCardOriginal(cardId, updates, currentUser);
      
      // Log the audit entry
      await AuditService.logCardEdit(
        cardId,
        currentUser.id,
        currentCard,
        updatedCard
      );
      
      return updatedCard;
    } catch (error) {
      console.error('Card update failed:', error);
      throw error;
    }
  }

  private static async getCurrentCardData(cardId: string) {
    const response = await fetch(`/api/cards/${cardId}`);
    return response.json();
  }
}

// Example 2: Adding audit logging to Comment operations
export class CommentAuditIntegration {
  // Add comment with audit logging
  static async addCommentWithAudit(cardId: string, commentText: string, currentUser: any) {
    try {
      // Create comment
      const response = await fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          card_id: cardId,
          text: commentText,
          author_id: currentUser.id
        })
      });
      
      const newComment = await response.json();
      
      // Log audit entry
      await AuditService.logCommentAdd(
        newComment.id,
        cardId,
        currentUser.id,
        commentText
      );
      
      return newComment;
    } catch (error) {
      console.error('Comment creation failed:', error);
      throw error;
    }
  }

  // Edit comment with audit logging
  static async editCommentWithAudit(commentId: string, newText: string, currentUser: any) {
    try {
      // Get current comment data
      const currentComment = await this.getCommentData(commentId);
      
      // Update comment
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ text: newText })
      });
      
      const updatedComment = await response.json();
      
      // Log audit entry
      await AuditService.logCommentEdit(
        commentId,
        currentUser.id,
        currentComment.text,
        newText
      );
      
      return updatedComment;
    } catch (error) {
      console.error('Comment update failed:', error);
      throw error;
    }
  }

  private static async getCommentData(commentId: string) {
    const response = await fetch(`/api/comments/${commentId}`);
    return response.json();
  }
}

// Example 3: Adding audit logging to Sprint operations
export class SprintAuditIntegration {
  // Archive sprint with audit logging
  static async archiveSprintWithAudit(sprintId: string, currentUser: any) {
    try {
      // Get current sprint data
      const currentSprint = await this.getSprintData(sprintId);
      
      // Archive sprint
      const response = await fetch(`/api/sprints/${sprintId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'archived' })
      });
      
      const archivedSprint = await response.json();
      
      // Log audit entry
      await AuditService.logSprintArchive(
        sprintId,
        currentUser.id,
        currentSprint.status,
        'archived'
      );
      
      return archivedSprint;
    } catch (error) {
      console.error('Sprint archival failed:', error);
      throw error;
    }
  }

  private static async getSprintData(sprintId: string) {
    const response = await fetch(`/api/sprints/${sprintId}`);
    return response.json();
  }
}

// Example 4: Adding audit logging to Report downloads
export class ReportAuditIntegration {
  // Download Kanban report with audit logging
  static async downloadKanbanReportWithAudit(filters: any, format: string, currentUser: any) {
    try {
      // Generate and download report (existing logic)
      const blob = await this.generateKanbanReport(filters, format);
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kanban-report-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Log audit entry
      await AuditService.logKanbanDownload(
        currentUser.id,
        filters,
        format
      );
      
    } catch (error) {
      console.error('Report download failed:', error);
      throw error;
    }
  }

  private static async generateKanbanReport(filters: any, format: string) {
    // Existing report generation logic
    const response = await fetch('/api/reports/kanban', {
      method: 'POST',
      body: JSON.stringify({ filters, format })
    });
    
    return response.blob();
  }
}

// Example 5: Hook for easy integration in React components
import { useCallback } from 'react';

export const useAuditLogging = (currentUser: any) => {
  const logCardEdit = useCallback(async (cardId: string, oldData: any, newData: any) => {
    if (currentUser?.id) {
      await AuditService.logCardEdit(cardId, currentUser.id, oldData, newData);
    }
  }, [currentUser]);

  const logCardDelete = useCallback(async (cardId: string, cardData: any) => {
    if (currentUser?.id) {
      await AuditService.logCardDelete(cardId, currentUser.id, cardData);
    }
  }, [currentUser]);

  const logCommentAdd = useCallback(async (commentId: string, cardId: string, commentText: string) => {
    if (currentUser?.id) {
      await AuditService.logCommentAdd(commentId, cardId, currentUser.id, commentText);
    }
  }, [currentUser]);

  const logKanbanDownload = useCallback(async (filters: any, format: string) => {
    if (currentUser?.id) {
      await AuditService.logKanbanDownload(currentUser.id, filters, format);
    }
  }, [currentUser]);

  return {
    logCardEdit,
    logCardDelete,
    logCommentAdd,
    logKanbanDownload
  };
};

// Usage example in a React component:
/*
import { useAuditLogging } from '../utils/auditIntegration';

function CardEditor({ card, currentUser }) {
  const { logCardEdit } = useAuditLogging(currentUser);
  
  const handleSave = async (updatedData) => {
    // Save card logic here...
    
    // Log the edit
    await logCardEdit(card.id, card, updatedData);
  };
  
  return (
    // JSX for card editor
  );
}
*/