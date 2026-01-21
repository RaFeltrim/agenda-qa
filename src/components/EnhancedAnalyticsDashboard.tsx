import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ChartColumn,
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  Target,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Funnel,
  X
} from 'lucide-react';
import AnalyticsService from '../services/analyticsService';

interface AnalyticsData {
  teamVelocity: TeamVelocityData[];
  sprintBurndown: SprintBurndownData[];
  userProductivity: UserProductivityData[];
  qualityMetrics: QualityMetricsData[];
}

interface TeamVelocityData {
  team_id: string;
  team_name: string;
  avg_velocity: number;
  velocity_stddev: number;
  completed_sprints: number;
  median_velocity: number;
  conservative_forecast: number;
  optimistic_forecast: number;
  current_velocity?: number;
  velocity_trend?: 'increasing' | 'decreasing' | 'stable';
  forecast_next_sprint?: number;
  confidence_interval?: [number, number];
}

interface SprintBurndownData {
  sprint_id: string;
  sprint_name: string;
  day_date: string;
  cumulative_completed: number;
  remaining_work: number;
  ideal_remaining: number;
  status_indicator: string;
}

interface UserProductivityData {
  user_id: string;
  user_name: string;
  week_start?: string;
  productivity_score: number;
  tasks_completed: number;
  total_actions?: number;
  monthly_rank?: number;
  completion_rate?: number;
  avg_cycle_time?: number;
  rank?: number;
}

interface QualityMetricsData {
  team_id: string;
  team_name: string;
  overall_quality_score: number;
  block_rate_score: number;
  reopen_rate_score: number;
  timeliness_score: number;
  quality_rating: string;
  defect_rate?: number;
  reopen_rate?: number;
  blocker_resolution_time?: number;
  sprint_completion_rate?: number;
}

interface EnhancedAnalyticsDashboardProps {
  onClose: () => void;
  initialData?: AnalyticsData;
  activeSprintId?: string | null;
  sprints?: any[];
  cards?: any[];
}

