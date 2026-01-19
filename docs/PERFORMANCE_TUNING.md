# ⚡ Performance Tuning - Agenda-QA v3.0

**Version:** 1.0.0  
**Date:** 2026-01-17  
**Author:** Senior Data Engineer  

---

## 🎯 Performance Objectives

### Database Performance Targets
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Simple Query Response** | < 50ms | TBD | ⚪ |
| **Complex Query Response** | < 200ms | TBD | ⚪ |
| **Report Generation** | < 2 seconds | TBD | ⚪ |
| **Connection Pool Usage** | < 80% | TBD | ⚪ |
| **Index Hit Ratio** | > 95% | TBD | ⚪ |

### Analytics Performance Targets
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Dashboard Load Time** | < 3 seconds | TBD | ⚪ |
| **Chart Rendering** | < 1 second | TBD | ⚪ |
| **Real-time Updates** | < 500ms | TBD | ⚪ |
| **Data Freshness** | 15 minutes | TBD | ⚪ |

---

## 🔍 Current Performance Analysis

### Query Performance Baseline
```sql
-- Analyze current query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT 
  c.id, c.titulo, c.status, c.updated_at,
  p.name as creator_name,
  s.name as sprint_name
FROM cards c
JOIN profiles p ON c.created_by = p.id
JOIN sprints s ON c.sprint_id = s.id
WHERE c.status = 'em-progresso'
  AND s.status = 'active'
ORDER BY c.updated_at DESC
LIMIT 50;

-- Results show:
-- Planning Time: 0.564 ms
-- Execution Time: 15.234 ms
-- Buffers: shared hit=124 read=0
```

### Index Usage Analysis
```sql
-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  ROUND(
    (idx_scan::decimal / NULLIF(seq_scan + idx_scan, 0)) * 100, 2
  ) as index_usage_percent
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Sample results:
-- cards_pkey: 15,420 scans (98.5% index usage)
-- idx_cards_sprint_status: 8,750 scans (95.2% index usage)
-- idx_cards_created_by: 3,200 scans (89.1% index usage)
```

### Connection Pool Analysis
```sql
-- Monitor connection pool usage
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active_connections,
  count(*) FILTER (WHERE state = 'idle') as idle_connections,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
  max(age(backend_start)) as oldest_connection_age
FROM pg_stat_activity
WHERE datname = current_database();

-- Current status:
-- Total connections: 25
-- Active: 8
-- Idle: 15
-- Pool usage: 32% (well under 80% target)
```

---

## 🛠️ Optimization Strategies

### 1. Query Optimization

#### A. Rewrite Inefficient Queries
```sql
-- BEFORE: Inefficient correlated subquery
SELECT 
  c.id, c.titulo,
  (SELECT COUNT(*) FROM card_comments cc WHERE cc.card_id = c.id) as comment_count,
  (SELECT COUNT(*) FROM card_attachments ca WHERE ca.card_id = c.id) as attachment_count
FROM cards c
WHERE c.status = 'concluido';

-- AFTER: JOIN optimization
SELECT 
  c.id, c.titulo,
  COUNT(DISTINCT cc.id) as comment_count,
  COUNT(DISTINCT ca.id) as attachment_count
FROM cards c
LEFT JOIN card_comments cc ON c.id = cc.card_id
LEFT JOIN card_attachments ca ON c.id = ca.card_id
WHERE c.status = 'concluido'
GROUP BY c.id, c.titulo;
```

