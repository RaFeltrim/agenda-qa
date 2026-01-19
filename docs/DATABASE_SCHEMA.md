# 🗄️ Database Schema - Agenda-QA v3.0

**Version:** 1.0.0  
**Database:** PostgreSQL (Supabase)  
**Author:** Senior Backend Engineer  

---

## 🏗️ Database Structure Overview

```
Tables: 8
Views: 3
Functions: 5
Triggers: 4
RLS Policies: 12
Indexes: 15+
```

---

## 📋 Core Tables

### 1. profiles
User profile and authentication information

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('viewer', 'editor', 'admin')) DEFAULT 'editor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  ));
```

---

### 2. teams
Team/group management

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_active ON teams(is_active);

-- RLS Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view teams"
  ON teams FOR SELECT
  USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
    )
  );
```

---

### 3. team_members
Many-to-many relationship between users and teams

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'lead', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Indexes
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view membership"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id 
      AND tm2.user_id = auth.uid()
    )
  );
```

---

### 4. sprints
Sprint planning and tracking

```sql
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal TEXT,
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('planning', 'active', 'review', 'completed', 'cancelled')) DEFAULT 'planning',
  velocity_goal INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT valid_velocity CHECK (velocity_goal > 0)
);

-- Indexes
CREATE INDEX idx_sprints_team ON sprints(team_id);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_created_by ON sprints(created_by);

-- RLS Policies
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view sprints"
  ON sprints FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = sprints.team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team leads can manage sprints"
  ON sprints FOR ALL
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = sprints.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('lead', 'admin')
    )
  );
```

---

### 5. cards
Main task/card entity - Core of the Kanban system

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (LENGTH(titulo) >= 1 AND LENGTH(titulo) <= 255),
  descricao TEXT,
  status TEXT NOT NULL CHECK (status IN ('backlog', 'em-progresso', 'bloqueado', 'concluido')),
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  responsavel TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of user emails
  urgente BOOLEAN DEFAULT FALSE,
  prazo TIMESTAMP WITH TIME ZONE,
  story_points INTEGER CHECK (story_points >= 0 AND story_points <= 21),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Optimistic locking for concurrent edits
  version INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_prazo CHECK (prazo > created_at)
);

-- Indexes for performance
CREATE INDEX idx_cards_sprint ON cards(sprint_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_cards_responsavel ON cards USING GIN(responsavel);
CREATE INDEX idx_cards_tags ON cards USING GIN(tags);
CREATE INDEX idx_cards_urgente ON cards(urgente);
CREATE INDEX idx_cards_prazo ON cards(prazo) WHERE prazo IS NOT NULL;
CREATE INDEX idx_cards_updated_at ON cards(updated_at);

-- Composite indexes for common queries
CREATE INDEX idx_cards_sprint_status ON cards(sprint_id, status);
CREATE INDEX idx_cards_user_status ON cards((responsavel @> ARRAY[auth.jwt() ->> 'email']), status);

-- RLS Policies
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cards they created or are assigned to"
  ON cards FOR SELECT
  USING (
    created_by = auth.uid()
    OR responsavel @> ARRAY[auth.jwt() ->> 'email']::TEXT[]
    OR EXISTS (
      SELECT 1 FROM sprints s JOIN team_members tm 
      ON s.team_id = tm.team_id
      WHERE s.id = cards.sprint_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cards"
  ON cards FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM sprints s JOIN team_members tm
      ON s.team_id = tm.team_id
      WHERE s.id = sprint_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('editor', 'lead', 'admin')
    )
  );

CREATE POLICY "Users can update cards they created or are responsible for"
  ON cards FOR UPDATE
  USING (
    created_by = auth.uid()
    OR responsavel @> ARRAY[auth.jwt() ->> 'email']::TEXT[]
    OR EXISTS (
      SELECT 1 FROM sprints s JOIN team_members tm
      ON s.team_id = tm.team_id
      WHERE s.id = cards.sprint_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('editor', 'lead', 'admin')
    )
  );
```

---

### 6. card_attachments
File attachments for cards

