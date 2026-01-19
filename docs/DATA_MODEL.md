# 📊 Data Model - Agenda-QA v3.0

**Version:** 1.0.0  
**Date:** 2026-01-17  
**Author:** Senior Data Engineer  

---

## 🗃️ Entity Relationship Diagram

```
profiles (1:1) ←→ auth.users
    ↓ (1:M)
team_members ←→ teams
    ↓ (1:M)  
sprints ←→ cards (M:1)
    ↓ (1:M)
card_attachments
card_comments
    ↓ (1:M)
audit_logs
```

## 🏗️ Core Entities

### 1. profiles
**Description:** User profile and authentication information

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
```

**Relationships:**
- 1:1 with Supabase auth.users
- 1:M with team_members (user can belong to multiple teams)
- 1:M with cards (user can create multiple cards)
- 1:M with audit_logs (user actions are logged)

### 2. teams
**Description:** Team/group management

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
```

### 3. team_members
**Description:** Many-to-many relationship between users and teams

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'lead', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

### 4. sprints
**Description:** Sprint planning and tracking

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
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);
```

### 5. cards
**Description:** Main task/card entity - Core of the Kanban system

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (LENGTH(titulo) >= 1 AND LENGTH(titulo) <= 255),
  descricao TEXT,
  status TEXT NOT NULL CHECK (status IN ('backlog', 'em-progresso', 'bloqueado', 'concluido')),
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  responsavel TEXT[] DEFAULT ARRAY[]::TEXT[],
  urgente BOOLEAN DEFAULT FALSE,
  prazo TIMESTAMP WITH TIME ZONE,
  story_points INTEGER CHECK (story_points >= 0 AND story_points <= 21),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_prazo CHECK (prazo > created_at)
);
```

### 6. card_attachments
**Description:** File attachments for cards

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
```

### 7. card_comments
**Description:** Discussion/comments on cards

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
```

### 8. audit_logs
**Description:** Immutable audit trail for all system changes

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
```

## 🔗 Relationships Map

### Primary Keys
- All tables use UUID as primary key for global uniqueness
- Default values use `gen_random_uuid()` for automatic generation

### Foreign Keys
- **profiles.id** → auth.users.id (Supabase authentication)
- **team_members.user_id** → profiles.id
- **team_members.team_id** → teams.id
- **sprints.team_id** → teams.id
- **sprints.created_by** → profiles.id
- **cards.sprint_id** → sprints.id
- **cards.created_by** → profiles.id
- **card_attachments.card_id** → cards.id
- **card_attachments.uploaded_by** → profiles.id
- **card_comments.card_id** → cards.id
- **card_comments.author_id** → profiles.id
- **audit_logs.changed_by** → profiles.id

### Cardinality
- **profiles:teams** = M:N (via team_members junction table)
- **teams:sprints** = 1:M
- **sprints:cards** = 1:M
- **cards:attachments** = 1:M
- **cards:comments** = 1:M
- **profiles:actions** = 1:M (audit_logs)

## 📈 Data Flow Patterns

### User Creation Flow
```
1. auth.users record created (Supabase Auth)
2. profiles record created (trigger or manual)
3. User joins teams via team_members
4. User creates cards, sprints, etc.
5. All actions logged in audit_logs
```

### Sprint Lifecycle
```
1. Sprint created in 'planning' status
2. Cards assigned to sprint
3. Sprint moves to 'active' status
4. Cards updated with progress
5. Sprint completes to 'completed' status
6. Metrics calculated and stored
```

## 🔒 Data Integrity Constraints

### Check Constraints
- **cards.titulo**: Length between 1-255 characters
- **cards.story_points**: Between 0-21 points
- **cards.status**: Valid Kanban status values only
- **sprints.date_range**: End date must be after start date
- **profiles.role**: Valid role values only

### Unique Constraints
- **profiles.email**: Unique email addresses
- **team_members**: Unique user-team combination
- **cards.id + version**: Unique versioned records

### Not Null Constraints
- Essential fields marked as NOT NULL
- Foreign keys enforce referential integrity
- Created timestamps default to NOW()

## 📊 Indexing Strategy

### Primary Indexes
- All primary keys automatically indexed
- Foreign key columns indexed for JOIN performance

### Performance Indexes
```sql
-- Cards performance
CREATE INDEX idx_cards_sprint_status ON cards(sprint_id, status);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_cards_responsavel ON cards USING GIN(responsavel);
CREATE INDEX idx_cards_tags ON cards USING GIN(tags);
CREATE INDEX idx_cards_updated_at ON cards(updated_at DESC);

-- Sprints performance
CREATE INDEX idx_sprints_team_status ON sprints(team_id, status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- Audit performance
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- Teams performance
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
```

## 🗃️ Partitioning Strategy

### Time-based Partitioning
- **audit_logs**: Partitioned by month for historical data
- **card_comments**: Partitioned by quarter for archive purposes

### Logical Partitioning
- **cards**: Soft-delete pattern with deleted_at timestamp
- **sprints**: Status-based archiving (completed/cancelled)

## 📈 Analytics Ready Structure

### Fact Tables
- **cards**: Core fact table for task analytics
- **sprints**: Sprint performance facts
- **audit_logs**: User activity facts

### Dimension Tables
- **profiles**: User dimension
- **teams**: Team dimension  
- **dates**: Time dimension (generated series)

## 🔧 Maintenance Considerations

### Data Archiving
- Soft delete pattern for recoverable data
- Hard delete for compliance after retention period
- Archive old sprints after 12 months

### Performance Monitoring
- Query performance tracking
- Index usage statistics
- Table growth monitoring

### Backup Strategy
- Daily incremental backups
- Weekly full backups
- Point-in-time recovery capability

---

*Data Model - Maintained by Senior Data Engineer*  
*Last Updated: 2026-01-17*