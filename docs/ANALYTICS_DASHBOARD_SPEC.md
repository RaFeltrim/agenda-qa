# 📊 Analytics Dashboard Specification - Agenda-QA v3.0

**Version:** 1.0.0  
**Date:** 2026-01-17  
**Author:** Senior Data Engineer  

---

## 🎯 Dashboard Overview

The analytics dashboard provides comprehensive insights into team performance, sprint metrics, and project health through 7 key performance indicators with supporting SQL queries and visualization recommendations.

---

## 📈 Key Metrics & KPIs

### 1. Sprint Burndown Tracking

**Definition:** Visual representation of work remaining versus time in current sprint

**SQL Query:**
```sql
-- Daily burndown data
WITH sprint_days AS (
  SELECT 
    generate_series(
      s.start_date::date, 
      s.end_date::date, 
      '1 day'::interval
    )::date AS day_date,
    s.id as sprint_id,
    s.name as sprint_name,
    s.velocity_goal
  FROM sprints s
  WHERE s.status = 'active'
),
daily_progress AS (
  SELECT 
    sd.day_date,
    sd.sprint_id,
    sd.sprint_name,
    sd.velocity_goal,
    COUNT(c.id) FILTER (
      WHERE c.status = 'concluido' 
      AND c.updated_at::date <= sd.day_date
    ) as completed_tasks,
    COUNT(c.id) as total_tasks
  FROM sprint_days sd
  LEFT JOIN cards c ON c.sprint_id = sd.sprint_id
  GROUP BY sd.day_date, sd.sprint_id, sd.sprint_name, sd.velocity_goal
)
SELECT 
  day_date,
  sprint_name,
  total_tasks,
  completed_tasks,
  (total_tasks - completed_tasks) as remaining_work,
  velocity_goal,
  ROUND(
    (completed_tasks::decimal / NULLIF(velocity_goal, 0)) * 100, 2
  ) as completion_percentage
FROM daily_progress
ORDER BY day_date;
```

**Visualization:** Line chart with:
- X-axis: Days of sprint
- Y-axis: Task count
- Lines: Ideal burndown, Actual progress, Predicted completion

**Update Frequency:** Real-time (every 15 minutes)

---

### 2. Team Velocity Metrics

**Definition:** Average story points completed per sprint over time

**SQL Query:**
```sql
-- Team velocity calculation
WITH sprint_velocity AS (
  SELECT 
    s.id,
    s.name,
    s.team_id,
    s.start_date,
    COUNT(c.id) FILTER (WHERE c.status = 'concluido') as completed_cards,
    COALESCE(SUM(c.story_points) FILTER (WHERE c.status = 'concluido'), 0) as velocity_points,
    COUNT(c.id) as total_cards
  FROM sprints s
  LEFT JOIN cards c ON s.id = c.sprint_id
  WHERE s.status = 'completed'
  GROUP BY s.id, s.name, s.team_id, s.start_date
),
team_stats AS (
  SELECT 
    team_id,
    AVG(velocity_points) as avg_velocity,
    STDDEV(velocity_points) as velocity_stddev,
    COUNT(*) as completed_sprints,
    MAX(velocity_points) as max_velocity,
    MIN(velocity_points) as min_velocity
  FROM sprint_velocity
  GROUP BY team_id
  HAVING COUNT(*) >= 3  -- Need at least 3 sprints for reliable metrics
)
SELECT 
  t.name as team_name,
  ts.avg_velocity,
  ts.velocity_stddev,
  ts.completed_sprints,
  ts.max_velocity,
  ts.min_velocity,
  ROUND(ts.avg_velocity - (1.96 * ts.velocity_stddev), 2) as lower_confidence,
  ROUND(ts.avg_velocity + (1.96 * ts.velocity_stddev), 2) as upper_confidence
FROM team_stats ts
JOIN teams t ON ts.team_id = t.id
ORDER BY ts.avg_velocity DESC;
```

**Visualization:** Bar chart with confidence intervals
**Update Frequency:** Daily (calculated from completed sprints)

---

### 3. Cycle Time Analysis

**Definition:** Average time from task creation to completion