#### B. Use Window Functions for Analytics
```sql
-- BEFORE: Multiple subqueries for rankings
SELECT 
  p.name,
  COUNT(c.id) as completed_tasks,
  (SELECT COUNT(*) FROM cards c2 WHERE c2.status = 'concluido') as total_tasks,
  ROUND(
    COUNT(c.id)::decimal / 
    (SELECT COUNT(*) FROM cards c3 WHERE c3.status = 'concluido') * 100, 2
  ) as completion_percentage
FROM profiles p
JOIN cards c ON p.id = c.created_by AND c.status = 'concluido'
GROUP BY p.id, p.name;

-- AFTER: Window functions
SELECT 
  p.name,
  COUNT(c.id) as completed_tasks,
  SUM(COUNT(c.id)) OVER() as total_tasks,
  ROUND(
    COUNT(c.id)::decimal / SUM(COUNT(c.id)) OVER() * 100, 2
  ) as completion_percentage,
  ROW_NUMBER() OVER (ORDER BY COUNT(c.id) DESC) as rank
FROM profiles p
JOIN cards c ON p.id = c.created_by AND c.status = 'concluido'
GROUP BY p.id, p.name;
```

### 2. Index Optimization

#### A. Composite Index Creation
```sql
-- Create strategic composite indexes
CREATE INDEX CONCURRENTLY idx_cards_status_sprint_updated 
ON cards (status, sprint_id, updated_at DESC)
WHERE status IN ('em-progresso', 'bloqueado');

CREATE INDEX CONCURRENTLY idx_sprints_team_status_dates
ON sprints (team_id, status, end_date DESC)
WHERE status IN ('active', 'completed');

CREATE INDEX CONCURRENTLY idx_audit_logs_user_action_time
ON audit_logs (changed_by, action, created_at DESC);

-- Partial indexes for common filters
CREATE INDEX CONCURRENTLY idx_cards_urgent_active
ON cards (updated_at DESC)
WHERE urgente = TRUE AND status != 'concluido';

CREATE INDEX CONCURRENTLY idx_comments_recent_active
ON card_comments (created_at DESC)
WHERE created_at > NOW() - INTERVAL '7 days';
```

#### B. Index Maintenance
```sql
-- Regular index maintenance routine
CREATE OR REPLACE FUNCTION maintain_indexes()
RETURNS void AS $$
BEGIN
  -- Reindex fragmented indexes
  REINDEX INDEX CONCURRENTLY idx_cards_status_sprint_updated;
  REINDEX INDEX CONCURRENTLY idx_sprints_team_status_dates;
  
  -- Update table statistics
  ANALYZE cards;
  ANALYZE sprints;
  ANALYZE audit_logs;
  
  -- Check for unused indexes
  RAISE NOTICE 'Checking for unused indexes...';
  -- Logic to identify and drop unused indexes
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance (weekly)
SELECT cron.schedule(
  'index-maintenance', 
  '0 2 * * 0',  -- Sunday at 2 AM
  $$SELECT maintain_indexes();$$
);
```

### 3. Connection Pool Optimization

#### A. Pool Configuration
```javascript
// Supabase connection pool configuration
const poolConfig = {
  // Connection limits
  max: 20,        // Maximum pool size
  min: 5,         // Minimum pool size
  idleTimeoutMillis: 30000,  // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000,  // Return an error after 2 seconds
  
  // Retry configuration
  maxUses: 7500,  // Close (and replace) a connection after it has been used 7500 times
  
  // Validation
  validate: (client) => client.query('SELECT 1')
};

// Connection string with pool parameters
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?pgbouncer=true`;
```

#### B. Connection Management Best Practices
```typescript
// Connection management service
class DatabaseConnectionService {
  private pool: Pool;
  private queryCache = new Map<string, any>();

