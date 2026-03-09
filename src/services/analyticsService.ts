import { supabase } from './supabase';

export interface AnalyticsData {
  totalCards: number;
  cardsByStatus: Record<string, number>;
  cardsByPriority: Record<string, number>;
  totalProjects: number;
  totalSprints: number;
  activeSprint: number;
  completedSprints: number;
  totalMeetings: number;
  upcomingMeetings: number;
}

export interface TeamMetrics {
  memberId: string;
  memberName: string;
  cardsCompleted: number;
  cardsInProgress: number;
  cardsBlocked: number;
}

export interface SprintMetrics {
  sprintId: string;
  sprintName: string;
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  blockedCards: number;
  completionRate: number;
}

export const analyticsService = {
  async getDashboardAnalytics(): Promise<AnalyticsData> {
    try {
      // Get cards count
      const { count: totalCards } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      // Get cards by status
      const { data: cards } = await supabase
        .from('cards')
        .select('status, priority');

      const cardsByStatus: Record<string, number> = {
        todo: 0,
        'in-progress': 0,
        done: 0,
        backlog: 0,
        blocked: 0,
      };

      const cardsByPriority: Record<string, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      cards?.forEach(card => {
        if (card.status in cardsByStatus) {
          cardsByStatus[card.status]++;
        }
        if (card.priority in cardsByPriority) {
          cardsByPriority[card.priority]++;
        }
      });

      // Get projects count
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Get sprints count
      const { count: totalSprints } = await supabase
        .from('sprints')
        .select('*', { count: 'exact', head: true });

      // Get active sprints
      const { count: activeSprint } = await supabase
        .from('sprints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get completed sprints
      const { count: completedSprints } = await supabase
        .from('sprints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get meetings count
      const { count: totalMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true });

      // Get upcoming meetings
      const today = new Date().toISOString().split('T')[0];
      const { count: upcomingMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .gte('date', today)
        .neq('status', 'canceled');

      return {
        totalCards: totalCards || 0,
        cardsByStatus,
        cardsByPriority,
        totalProjects: totalProjects || 0,
        totalSprints: totalSprints || 0,
        activeSprint: activeSprint || 0,
        completedSprints: completedSprints || 0,
        totalMeetings: totalMeetings || 0,
        upcomingMeetings: upcomingMeetings || 0,
      };
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return {
        totalCards: 0,
        cardsByStatus: {},
        cardsByPriority: {},
        totalProjects: 0,
        totalSprints: 0,
        activeSprint: 0,
        completedSprints: 0,
        totalMeetings: 0,
        upcomingMeetings: 0,
      };
    }
  },

  async getTeamMetrics(): Promise<TeamMetrics[]> {
    try {
      const { data: cards, error } = await supabase
        .from('cards')
        .select('assignee_id, status');

      if (error) throw error;

      const metricsMap: Record<string, TeamMetrics> = {};

      cards?.forEach(card => {
        if (!card.assignee_id) return;

        if (!metricsMap[card.assignee_id]) {
          metricsMap[card.assignee_id] = {
            memberId: card.assignee_id,
            memberName: card.assignee_id.split('@')[0],
            cardsCompleted: 0,
            cardsInProgress: 0,
            cardsBlocked: 0,
          };
        }

        if (card.status === 'done' || card.status === 'concluido') {
          metricsMap[card.assignee_id].cardsCompleted++;
        } else if (card.status === 'in-progress' || card.status === 'em-progresso') {
          metricsMap[card.assignee_id].cardsInProgress++;
        } else if (card.status === 'blocked' || card.status === 'bloqueado') {
          metricsMap[card.assignee_id].cardsBlocked++;
        }
      });

      return Object.values(metricsMap);
    } catch (error) {
      console.error('Failed to fetch team metrics:', error);
      return [];
    }
  },

  async getSprintMetrics(sprintId: string): Promise<SprintMetrics | null> {
    try {
      const { data: sprint } = await supabase
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single();

      if (!sprint) return null;

      const { data: cards } = await supabase
        .from('cards')
        .select('status')
        .eq('sprint_id', sprintId);

      const totalCards = cards?.length || 0;
      const completedCards = cards?.filter(c => 
        c.status === 'done' || c.status === 'concluido'
      ).length || 0;
      const inProgressCards = cards?.filter(c => 
        c.status === 'in-progress' || c.status === 'em-progresso'
      ).length || 0;
      const blockedCards = cards?.filter(c => 
        c.status === 'blocked' || c.status === 'bloqueado'
      ).length || 0;

      return {
        sprintId,
        sprintName: sprint.name || sprint.nome || 'Unknown',
        totalCards,
        completedCards,
        inProgressCards,
        blockedCards,
        completionRate: totalCards > 0 ? (completedCards / totalCards) * 100 : 0,
      };
    } catch (error) {
      console.error('Failed to fetch sprint metrics:', error);
      return null;
    }
  },
};