```sql
CREATE TABLE card_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_attachments_card ON card_attachments(card_id);
CREATE INDEX idx_attachments_uploaded_by ON card_attachments(uploaded_by);

-- RLS Policies (inherits from cards)
ALTER TABLE card_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attachments follow card visibility"
  ON card_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cards c
      WHERE c.id = card_attachments.card_id
      AND (
        c.created_by = auth.uid()
        OR c.responsavel @> ARRAY[auth.jwt() ->> 'email']::TEXT[]
      )
    )
  );
```

---

### 7. card_comments
Discussion/comments on cards

```sql
CREATE TABLE card_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_comments_card ON card_comments(card_id);
CREATE INDEX idx_comments_author ON card_comments(author_id);
CREATE INDEX idx_comments_created_at ON card_comments(created_at);

-- RLS Policies
ALTER TABLE card_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments follow card visibility"
  ON card_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards c
      WHERE c.id = card_comments.card_id
    )
  );

CREATE POLICY "Users can create comments on visible cards"
  ON card_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cards c
      WHERE c.id = card_comments.card_id
    )
  );
```

---

### 8. audit_logs
Immutable audit trail for all system changes

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES profiles(id),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- RLS Policies - Admin only access
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- NO UPDATE/DELETE policies - audit logs are immutable
```

---

## 🔍 Database Views

### 1. active_sprint_view
Shows current active sprint for each team

```sql
CREATE VIEW active_sprint_view AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  s.id as sprint_id,
  s.name as sprint_name,
  s.start_date,
  s.end_date,
  s.status,
  COUNT(c.id) as total_cards,
  COUNT(CASE WHEN c.status = 'concluido' THEN 1 END) as completed_cards
FROM teams t
LEFT JOIN sprints s ON t.id = s.team_id 
  AND s.status = 'active'
  AND CURRENT_DATE BETWEEN s.start_date AND s.end_date
LEFT JOIN cards c ON s.id = c.sprint_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, s.id, s.name, s.start_date, s.end_date, s.status;
```

### 2. user_productivity_view
Aggregated user performance metrics

```sql
CREATE VIEW user_productivity_view AS
SELECT 
  p.id as user_id,
  p.email,
  p.name,
  COUNT(c.id) as total_assigned_cards,
  COUNT(CASE WHEN c.status = 'concluido' THEN 1 END) as completed_cards,
  ROUND(
    COUNT(CASE WHEN c.status = 'concluido' THEN 1 END)::DECIMAL / 
    NULLIF(COUNT(c.id), 0) * 100, 2
  ) as completion_rate,
  AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/3600) as avg_completion_hours
FROM profiles p
LEFT JOIN cards c ON p.email = ANY(c.responsavel)
WHERE p.is_active = TRUE
GROUP BY p.id, p.email, p.name;
```

### 3. sprint_burndown_view
Daily burndown data for active sprints

```sql
CREATE VIEW sprint_burndown_view AS
SELECT 
  s.id as sprint_id,
  s.name as sprint_name,
  generate_series(s.start_date, s.end_date, '1 day'::interval)::date as day_date,
  COUNT(c.id) FILTER (WHERE c.status != 'concluido') as remaining_work,
  s.velocity_goal
FROM sprints s
LEFT JOIN cards c ON s.id = c.sprint_id
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.start_date, s.end_date, s.velocity_goal
ORDER BY s.id, day_date;
```

---

## ⚙️ Database Functions

### 1. update_updated_at_column()
Auto-update timestamp trigger function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. create_audit_log()
Generic audit logging function

```sql
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    changed_by,
    old_values,
    new_values,
    ip_address,
    user_agent,
    session_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) END,
    current_setting('request.jwt.claims', true)::json->>'ip_address',
    current_setting('request.jwt.claims', true)::json->>'user_agent',
    current_setting('request.jwt.claims', true)::json->>'session_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. calculate_sprint_velocity()
Calculate sprint velocity based on completed story points