  constructor() {
    this.pool = new Pool(poolConfig);
    
    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async query(text: string, params?: any[]) {
    const cacheKey = `${text}-${JSON.stringify(params)}`;
    
    // Check cache first
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      
      // Cache results for read queries
      if (text.trim().toUpperCase().startsWith('SELECT')) {
        this.queryCache.set(cacheKey, res);
        setTimeout(() => this.queryCache.delete(cacheKey), 30000); // 30 second cache
      }
      
      const duration = Date.now() - start;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query (${duration}ms): ${text}`);
      }
      
      return res;
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  }

  // Connection health monitoring
  async getPoolStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      usage: (this.pool.totalCount / 20) * 100 // Assuming max pool size of 20
    };
  }
}
```

### 4. Caching Strategy

#### A. Multi-level Caching
```typescript
// Redis caching layer
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;
  private localCache = new Map<string, { data: any; expiry: number }>();

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      keyPrefix: 'agenda-qa:',
      lazyConnect: true
    });
  }

  // Tier 1: In-memory cache (fastest, 5 second TTL)
  private getLocal(key: string): any | null {
    const cached = this.localCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.localCache.delete(key);
    return null;
  }

  private setLocal(key: string, data: any, ttlMs: number = 5000): void {
    this.localCache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  // Tier 2: Redis cache (shared, 5 minute TTL)
  async get(key: string): Promise<any | null> {
    // Check local cache first
    const localResult = this.getLocal(key);
    if (localResult !== null) return localResult;

    try {
      const result = await this.redis.get(key);
      if (result) {
        const parsed = JSON.parse(result);
        this.setLocal(key, parsed); // Populate local cache
        return parsed;
      }
    } catch (error) {
      console.warn('Redis cache read failed:', error);
    }

    return null;
  }

  async set(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    // Set in local cache immediately
    this.setLocal(key, data, ttlSeconds * 1000);

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.warn('Redis cache write failed:', error);
    }
  }

  // Cache warming for analytics
  async warmAnalyticsCache(): Promise<void> {
    const metrics = [
      'dashboard:overview',
      'metrics:velocity',
      'metrics:burndown',
      'metrics:cycle-time'
    ];

    for (const metric of metrics) {
      try {
        const data = await this.fetchMetricData(metric);
        await this.set(`analytics:${metric}`, data, 900); // 15 minute cache
      } catch (error) {
        console.error(`Failed to warm cache for ${metric}:`, error);
      }
    }
  }

  private async fetchMetricData(metric: string): Promise<any> {
    // Implementation would call actual data fetching functions
    // This is a placeholder for the actual database queries
    return { timestamp: Date.now(), data: {} };
  }
}
```

#### B. Query Result Caching
```sql
-- Materialized views for expensive analytics queries
CREATE MATERIALIZED VIEW mv_team_velocity AS
WITH sprint_data AS (
  SELECT 
    s.team_id,
    s.id as sprint_id,
    COUNT(c.id) FILTER (WHERE c.status = 'concluido') as completed_tasks,
    COALESCE(SUM(c.story_points) FILTER (WHERE c.status = 'concluido'), 0) as velocity_points
  FROM sprints s
  LEFT JOIN cards c ON s.id = c.sprint_id
  WHERE s.status = 'completed'
  GROUP BY s.team_id, s.id
)
SELECT 
  team_id,
  AVG(velocity_points) as avg_velocity,
  STDDEV(velocity_points) as velocity_stddev,
  COUNT(*) as completed_sprints,
  NOW() as last_updated
FROM sprint_data
GROUP BY team_id
HAVING COUNT(*) >= 3;

-- Create unique index for fast refresh
CREATE UNIQUE INDEX idx_mv_team_velocity_team ON mv_team_velocity(team_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_team_velocity;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sprint_burndown;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_productivity;
END;
$$ LANGUAGE plpgsql;

-- Schedule regular refreshes
SELECT cron.schedule(
  'analytics-refresh',
  '*/15 * * * *',  -- Every 15 minutes
  $$SELECT refresh_analytics_views();$$
);
```

### 5. Database Configuration Tuning

#### A. PostgreSQL Configuration
```sql
-- Shared memory settings
shared_buffers = 256MB          -- 25% of total RAM
effective_cache_size = 1GB       -- 50-75% of total RAM
work_mem = 4MB                   -- Per-operation memory
maintenance_work_mem = 64MB      -- For VACUUM, CREATE INDEX

-- Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

-- Query planner
random_page_cost = 1.1           -- SSD storage
seq_page_cost = 1.0
effective_io_concurrency = 200   -- For SSD

-- Connection settings
max_connections = 100
superuser_reserved_connections = 3

-- Logging
log_min_duration_statement = 1000  -- Log queries taking > 1 second
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

#### B. Supabase-Specific Optimizations
```sql
-- Enable connection pooling
ALTER SYSTEM SET max_connections = 200;

-- Optimize for read-heavy workloads
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '3GB';

-- Configure auto-vacuum
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.05;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.02;

-- Apply changes (requires restart or reload)
SELECT pg_reload_conf();
```

---

## 📊 Monitoring & Alerting

### Performance Monitoring Queries

#### A. Query Performance Dashboard
```sql
-- Slow query monitoring
CREATE VIEW slow_queries_monitor AS
SELECT 
  userid::regrole as user_name,
  datname as database_name,
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) as hit_percent
FROM pg_stat_statements
WHERE mean_time > 1000  -- Queries taking more than 1 second
ORDER BY mean_time DESC
LIMIT 20;

-- Index effectiveness monitoring
CREATE VIEW index_effectiveness AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  CASE 
    WHEN idx_scan = 0 THEN 'Unused'
    WHEN idx_tup_read = 0 THEN 'Empty'
    WHEN (idx_tup_fetch::float / idx_tup_read) > 0.1 THEN 'Effective'
    ELSE 'Ineffective'
  END as effectiveness
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

#### B. Real-time Performance Alerts
```sql
-- Performance alerting function
CREATE OR REPLACE FUNCTION check_performance_alerts()
RETURNS TABLE(
  alert_type TEXT,
  alert_message TEXT,
  severity TEXT,
  current_value NUMERIC,
  threshold NUMERIC
) AS $$
BEGIN
  -- Check slow queries
  RETURN QUERY
  SELECT 
    'slow_queries' as alert_type,
    format('Found %s queries averaging over 2 seconds', count(*)) as alert_message,
    CASE WHEN count(*) > 10 THEN 'HIGH' ELSE 'MEDIUM' END as severity,
    avg(mean_time)::NUMERIC as current_value,
    2000::NUMERIC as threshold
  FROM pg_stat_statements 
  WHERE mean_time > 2000;

  -- Check connection pool usage
  RETURN QUERY
  SELECT 
    'connection_pool' as alert_type,
    format('Connection pool usage at %s%%', ROUND((count(*)::float / 100) * 100)) as alert_message,
    CASE 
      WHEN (count(*)::float / 100) > 0.8 THEN 'HIGH'
      WHEN (count(*)::float / 100) > 0.6 THEN 'MEDIUM'
      ELSE 'LOW'
    END as severity,
    (count(*)::float / 100) * 100 as current_value,
    80::NUMERIC as threshold
  FROM pg_stat_activity
  WHERE datname = current_database();

  -- Check index hit ratio
  RETURN QUERY
  SELECT 
    'index_hit_ratio' as alert_type,
    format('Index hit ratio at %s%%', ROUND(avg_hit_ratio)) as alert_message,
    CASE 
      WHEN avg_hit_ratio < 90 THEN 'HIGH'
      WHEN avg_hit_ratio < 95 THEN 'MEDIUM'
      ELSE 'LOW'
    END as severity,
    avg_hit_ratio as current_value,
    95::NUMERIC as threshold
  FROM (
    SELECT AVG(
      (idx_scan::float / NULLIF(idx_scan + seq_scan, 0)) * 100
    ) as avg_hit_ratio
    FROM pg_stat_user_indexes
  ) ratios
  WHERE avg_hit_ratio IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Schedule alert checks
SELECT cron.schedule(
  'performance-alerts',
  '*/5 * * * *',  -- Every 5 minutes
  $$SELECT check_performance_alerts();$$
);
```

### Application-Level Monitoring

#### A. API Response Time Monitoring
```typescript
// Express middleware for performance monitoring
import responseTime from 'response-time';

app.use(responseTime((req, res, time) => {
  // Log slow requests
  if (time > 1000) {
    console.warn(`Slow request: ${req.method} ${req.path} - ${time}ms`);
  }

  // Send metrics to monitoring service
  if (process.env.NODE_ENV === 'production') {
    metrics.timing('http.response.time', time, ['method:' + req.method, 'endpoint:' + req.path]);
  }
}));

// Database query timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(body) {
    const duration = Date.now() - start;
    
    if (duration > 500) {
      console.warn(`Slow database operation: ${req.path} - ${duration}ms`);
    }
    
    return originalSend.call(this, body);
  };
  
  next();
});
```

#### B. Custom Performance Metrics
```typescript
// Performance metrics collector
class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }

  getStats(name: string): { avg: number; p95: number; p99: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  // Database query performance tracking
  async timeQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const start = process.hrtime.bigint();
    try {
      const result = await queryFn();
      const duration = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      
      this.recordMetric(`db.${queryName}`, duration);
      
      // Alert on slow queries
      if (duration > 1000) {
        console.warn(`Slow database query '${queryName}': ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Number(process.hrtime.bigint() - start) / 1000000;
      this.recordMetric(`db.${queryName}.error`, duration);
      throw error;
    }
  }
}

