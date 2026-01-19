-- 999_analytics_schema.sql
-- Analytics schema and materialized views for Agenda-QA v3.0
-- Author: Senior Data Engineer
-- Date: 2026-01-17

-- Create schema for analytics (if not exists)
CREATE SCHEMA IF NOT EXISTS analytics;

-- Materialized view for team velocity metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_team_velocity AS
WITH sprint_data AS (
  SELECT 
    s.team_id,
    s.id as sprint_id,
    s.name as sprint_name,
    s.start_date,
    s.end_date,
    COUNT(c.id) FILTER (WHERE c.status = 'concluido') as completed_tasks,
    COALESCE(SUM(c.story_points) FILTER (WHERE c.status = 'concluido'), 0) as velocity_points,
    COUNT(c.id) FILTER (WHERE c.status IN ('backlog', 'em-progresso', 'bloqueado')) as remaining_tasks,
    COUNT(c.id) as total_tasks
  FROM public.sprints s
  LEFT JOIN public.cards c ON s.id = c.sprint_id
  WHERE s.status IN ('completed', 'active')
  GROUP BY s.team_id, s.id, s.name, s.start_date, s.end_date
)
SELECT 
  sd.team_id,
  t.name as team_name,
  AVG(sd.velocity_points) as avg_velocity,
  STDDEV(sd.velocity_points) as velocity_stddev,
  COUNT(*) as completed_sprints,
  MAX(sd.velocity_points) as max_velocity,
  MIN(sd.velocity_points) as min_velocity,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sd.velocity_points) as median_velocity,
  -- Predictive metrics
  ROUND(AVG(sd.velocity_points) * 0.8, 0) as conservative_forecast,
  ROUND(AVG(sd.velocity_points) * 1.2, 0) as optimistic_forecast,
  NOW() as last_updated
FROM sprint_data sd
JOIN public.teams t ON sd.team_id = t.id
WHERE sd.velocity_points > 0  -- Only count sprints with actual work
GROUP BY sd.team_id, t.name
HAVING COUNT(*) >= 2  -- Need at least 2 sprints for meaningful metrics
ORDER BY avg_velocity DESC;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_team_velocity_team 
ON analytics.mv_team_velocity(team_id);

-- Materialized view for sprint burndown data
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_sprint_burndown AS
WITH sprint_calendar AS (
  SELECT 
    s.id as sprint_id,
    s.name as sprint_name,
    s.team_id,
    generate_series(
      s.start_date::date, 
      s.end_date::date, 
      '1 day'::interval
    )::date as day_date,
    s.velocity_goal,
    s.start_date,
    s.end_date
  FROM public.sprints s
  WHERE s.status IN ('active', 'completed', 'review')
),
daily_progress AS (
  SELECT 
    sc.sprint_id,
    sc.sprint_name,
    sc.team_id,
    sc.day_date,
    sc.velocity_goal,
    COUNT(c.id) FILTER (
      WHERE c.status = 'concluido' 
      AND c.updated_at::date <= sc.day_date
    ) as cumulative_completed,
    COUNT(c.id) FILTER (
      WHERE c.status IN ('backlog', 'em-progresso', 'bloqueado')
      OR (c.status = 'concluido' AND c.updated_at::date > sc.day_date)
    ) as remaining_work,
    COUNT(c.id) as total_work
  FROM sprint_calendar sc
  LEFT JOIN public.cards c ON c.sprint_id = sc.sprint_id
  GROUP BY sc.sprint_id, sc.sprint_name, sc.team_id, sc.day_date, sc.velocity_goal
)
SELECT 
  dp.sprint_id,
  dp.sprint_name,
  dp.team_id,
  t.name as team_name,
  dp.day_date,
  dp.velocity_goal,
  dp.cumulative_completed,
  dp.remaining_work,
  dp.total_work,
  -- Ideal burndown line
  ROUND(
    dp.total_work::decimal * 
    (1 - (dp.day_date - dp.start_date)::decimal / 
    GREATEST((dp.end_date - dp.start_date)::decimal, 1))
  ) as ideal_remaining,
  -- Health indicators
  CASE 
    WHEN dp.remaining_work <= ROUND(
      dp.total_work::decimal * 
      (1 - (dp.day_date - dp.start_date)::decimal / 
      GREATEST((dp.end_date - dp.start_date)::decimal, 1))
    ) THEN 'On Track'
    WHEN dp.remaining_work <= ROUND(
      dp.total_work::decimal * 
      (1 - (dp.day_date - dp.start_date)::decimal / 
      GREATEST((dp.end_date - dp.start_date)::decimal, 1)) * 1.2
    ) THEN 'Slightly Behind'
    ELSE 'Behind Schedule'
  END as status_indicator,
  NOW() as last_updated