**SQL Query:**
```sql
-- Cycle time calculation
WITH task_timings AS (
  SELECT 
    c.id,
    c.titulo,
    c.created_at,
    c.updated_at as completed_at,
    c.sprint_id,
    EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/3600 as cycle_time_hours,
    s.team_id
  FROM cards c
  JOIN sprints s ON c.sprint_id = s.id
  WHERE c.status = 'concluido'
    AND c.updated_at > c.created_at  -- Valid timing
    AND c.created_at >= CURRENT_DATE - INTERVAL '90 days'  -- Last 90 days
),
team_cycle_times AS (
  SELECT 
    tt.team_id,
    AVG(tt.cycle_time_hours) as avg_cycle_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY tt.cycle_time_hours) as median_cycle_time,
    PERCENTILE_CONT(0.85) WITHIN GROUP (ORDER BY tt.cycle_time_hours) as p85_cycle_time,
    COUNT(*) as completed_tasks,
    MIN(tt.cycle_time_hours) as min_cycle_time,
    MAX(tt.cycle_time_hours) as max_cycle_time
  FROM task_timings tt
  GROUP BY tt.team_id
)
SELECT 
  tm.name as team_name,
  ROUND(tct.avg_cycle_time, 2) as avg_hours,
  ROUND(tct.median_cycle_time, 2) as median_hours,
  ROUND(tct.p85_cycle_time, 2) as p85_hours,
  tct.completed_tasks,
  ROUND(tct.avg_cycle_time/24, 2) as avg_days,
  ROUND(tct.median_cycle_time/24, 2) as median_days
FROM team_cycle_times tct
JOIN teams tm ON tct.team_id = tm.id
ORDER BY tct.avg_cycle_time;
```

**Visualization:** Histogram with statistical markers
**Update Frequency:** Daily

---

### 4. Blocker Identification

**Definition:** Distribution and frequency of blocked tasks

**SQL Query:**
```sql
-- Blocker analysis
WITH blocker_stats AS (
  SELECT 
    c.id,
    c.titulo,
    c.sprint_id,
    c.created_by,
    c.updated_at as blocked_at,
    c.descricao,
    s.team_id,
    p.name as creator_name,
    -- Calculate blocking duration
    LEAD(c.updated_at) OVER (
      PARTITION BY c.id ORDER BY al.created_at
    ) as unblocked_at,
    STRING_AGG(DISTINCT t.tag, ', ') as tags
  FROM cards c
  JOIN sprints s ON c.sprint_id = s.id
  JOIN profiles p ON c.created_by = p.id
  LEFT JOIN audit_logs al ON al.record_id = c.id 
    AND al.table_name = 'cards'
    AND al.new_values->>'status' = '"bloqueado"'
  LEFT JOIN LATERAL unnest(c.tags) AS t(tag) ON true
  WHERE c.status = 'bloqueado'
    OR EXISTS (
      SELECT 1 FROM audit_logs al2 
      WHERE al2.record_id = c.id 
      AND al2.table_name = 'cards'
      AND al2.new_values->>'status' = '"bloqueado"'
      AND al2.created_at >= CURRENT_DATE - INTERVAL '30 days'
    )
  GROUP BY c.id, c.titulo, c.sprint_id, c.created_by, 
           c.updated_at, c.descricao, s.team_id, p.name
),
blocking_patterns AS (
  SELECT 
    bs.team_id,
    COUNT(*) as total_blockers,
    COUNT(*) FILTER (WHERE bs.unblocked_at IS NOT NULL) as resolved_blockers,
    AVG(
      EXTRACT(EPOCH FROM (
        COALESCE(bs.unblocked_at, NOW()) - bs.blocked_at
      ))/3600
    ) as avg_resolution_hours,
    STRING_AGG(DISTINCT bs.tags, '; ') as common_tags,
    COUNT(DISTINCT bs.creator_name) as affected_users
  FROM blocker_stats bs
  GROUP BY bs.team_id
)
SELECT 
  t.name as team_name,
  bp.total_blockers,
  bp.resolved_blockers,
  ROUND(
    (bp.resolved_blockers::decimal / NULLIF(bp.total_blockers, 0)) * 100, 2
  ) as resolution_rate,
  ROUND(bp.avg_resolution_hours, 2) as avg_resolution_hours,
  bp.common_tags,
  bp.affected_users
FROM blocking_patterns bp
JOIN teams t ON bp.team_id = t.id
ORDER BY bp.total_blockers DESC;
```

**Visualization:** Donut chart for resolution rate, bar chart for frequency
**Update Frequency:** Hourly for active blockers

---

### 5. User Activity Heatmap

**Definition:** Team member contribution patterns and workload distribution