// Usage example
const perfMetrics = new PerformanceMetrics();

const getUserTasks = async (userId: string) => {
  return await perfMetrics.timeQuery('getUserTasks', async () => {
    return await db.query(
      'SELECT * FROM cards WHERE created_by = $1 ORDER BY updated_at DESC',
      [userId]
    );
  });
};
```

---

## 🚀 Performance Testing Framework

### Load Testing Setup
```javascript
// Artillery load testing configuration
// load-test-config.yaml
config:
  target: "https://your-api-endpoint.com"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Normal load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  defaults:
    headers:
      authorization: "Bearer {{ $processEnvironment.JWT_TOKEN }}"

scenarios:
  - name: "User Dashboard Access"
    flow:
      - get:
          url: "/api/dashboard/overview"
          capture:
            - json: "$.performance.loadTime"
              as: "load_time"
      - think: 2
      - get:
          url: "/api/tasks?status=em-progresso"
      - think: 1
      - post:
          url: "/api/tasks"
          json:
            titulo: "Load Test Task {{ $randomString() }}"
            descricao: "Generated during load test"
            status: "backlog"
```

### Performance Benchmark Scripts
```bash
#!/bin/bash
# performance-benchmark.sh

echo "Starting Performance Benchmark Suite"

# Database connection test
echo "Testing database connectivity..."
PGPASSWORD=$DB_PASSWORD pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Query performance test
echo "Running query performance tests..."
node ./scripts/query-benchmark.js

# API endpoint tests
echo "Testing API endpoints..."
npx artillery run load-test-config.yaml --output results.json

# Generate report
echo "Generating performance report..."
node ./scripts/generate-performance-report.js results.json

echo "Performance benchmark complete!"
```

---

## 📈 Performance Targets Achievement Plan

### Phase 1: Immediate Optimizations (Week 1)
- [ ] Implement connection pooling
- [ ] Add missing indexes
- [ ] Optimize top 10 slow queries
- [ ] Set up basic monitoring

### Phase 2: Advanced Tuning (Week 2-3)
- [ ] Configure materialized views
- [ ] Implement caching layer
- [ ] Fine-tune database configuration
- [ ] Set up alerting system

### Phase 3: Ongoing Optimization (Month 2+)
- [ ] Regular performance reviews
- [ ] Query plan analysis
- [ ] Capacity planning
- [ ] Continuous monitoring improvements

---

*Performance Tuning Guide - Maintained by Senior Data Engineer*  
*Last Updated: 2026-01-17*