FROM daily_progress dp
JOIN public.teams t ON dp.team_id = t.id
ORDER BY dp.sprint_id, dp.day_date;

-- Index for burndown queries
CREATE INDEX IF NOT EXISTS idx_mv_sprint_burndown_sprint 
ON analytics.mv_sprint_burndown(sprint_id, day_date);

-- Materialized view for user productivity metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_user_productivity AS
WITH user_activities AS (
  SELECT 
    p.id as user_id,
    p.name as user_name,
    p.email,
    DATE_TRUNC('week', al.created_at) as week_start,
    COUNT(*) FILTER (WHERE al.action = 'INSERT') as creations,
    COUNT(*) FILTER (WHERE al.action = 'UPDATE') as updates,
    COUNT(*) FILTER (WHERE al.action = 'DELETE') as deletions,
    COUNT(DISTINCT DATE_TRUNC('day', al.created_at)) as active_days,
    COUNT(*) as total_actions,
    -- Task completion metrics
    COUNT(DISTINCT CASE 
      WHEN al.table_name = 'cards' AND al.new_values->>'status' = '"concluido"' 
      THEN al.record_id 
    END) as tasks_completed,
    -- Time-based activity patterns
    EXTRACT(HOUR FROM al.created_at) as hour_of_day,
    EXTRACT(DOW FROM al.created_at) as day_of_week
  FROM public.profiles p
  JOIN public.audit_logs al ON p.id = al.changed_by
  WHERE al.created_at >= CURRENT_DATE - INTERVAL '90 days'
    AND p.is_active = TRUE
  GROUP BY p.id, p.name, p.email, DATE_TRUNC('week', al.created_at)
),
weekly_stats AS (
  SELECT 
    ua.user_id,
    ua.user_name,
    ua.week_start,
    ua.creations,
    ua.updates,
    ua.deletions,
    ua.total_actions,
    ua.tasks_completed,
    ua.active_days,
    -- Productivity score calculation
    ROUND(
      (ua.total_actions::decimal / 5 + 
       ua.tasks_completed * 2 +
       ua.active_days * 3) / 3, 2
    ) as productivity_score,
    -- Activity balance
    ROUND(
      (ua.creations::decimal / NULLIF(ua.total_actions, 0)) * 100, 2
    ) as creation_percentage,
    ROUND(
      (ua.updates::decimal / NULLIF(ua.total_actions, 0)) * 100, 2
    ) as update_percentage
  FROM user_activities ua
)
SELECT 
  ws.user_id,
  ws.user_name,
  p.email,
  ws.week_start,
  ws.creations,
  ws.updates,
  ws.deletions,
  ws.total_actions,
  ws.tasks_completed,
  ws.active_days,
  ws.productivity_score,
  ws.creation_percentage,
  ws.update_percentage,
  -- Trend analysis
  LAG(ws.productivity_score) OVER (
    PARTITION BY ws.user_id 
    ORDER BY ws.week_start
  ) as previous_week_score,
  ws.productivity_score - LAG(ws.productivity_score) OVER (
    PARTITION BY ws.user_id 
    ORDER BY ws.week_start
  ) as week_over_week_change,
  -- Ranking within team
  ROW_NUMBER() OVER (
    PARTITION BY DATE_TRUNC('month', ws.week_start)
    ORDER BY ws.productivity_score DESC
  ) as monthly_rank,
  NOW() as last_updated
FROM weekly_stats ws
JOIN public.profiles p ON ws.user_id = p.id
ORDER BY ws.week_start DESC, ws.productivity_score DESC;

-- Index for productivity queries
CREATE INDEX IF NOT EXISTS idx_mv_user_productivity_user_week 
ON analytics.mv_user_productivity(user_id, week_start);