**SQL Query:**
```sql
-- User activity analysis
WITH user_contributions AS (
  SELECT 
    p.id as user_id,
    p.name as user_name,
    p.email,
    DATE_TRUNC('day', al.created_at) as activity_date,
    COUNT(*) as daily_actions,
    COUNT(*) FILTER (WHERE al.action = 'INSERT') as creations,
    COUNT(*) FILTER (WHERE al.action = 'UPDATE') as updates,
    COUNT(*) FILTER (WHERE al.action = 'DELETE') as deletions,
    STRING_AGG(DISTINCT al.table_name, ', ') as affected_tables
  FROM profiles p
  JOIN audit_logs al ON p.id = al.changed_by
  WHERE al.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY p.id, p.name, p.email, DATE_TRUNC('day', al.created_at)
),
weekly_patterns AS (
  SELECT 
    uc.user_id,
    uc.user_name,
    EXTRACT(DOW FROM uc.activity_date) as day_of_week,
    EXTRACT(HOUR FROM uc.activity_date) as hour_of_day,
    AVG(uc.daily_actions) as avg_daily_actions,
    SUM(uc.creations) as total_creations,
    SUM(uc.updates) as total_updates,
    COUNT(DISTINCT uc.activity_date) as active_days
  FROM user_contributions uc
  GROUP BY uc.user_id, uc.user_name, 
           EXTRACT(DOW FROM uc.activity_date),
           EXTRACT(HOUR FROM uc.activity_date)
),
productivity_scores AS (
  SELECT 
    wp.user_id,
    wp.user_name,
    AVG(wp.avg_daily_actions) as avg_daily_activity,
    SUM(wp.total_creations + wp.total_updates) as total_contributions,
    COUNT(DISTINCT wp.day_of_week) as active_days_per_week,
    ROUND(
      AVG(CASE 
        WHEN wp.hour_of_day BETWEEN 9 AND 17 THEN wp.avg_daily_actions
        ELSE 0 
      END) / NULLIF(AVG(wp.avg_daily_actions), 0) * 100, 2
    ) as core_hours_percentage
  FROM weekly_patterns wp
  GROUP BY wp.user_id, wp.user_name
)
SELECT 
  ps.user_name,
  ps.avg_daily_activity,
  ps.total_contributions,
  ps.active_days_per_week,
  ps.core_hours_percentage,
  CASE 
    WHEN ps.avg_daily_activity > 50 THEN 'High'
    WHEN ps.avg_daily_activity > 20 THEN 'Medium'
    ELSE 'Low'
  END as activity_level,
  ROUND(ps.total_contributions::decimal / 30, 2) as avg_daily_contributions
FROM productivity_scores ps
ORDER BY ps.total_contributions DESC;
```

**Visualization:** Heatmap (hours vs days), radial chart for productivity
**Update Frequency:** Daily

---

### 6. Quality Metrics

**Definition:** Defect rates, reopened tasks, and quality trends

**SQL Query:**
```sql
-- Quality metrics calculation
WITH task_history AS (
  SELECT 
    c.id,
    c.titulo,
    c.status,
    c.sprint_id,
    c.created_at,
    c.updated_at,
    s.team_id,
    -- Count status changes to 'bloqueado'
    (SELECT COUNT(*) 
     FROM audit_logs al 
     WHERE al.record_id = c.id 
     AND al.table_name = 'cards'
     AND al.new_values->>'status' = '"bloqueado"') as times_blocked,
    -- Count status changes to 'concluido'
    (SELECT COUNT(*) 
     FROM audit_logs al 
     WHERE al.record_id = c.id 
     AND al.table_name = 'cards'
     AND al.new_values->>'status' = '"concluido"') as times_completed
  FROM cards c
  JOIN sprints s ON c.sprint_id = s.id
  WHERE c.created_at >= CURRENT_DATE - INTERVAL '90 days'
),
quality_indicators AS (
  SELECT 
    th.team_id,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE th.times_blocked > 0) as blocked_tasks,
    COUNT(*) FILTER (WHERE th.times_completed > 1) as reopened_tasks,
    AVG(th.times_blocked) as avg_blocks_per_task,
    AVG(th.times_completed) as avg_completions_per_task
  FROM task_history th
  GROUP BY th.team_id
)
SELECT 
  t.name as team_name,
  qi.total_tasks,
  qi.blocked_tasks,
  qi.reopened_tasks,
  ROUND(
    (qi.blocked_tasks::decimal / NULLIF(qi.total_tasks, 0)) * 100, 2
  ) as block_rate_percent,
  ROUND(
    (qi.reopened_tasks::decimal / NULLIF(qi.total_tasks, 0)) * 100, 2
  ) as reopen_rate_percent,
  ROUND(qi.avg_blocks_per_task, 2) as avg_blocks_per_task,
  ROUND(qi.avg_completions_per_task, 2) as avg_completions_per_task,
  CASE 
    WHEN (qi.blocked_tasks::decimal / NULLIF(qi.total_tasks, 0)) > 0.3 
      OR (qi.reopened_tasks::decimal / NULLIF(qi.total_tasks, 0)) > 0.2 
    THEN 'Needs Attention'
    WHEN (qi.blocked_tasks::decimal / NULLIF(qi.total_tasks, 0)) > 0.15 
      OR (qi.reopened_tasks::decimal / NULLIF(qi.total_tasks, 0)) > 0.1
    THEN 'Monitor'
    ELSE 'Good'
  END as quality_status
FROM quality_indicators qi
JOIN teams t ON qi.team_id = t.id
ORDER BY qi.total_tasks DESC;
```

