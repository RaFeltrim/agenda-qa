// Analytics Service for Enhanced Dashboard
import { supabase } from './supabaseClient';

interface AnalyticsQueryParams {
  timeRange: '7d' | '30d' | '90d';
  teamId?: string;
  userId?: string;
}

interface SprintBurndownPoint {
  date: string;
  completed: number;
  remaining: number;
  ideal: number;
  status: 'ahead' | 'behind' | 'on-track';
}

interface TeamVelocityData {
  team_id: string;
  team_name: string;
  current_velocity: number;
  avg_velocity: number;
  velocity_trend: 'increasing' | 'decreasing' | 'stable';
  forecast_next_sprint: number;
  confidence_interval: [number, number];
}

interface UserProductivityData {
  user_id: string;
  user_name: string;
  productivity_score: number;
  tasks_completed: number;
  completion_rate: number;
  avg_cycle_time: number;
  rank: number;
}

interface QualityMetrics {
  overall_score: number;
  defect_rate: number;
  reopen_rate: number;
  blocker_resolution_time: number;
  sprint_completion_rate: number;
}

export class AnalyticsService {
  // Fetch sprint burndown data
  static async getSprintBurndown(sprintId: string): Promise<SprintBurndownPoint[]> {
    try {
      // In a real implementation, this would query materialized views or analytics tables
      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          status,
          updated_at,
          sprint_id
        `)
        .eq('sprint_id', sprintId);

      if (error) throw error;

      // Mock calculation for demo purposes
      const burndownData: SprintBurndownPoint[] = [];
      const totalCards = data?.length || 0;
      
      // Generate daily points (mock data)
      for (let i = 0; i < 10; i++) {
        const completed = Math.min(totalCards, Math.floor((totalCards * i) / 10) + Math.floor(Math.random() * 3));
        const remaining = totalCards - completed;
        const ideal = Math.max(0, totalCards - Math.floor((totalCards * i) / 10));
        
        const dateString = new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
        burndownData.push({
          date: dateString,
          completed,
          remaining,
          ideal,
          status: completed >= ideal ? 'ahead' : completed < ideal - 2 ? 'behind' : 'on-track'
        });
      }

      return burndownData;
    } catch (error) {
      console.error('Error fetching sprint burndown:', error);
      return [];
    }
  }

  // Fetch team velocity data
  static async getTeamVelocity(params: AnalyticsQueryParams): Promise<TeamVelocityData[]> {
    try {
      // Mock data for demonstration
      return [
        {
          team_id: 'team-1',
          team_name: 'Frontend Team',
          current_velocity: 42,
          avg_velocity: 38.5,
          velocity_trend: 'increasing',
          forecast_next_sprint: 45,
          confidence_interval: [40, 50]
        },
        {
          team_id: 'team-2',
          team_name: 'Backend Team',
          current_velocity: 35,
          avg_velocity: 33.2,
          velocity_trend: 'stable',
          forecast_next_sprint: 36,
          confidence_interval: [32, 40]
        },
        {
          team_id: 'team-3',
          team_name: 'QA Team',
          current_velocity: 28,
          avg_velocity: 26.8,
          velocity_trend: 'decreasing',
          forecast_next_sprint: 25,
          confidence_interval: [22, 28]
        }
      ];
    } catch (error) {
      console.error('Error fetching team velocity:', error);
      return [];
    }
  }

  // Fetch user productivity rankings
  static async getUserProductivity(params: AnalyticsQueryParams): Promise<UserProductivityData[]> {
    try {
      // Mock data for demonstration
      return [
        {
          user_id: 'user-1',
          user_name: 'Rafael Feltrim',
          productivity_score: 94,
          tasks_completed: 28,
          completion_rate: 93,
          avg_cycle_time: 2.3,
          rank: 1
        },
        {
          user_id: 'user-2',
          user_name: 'Mauricio Cordeiro',
          productivity_score: 87,
          tasks_completed: 24,
          completion_rate: 87,
          avg_cycle_time: 2.8,
          rank: 2
        },
        {
          user_id: 'user-3',
          user_name: 'Luiz Muller',
          productivity_score: 82,
          tasks_completed: 22,
          completion_rate: 82,
          avg_cycle_time: 3.1,
          rank: 3
        },
        {
          user_id: 'user-4',
          user_name: 'Fabiana Custódio',
          productivity_score: 78,
          tasks_completed: 19,
          completion_rate: 78,
          avg_cycle_time: 3.5,
          rank: 4
        },
        {
          user_id: 'user-5',
          user_name: 'João Paulo',
          productivity_score: 75,
          tasks_completed: 18,
          completion_rate: 75,
          avg_cycle_time: 3.8,
          rank: 5
        }
      ];
    } catch (error) {
      console.error('Error fetching user productivity:', error);
      return [];
    }
  }

  // Fetch quality metrics
  static async getQualityMetrics(params: AnalyticsQueryParams): Promise<QualityMetrics> {
    try {
      // Mock data for demonstration
      return {
        overall_score: 87,
        defect_rate: 8,
        reopen_rate: 12,
        blocker_resolution_time: 1.8,
        sprint_completion_rate: 85
      };
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      return {
        overall_score: 0,
        defect_rate: 0,
        reopen_rate: 0,
        blocker_resolution_time: 0,
        sprint_completion_rate: 0
      };
    }
  }

  // Export analytics data to CSV
  static async exportToCSV(data: any, filename: string): Promise<void> {
    try {
      // Convert data to CSV format
      const csvContent = this.convertToCSV(data);
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  }

  // Convert data to CSV format
  private static convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and wrap strings in quotes
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }

  // Refresh analytics data
  static async refreshAnalytics(): Promise<boolean> {
    try {
      // In a real implementation, this would trigger materialized view refresh
      // or call backend API endpoints to update analytics data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Analytics data refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      return false;
    }
  }

  // Get real-time analytics subscription
  static subscribeToAnalytics(callback: (data: any) => void) {
    // In a real implementation, this would use Supabase real-time subscriptions
    // to listen for analytics data changes
    
    console.log('Subscribed to analytics updates');
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribed from analytics updates');
    };
  }
}

export default AnalyticsService;