-- Materialized view for quality metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_quality_metrics AS
WITH task_lifecycle AS (
  SELECT 
    c.id as card_id,
    c.titulo,
    c.sprint_id,
    c.created_by,
    c.created_at,
    c.updated_at as completed_at,
    s.team_id,
    s.name as sprint_name,
    -- Count status transitions
    (SELECT COUNT(*) 
     FROM public.audit_logs al 
     WHERE al.record_id = c.id 
     AND al.table_name = 'cards'
     AND al.new_values->>'status' = '"bloqueado"') as times_blocked,
    -- Count completion cycles
    (SELECT COUNT(*) 
     FROM public.audit_logs al 
     WHERE al.record_id = c.id 
     AND al.table_name = 'cards'
     AND al.new_values->>'status' = '"concluido"') as completion_cycles,
    -- Time to completion
    EXTRACT(EPOCH FROM (
      COALESCE(c.updated_at, NOW()) - c.created_at
    ))/86400 as days_to_complete,
    -- Overdue status
    CASE 
      WHEN c.prazo IS NOT NULL AND c.updated_at > c.prazo 
      THEN TRUE 
      ELSE FALSE 
    END as is_overdue,
    -- Tags for categorization
    c.tags
  FROM public.cards c
  JOIN public.sprints s ON c.sprint_id = s.id
  WHERE c.created_at >= CURRENT_DATE - INTERVAL '180 days'
),
team_quality AS (
  SELECT 
    tl.team_id,
    t.name as team_name,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE tl.times_blocked > 0) as blocked_tasks,
    COUNT(*) FILTER (WHERE tl.completion_cycles > 1) as reopened_tasks,
    COUNT(*) FILTER (WHERE tl.is_overdue) as overdue_tasks,
    COUNT(*) FILTER (WHERE tl.days_to_complete > 14) as long_running_tasks,
    AVG(tl.days_to_complete) as avg_completion_days,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY tl.days_to_complete) as median_completion_days,
    -- Quality scores
    ROUND(
      (1 - (COUNT(*) FILTER (WHERE tl.times_blocked > 0)::decimal / NULLIF(COUNT(*), 0))) * 100, 2
    ) as block_rate_score,
    ROUND(
      (1 - (COUNT(*) FILTER (WHERE tl.completion_cycles > 1)::decimal / NULLIF(COUNT(*), 0))) * 100, 2
    ) as reopen_rate_score,
    ROUND(
      (1 - (COUNT(*) FILTER (WHERE tl.is_overdue)::decimal / NULLIF(COUNT(*), 0))) * 100, 2
    ) as timeliness_score
  FROM task_lifecycle tl
  JOIN public.teams t ON tl.team_id = t.id
  GROUP BY tl.team_id, t.name
)
SELECT 
  tq.team_id,
  tq.team_name,
  tq.total_tasks,
  tq.blocked_tasks,
  tq.reopened_tasks,
  tq.overdue_tasks,
  tq.long_running_tasks,
  ROUND(tq.avg_completion_days, 2) as avg_completion_days,
  tq.median_completion_days,
  tq.block_rate_score,
  tq.reopen_rate_score,
  tq.timeliness_score,
  -- Overall quality score
  ROUND(
    (tq.block_rate_score + tq.reopen_rate_score + tq.timeliness_score) / 3, 2
  ) as overall_quality_score,
  -- Quality rating
  CASE 
    WHEN (tq.block_rate_score + tq.reopen_rate_score + tq.timeliness_score) / 3 >= 85 THEN 'Excellent'
    WHEN (tq.block_rate_score + tq.reopen_rate_score + tq.timeliness_score) / 3 >= 70 THEN 'Good'
    WHEN (tq.block_rate_score + tq.reopen_rate_score + tq.timeliness_score) / 3 >= 50 THEN 'Fair'
    ELSE 'Poor'
  END as quality_rating,
  NOW() as last_updated
FROM team_quality tq
ORDER BY tq.overall_quality_score DESC;

-- Index for quality metrics
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_quality_metrics_team 
ON analytics.mv_quality_metrics(team_id);

-- Refresh functions for materialized views
CREATE OR REPLACE FUNCTION analytics.refresh_analytics_views()
RETURNS void AS $$
BEGIN
  RAISE NOTICE 'Refreshing analytics materialized views...';
  
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_team_velocity;
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_sprint_burndown;
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_user_productivity;
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_quality_metrics;
  
  RAISE NOTICE 'Analytics views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for analytics schema
GRANT USAGE ON SCHEMA analytics TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics 
  GRANT SELECT ON TABLES TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_recent 
ON public.audit_logs(created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS idx_cards_active_sprint 
ON public.cards(sprint_id, status)
WHERE status IN ('backlog', 'em-progresso', 'bloqueado');

CREATE INDEX IF NOT EXISTS idx_sprints_active 
ON public.sprints(team_id, status)
WHERE status = 'active';

-- Add comments for documentation
COMMENT ON SCHEMA analytics IS 'Analytics schema containing materialized views for performance metrics';
COMMENT ON MATERIALIZED VIEW analytics.mv_team_velocity IS 'Team velocity metrics with forecasting capabilities';
COMMENT ON MATERIALIZED VIEW analytics.mv_sprint_burndown IS 'Daily burndown data for active sprints';
COMMENT ON MATERIALIZED VIEW analytics.mv_user_productivity IS 'User productivity and engagement metrics';
COMMENT ON MATERIALIZED VIEW analytics.mv_quality_metrics IS 'Quality metrics and team performance indicators';

-- Initial refresh of all materialized views
SELECT analytics.refresh_analytics_views();