**Visualization:** Multi-series line chart, gauge indicators for quality status
**Update Frequency:** Weekly

---

### 7. Sprint Health Dashboard

**Definition:** Comprehensive sprint performance overview

**SQL Query:**
```sql
-- Sprint health composite score
WITH sprint_metrics AS (
  SELECT 
    s.id,
    s.name,
    s.team_id,
    s.start_date,
    s.end_date,
    s.velocity_goal,
    s.status,
    -- Completion metrics
    COUNT(c.id) as total_tasks,
    COUNT(c.id) FILTER (WHERE c.status = 'concluido') as completed_tasks,
    COALESCE(SUM(c.story_points) FILTER (WHERE c.status = 'concluido'), 0) as completed_points,
    -- Timing metrics
    COUNT(c.id) FILTER (WHERE c.prazo IS NOT NULL AND c.updated_at > c.prazo) as overdue_tasks,
    AVG(
      EXTRACT(EPOCH FROM (
        COALESCE(c.updated_at, NOW()) - c.created_at
      ))/86400
    ) FILTER (WHERE c.status = 'concluido') as avg_completion_days,
    -- Quality metrics
    COUNT(c.id) FILTER (WHERE c.status = 'bloqueado') as blocked_tasks,
    -- Team metrics
    COUNT(DISTINCT tm.user_id) as team_members
  FROM sprints s
  LEFT JOIN cards c ON s.id = c.sprint_id
  LEFT JOIN team_members tm ON s.team_id = tm.team_id
  WHERE s.created_at >= CURRENT_DATE - INTERVAL '180 days'
  GROUP BY s.id, s.name, s.team_id, s.start_date, s.end_date, s.velocity_goal, s.status
),
health_scores AS (
  SELECT 
    sm.*,
    -- Completion score (0-100)
    CASE 
      WHEN sm.total_tasks = 0 THEN 0
      ELSE ROUND(
        (sm.completed_tasks::decimal / sm.total_tasks) * 100, 2
      )
    END as completion_score,
    -- Velocity score (0-100)
    CASE 
      WHEN sm.velocity_goal = 0 THEN 100
      ELSE ROUND(
        LEAST((sm.completed_points::decimal / sm.velocity_goal) * 100, 100), 2
      )
    END as velocity_score,
    -- Quality score (0-100)
    CASE 
      WHEN sm.total_tasks = 0 THEN 100
      ELSE ROUND(
        (1 - (sm.blocked_tasks::decimal / sm.total_tasks)) * 100, 2
      )
    END as quality_score,
    -- Timeliness score (0-100)
    CASE 
      WHEN sm.total_tasks = 0 THEN 100
      ELSE ROUND(
        (1 - (sm.overdue_tasks::decimal / sm.total_tasks)) * 100, 2
      )
    END as timeliness_score
  FROM sprint_metrics sm
)
SELECT 
  hs.name as sprint_name,
  t.name as team_name,
  hs.start_date,
  hs.end_date,
  hs.status,
  hs.total_tasks,
  hs.completed_tasks,
  hs.completed_points,
  hs.velocity_goal,
  hs.completion_score,
  hs.velocity_score,
  hs.quality_score,
  hs.timeliness_score,
  ROUND(
    (hs.completion_score + hs.velocity_score + hs.quality_score + hs.timeliness_score) / 4, 2
  ) as overall_health_score,
  CASE 
    WHEN (hs.completion_score + hs.velocity_score + hs.quality_score + hs.timeliness_score) / 4 >= 80 THEN 'Excellent'
    WHEN (hs.completion_score + hs.velocity_score + hs.quality_score + hs.timeliness_score) / 4 >= 60 THEN 'Good'
    WHEN (hs.completion_score + hs.velocity_score + hs.quality_score + hs.timeliness_score) / 4 >= 40 THEN 'Fair'
    ELSE 'Poor'
  END as health_rating,
  hs.avg_completion_days,
  hs.team_members
FROM health_scores hs
JOIN teams t ON hs.team_id = t.id
ORDER BY hs.start_date DESC;
```