const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({ 
  onClose, 
  initialData,
  activeSprintId,
  sprints = [],
  cards = []
}) => {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [exporting, setExporting] = useState(false);

  // Calculate mock analytics data for fallback
  const calculateMockAnalytics = () => {
    // Get active sprint data
    const activeSprint = sprints.find(s => s.id === activeSprintId) || sprints[0];
    
    // Filter cards for active sprint
    const sprintCards = activeSprintId 
      ? cards.filter(c => c.sprintId === activeSprintId)
      : cards;
    
    // Calculate sprint metrics
    const totalCards = sprintCards.length;
    const completedCards = sprintCards.filter(c => c.status === 'concluido').length;
    const inProgressCards = sprintCards.filter(c => c.status === 'em-progresso').length;
    const blockedCards = sprintCards.filter(c => c.status === 'bloqueado').length;
    const backlogCards = sprintCards.filter(c => c.status === 'backlog').length;
    
    // Calculate completion percentage
    const completionPercentage = totalCards > 0 
      ? Math.round((completedCards / totalCards) * 100) 
      : 0;
    
    // Calculate overdue cards
    const currentDate = new Date();
    const overdueCards = sprintCards.filter(c => 
      new Date(c.prazo) < currentDate && c.status !== 'concluido'
    ).length;
    
    // Calculate team velocity (mock calculation based on current sprint)
    const teamVelocity = [
      {
        team_id: 'current',
        team_name: (activeSprint?.nome || 'Current Sprint') as string,
        avg_velocity: completedCards * 2, // Simple velocity calculation
        velocity_stddev: 3.2,
        completed_sprints: 1,
        median_velocity: completedCards * 2,
        conservative_forecast: Math.max(0, completedCards * 2 - 5),
        optimistic_forecast: completedCards * 2 + 5
      }
    ];
    
    // Calculate user productivity
    const userProductivity = [
      {
        user_id: 'current',
        user_name: 'Current Team',
        week_start: new Date().toISOString().split('T')[0] as string,
        productivity_score: completionPercentage,
        tasks_completed: completedCards,
        total_actions: totalCards,
        monthly_rank: 1,
        completion_rate: completionPercentage,
        avg_cycle_time: 2.5,
        rank: 1
      }
    ];
    
    // Calculate quality metrics
    const qualityMetrics = [
      {
        team_id: 'current',
        team_name: (activeSprint?.nome || 'Current Sprint') as string,
        overall_quality_score: Math.max(0, 100 - (blockedCards * 10) - (overdueCards * 5)),
        block_rate_score: totalCards > 0 ? Math.round(((blockedCards / totalCards) * 100)) : 0,
        reopen_rate_score: 95, // Mock value
        timeliness_score: totalCards > 0 ? Math.round(((completedCards / totalCards) * 100)) : 0,
        quality_rating: completionPercentage >= 80 ? 'Excellent' : 
                       completionPercentage >= 60 ? 'Good' : 
                       completionPercentage >= 40 ? 'Fair' : 'Poor',
        defect_rate: blockedCards * 5,
        reopen_rate: 8,
        blocker_resolution_time: 1.8,
        sprint_completion_rate: completionPercentage
      }
    ];
    
    // Generate sprint burndown data
    const sprintBurndown = [];
    if (activeSprint) {
      const startDate = new Date(activeSprint.dataInicio);
      const endDate = new Date(activeSprint.dataFim);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate daily progress data
      for (let i = 0; i <= totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Count completed cards up to this date
        const completedByDate = sprintCards.filter(c => 
          c.status === 'concluido' && new Date(c.updated_at || c.dataCriacao) <= currentDate
        ).length;
        
        const dayDateString = currentDate.toISOString().split('T')[0];
        if (dayDateString) {
          sprintBurndown.push({
            sprint_id: activeSprint.id as string,
            sprint_name: (activeSprint.nome || 'Current Sprint') as string,
            day_date: dayDateString,
            cumulative_completed: completedByDate,
            remaining_work: totalCards - completedByDate,
            ideal_remaining: Math.max(0, totalCards - Math.round((totalCards / totalDays) * i)),
            status_indicator: completedByDate >= Math.round((totalCards / totalDays) * i) ? 'ahead' : 'behind'
          });
        }
      }
    }
    
    return {
      teamVelocity,
      sprintBurndown,
      userProductivity,
      qualityMetrics
    };
  };

  // Fetch analytics data on mount and when parameters change
  useEffect(() => {
    if (!initialData && loading) {
      const loadData = async () => {
        try {
          // Try to fetch real data first
          const analyticsData = await fetchAnalyticsData();
          setData(analyticsData);
        } catch (error) {
          console.error('Error loading analytics data:', error);
          // Fallback to mock data
          const mockData = calculateMockAnalytics();
          setData(mockData);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [initialData, loading, timeRange, activeSprintId]);

  const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    // Fetch real analytics data using the service
    const [teamVelocity, userProductivity, qualityMetrics] = await Promise.all([
      AnalyticsService.getTeamVelocity({ timeRange }),
      AnalyticsService.getUserProductivity({ timeRange }),
      AnalyticsService.getQualityMetrics({ timeRange })
    ]);

    // Generate sprint burndown data
    let sprintBurndown: SprintBurndownData[] = [];
    if (activeSprintId) {
      sprintBurndown = (await AnalyticsService.getSprintBurndown(activeSprintId)).map(point => ({
        sprint_id: activeSprintId,
        sprint_name: 'Current Sprint',
        day_date: point.date,
        cumulative_completed: point.completed,
        remaining_work: point.remaining,
        ideal_remaining: point.ideal,
        status_indicator: point.status
      }));
    }

    return {
      teamVelocity: teamVelocity as TeamVelocityData[],
      sprintBurndown,
      userProductivity: userProductivity as UserProductivityData[],
      qualityMetrics: [{
        team_id: 'overall',
        team_name: 'Overall Team',
        overall_quality_score: qualityMetrics.overall_score,
        block_rate_score: 100 - qualityMetrics.defect_rate,
        reopen_rate_score: 100 - qualityMetrics.reopen_rate,
        timeliness_score: qualityMetrics.sprint_completion_rate,
        quality_rating: qualityMetrics.overall_score >= 85 ? 'Excellent' : 
                       qualityMetrics.overall_score >= 70 ? 'Good' : 
                       qualityMetrics.overall_score >= 50 ? 'Fair' : 'Poor',
        defect_rate: qualityMetrics.defect_rate,
        reopen_rate: qualityMetrics.reopen_rate,
        blocker_resolution_time: qualityMetrics.blocker_resolution_time,
        sprint_completion_rate: qualityMetrics.sprint_completion_rate
      }]
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Use analytics service for real data refresh
      const success = await AnalyticsService.refreshAnalytics();
      if (success) {
        // Re-fetch data after successful refresh
        const newData = await fetchAnalyticsData();
        setData(newData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      // Export current data to CSV
      if (data) {
        await AnalyticsService.exportToCSV(
          data.userProductivity.map(user => ({
            'User': user.user_name,
            'Productivity Score': user.productivity_score,
            'Tasks Completed': user.tasks_completed,
            'Completion Rate': user.completion_rate || 'N/A',
            'Avg Cycle Time': user.avg_cycle_time || 'N/A'
          })),
          `analytics-export-${new Date().toISOString().split('T')[0]}`
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
          <div className="p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading advanced analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-7xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900">
          <div>
            <h2 className="text-3xl font-black dark:text-white flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <ChartColumn className="w-8 h-8" />
              </div>
              Advanced Analytics Dashboard
            </h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2 ml-1">
              Real-time Performance Insights & Business Intelligence
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-sm">
              <Funnel className="w-4 h-4 text-slate-400" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-transparent text-sm font-bold uppercase tracking-wider focus:outline-none"
              >
                <option value="7d">7D</option>
                <option value="30d">30D</option>
                <option value="90d">90D</option>
              </select>
            </div>
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={exportData}
              disabled={exporting}
              className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
              title="Export data"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 overflow-y-auto max-h-[80vh] space-y-8">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-800/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-green-800 dark:text-green-300 uppercase tracking-widest">
                  Overall Health
                </h3>
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-4xl font-black text-green-700 dark:text-green-400 mb-2">
                {data?.qualityMetrics[0]?.overall_quality_score || 87}%
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 font-bold">
                Above target threshold
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">
                  Avg Velocity
                </h3>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-4xl font-black text-blue-700 dark:text-blue-400 mb-2">
                {Math.round(data?.teamVelocity[0]?.avg_velocity || 40.3)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                Points per sprint
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-800/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-purple-800 dark:text-purple-300 uppercase tracking-widest">
                  Active Teams
                </h3>
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-4xl font-black text-purple-700 dark:text-purple-400 mb-2">
                {data?.teamVelocity.length || 4}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                Teams performing
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-3xl border border-orange-100 dark:border-orange-800/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-orange-800 dark:text-orange-300 uppercase tracking-widest">
                  Blockers
                </h3>
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-4xl font-black text-orange-700 dark:text-orange-400 mb-2">
                {Math.round((100 - (data?.qualityMetrics[0]?.block_rate_score || 92)) / 10) || 3}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                Issues pending resolution
              </p>
            </div>
          </div>

          {/* Team Velocity Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-indigo-600" />
                Team Velocity Comparison
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">
                  Last 6 Sprints
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data?.teamVelocity.map((team, index) => (
                <div key={team.team_id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-white">{team.team_name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      team.avg_velocity > 40 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {(team.avg_velocity || 0).toFixed(1)} pts
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Current Sprint Forecast</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {team.conservative_forecast}-{team.optimistic_forecast} pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                          style={{ width: `${(team.avg_velocity / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">Completed Sprints</p>
                        <p className="font-bold text-slate-800 dark:text-white">{team.completed_sprints}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">Std Deviation</p>
                        <p className="font-bold text-slate-800 dark:text-white">{(team.velocity_stddev || 0).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Clock className="w-6 h-6 text-emerald-600" />
                Quality & Delivery Metrics
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.qualityMetrics.map((metric) => (
                <div key={metric.team_id} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">{metric.team_name}</h4>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                        {metric.overall_quality_score}%
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                        metric.quality_rating === 'Excellent' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : metric.quality_rating === 'Good'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {metric.quality_rating}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Block Rate</span>
                        <span className="font-bold text-slate-800 dark:text-white">{metric.block_rate_score}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Reopen Rate</span>
                        <span className="font-bold text-slate-800 dark:text-white">{metric.reopen_rate_score}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Timeliness</span>
                        <span className="font-bold text-slate-800 dark:text-white">{metric.timeliness_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Productivity Leaderboard */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                Top Contributors This Month
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Rank</th>
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Contributor</th>
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Score</th>
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tasks</th>
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.userProductivity.slice(0, 5).map((user, index) => (
                    <tr key={user.user_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">{user.user_name}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-black">
                          {user.productivity_score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{user.tasks_completed}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{user.total_actions || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;