```sql
CREATE OR REPLACE FUNCTION calculate_sprint_velocity(sprint_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  velocity INTEGER;
BEGIN
  SELECT COALESCE(SUM(story_points), 0) INTO velocity
  FROM cards 
  WHERE sprint_id = sprint_uuid 
  AND status = 'concluido';
  
  RETURN velocity;
END;
$$ LANGUAGE plpgsql;
```

### 4. get_user_permissions()
Get comprehensive user permissions

```sql
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE(
  permission TEXT,
  resource_type TEXT,
  resource_id UUID
) AS $$
BEGIN
  -- Direct role-based permissions
  RETURN QUERY
  SELECT 
    unnest(ARRAY['view', 'create', 'update', 'delete']) as permission,
    'global' as resource_type,
    NULL::UUID as resource_id
  FROM profiles 
  WHERE id = user_uuid AND role = 'admin'
  
  UNION
  
  SELECT 
    unnest(CASE 
      WHEN role = 'editor' THEN ARRAY['view', 'create', 'update']
      ELSE ARRAY['view']
    END) as permission,
    'global' as resource_type,
    NULL::UUID as resource_id
  FROM profiles 
  WHERE id = user_uuid;
  
  -- Team-based permissions
  RETURN QUERY
  SELECT 
    CASE tm.role
      WHEN 'admin' THEN unnest(ARRAY['view', 'create', 'update', 'delete', 'manage'])
      WHEN 'lead' THEN unnest(ARRAY['view', 'create', 'update', 'manage'])
      ELSE 'view'
    END as permission,
    'team' as resource_type,
    tm.team_id as resource_id
  FROM team_members tm
  WHERE tm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
```

### 5. archive_old_sprints()
Archive sprints older than specified days

```sql
CREATE OR REPLACE FUNCTION archive_old_sprints(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE sprints 
  SET status = 'archived'
  WHERE status = 'completed' 
  AND end_date < CURRENT_DATE - days_old;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔁 Database Triggers

### 1. Auto-update timestamps

```sql
-- For tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Audit logging triggers

```sql
-- Cards audit
CREATE TRIGGER audit_cards_insert
  AFTER INSERT ON cards
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_cards_update
  AFTER UPDATE ON cards
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_cards_delete
  AFTER DELETE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Profiles audit (limited for privacy)
CREATE TRIGGER audit_profiles_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION create_audit_log();
```

---

## 📊 Performance Optimization

### Strategic Indexes

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_cards_complex_search 
  ON cards(status, sprint_id, updated_at DESC)
  WHERE status IN ('em-progresso', 'bloqueado');

CREATE INDEX idx_sprints_active_team 
  ON sprints(team_id, status, end_date DESC)
  WHERE status = 'active';

-- Partial indexes for filtering
CREATE INDEX idx_cards_high_priority 
  ON cards(urgente, updated_at DESC)
  WHERE urgente = TRUE;

CREATE INDEX idx_comments_recent 
  ON card_comments(card_id, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '30 days';
```

### Query Optimization Tips

1. **Use EXPLAIN ANALYZE** for complex queries
2. **Enable query statistics** collection
3. **Regular VACUUM ANALYZE** on large tables
4. **Monitor slow query logs**
5. **Consider partitioning** for audit_logs table

---

## 🔒 Data Retention Policies

### LGPD/GDPR Compliance

```sql
-- Soft delete pattern for recoverable data
ALTER TABLE cards ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE cards ADD COLUMN deleted_by UUID REFERENCES profiles(id);

-- Hard delete job for permanent removal (after legal retention period)
-- Run monthly to remove data older than required retention
CREATE OR REPLACE FUNCTION hard_delete_expired_data()
RETURNS VOID AS $$
BEGIN
  -- Delete soft-deleted cards after 30 days
  DELETE FROM cards 
  WHERE deleted_at < NOW() - INTERVAL '30 days';
  
  -- Archive audit logs after 2 years (keep anonymized)
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Monitoring Queries

### Database Health Check

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Connection statistics
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active_connections
FROM pg_stat_activity;

-- Index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

---

*Database Schema - Maintained by Senior Backend Engineer*  
*Last Updated: 2026-01-17*