**Visualization:** Dashboard cards, radar chart for health dimensions
**Update Frequency:** Real-time for active sprints, daily for completed

---

## 📊 Dashboard Layout & User Experience

### Primary Dashboard Views

**1. Executive Overview**
- Overall health score (gauge)
- Sprint burndown trend
- Team velocity comparison
- Key alerts and notifications

**2. Team Performance**
- Individual team metrics
- Comparison charts
- Detailed drill-down capabilities

**3. Individual Contributor**
- Personal productivity metrics
- Task completion rates
- Activity patterns

**4. Quality & Risk**
- Blocker analysis
- Quality trends
- Risk indicators

### Interactive Features

**Filtering Options:**
- Date range selection
- Team filtering
- User filtering
- Sprint status filtering
- Task type filtering

**Drill-down Capabilities:**
- Click through from summary to detail
- Export to CSV/PDF
- Share dashboard views
- Custom report generation

### Performance Targets

**Query Performance:**
- Dashboard load time: < 3 seconds
- Chart rendering: < 1 second
- Data refresh: Real-time for active data, cached for historical

**Data Freshness:**
- Real-time metrics: Updated every 15 minutes
- Daily aggregates: Updated daily
- Weekly reports: Updated weekly

---

## 🔧 Implementation Considerations

### Materialized Views for Performance

```sql
-- Create materialized views for frequently accessed data
CREATE MATERIALIZED VIEW mv_sprint_metrics AS
SELECT 
  s.id as sprint_id,
  s.name as sprint_name,
  s.team_id,
  COUNT(c.id) as total_tasks,
  COUNT(c.id) FILTER (WHERE c.status = 'concluido') as completed_tasks,
  COALESCE(SUM(c.story_points), 0) as total_story_points,
  NOW() as last_updated
FROM sprints s
LEFT JOIN cards c ON s.id = c.sprint_id
GROUP BY s.id, s.name, s.team_id;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sprint_metrics;
  -- Add other materialized views here
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (can be done via cron or Supabase functions)
```

### Caching Strategy

**Redis Cache Structure:**
```
analytics:dashboard:{user_id}:{dashboard_type} -> JSON data
analytics:metrics:{metric_name}:{time_period} -> Cached results
analytics:charts:{chart_id} -> Pre-rendered chart data
```

### API Endpoints for Dashboard

```javascript
// Dashboard API structure
GET /api/analytics/dashboard/overview
GET /api/analytics/dashboard/team-performance
GET /api/analytics/dashboard/individual-contributor
GET /api/analytics/metrics/burndown
GET /api/analytics/metrics/velocity
GET /api/analytics/metrics/cycle-time
```

---

## 📈 Monitoring & Alerting

### Key Performance Indicators to Monitor

**System Health:**
- Dashboard load times
- Query performance
- Cache hit ratios
- Database connection pool usage

**Data Quality:**
- Data freshness
- Completeness rates
- Consistency checks
- Anomaly detection

**User Engagement:**
- Dashboard usage statistics
- Feature adoption rates
- User feedback collection
- Performance satisfaction scores

### Alerting Thresholds

```sql
-- Example alert queries
WITH dashboard_performance AS (
  SELECT 
    AVG(load_time_ms) as avg_load_time,
    COUNT(*) FILTER (WHERE load_time_ms > 5000) as slow_loads
  FROM dashboard_access_log 
  WHERE access_time >= NOW() - INTERVAL '1 hour'
)
SELECT 
  CASE 
    WHEN avg_load_time > 3000 THEN 'WARNING'
    WHEN slow_loads > 10 THEN 'CRITICAL'
    ELSE 'OK'
  END as alert_level,
  avg_load_time,
  slow_loads
FROM dashboard_performance;
```

---

*Analytics Dashboard Specification - Maintained by Senior Data Engineer*  
*Last Updated: 2026-01-17*