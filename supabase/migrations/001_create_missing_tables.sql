-- Migration to add missing tables for analytics functionality
-- Fixed version - creates tables in correct order to avoid dependency issues

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);

-- Create team_members table FIRST to avoid RLS policy dependency issues
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role = ANY (ARRAY['member'::text, 'lead'::text, 'admin'::text])) DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_unique UNIQUE(team_id, user_id)
);

-- Create sprints table - adapted to match your existing schema
CREATE TABLE IF NOT EXISTS public.sprints (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  goal text,
  team_id uuid REFERENCES teams(id),
  created_by uuid REFERENCES auth.users(id),
  status text CHECK (status = ANY (ARRAY['planning'::text, 'active'::text, 'review'::text, 'completed'::text, 'cancelled'::text])) DEFAULT 'planning',
  velocity_goal integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sprints_pkey PRIMARY KEY (id),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT valid_velocity CHECK (velocity_goal > 0)
);

-- Add sprint_id column to cards table if it doesn't exist
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS sprint_id uuid REFERENCES sprints(id) ON DELETE SET NULL;

-- Add story_points column to cards table if it doesn't exist
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS story_points integer CHECK (story_points >= 0 AND story_points <= 21);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sprints_team ON sprints(team_id);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON sprints(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_created_by ON sprints(created_by);
CREATE INDEX IF NOT EXISTS idx_cards_sprint_id ON cards(sprint_id);
CREATE INDEX IF NOT EXISTS idx_cards_story_points ON cards(story_points);

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);

-- Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Users can view teams they created or are members of"
  ON teams FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team creators can update their teams"
  ON teams FOR UPDATE
  USING (created_by = auth.uid());

-- Create RLS policies for sprints
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

-- Create RLS policies for team_members
CREATE POLICY "Team members can view team membership"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id AND tm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage membership"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('lead', 'admin')
    )
  );

-- Add audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for audit_logs
CREATE POLICY "Users can view audit logs for records they have access to"
  ON audit_logs FOR SELECT
  USING (
    changed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM cards c 
      WHERE c.id = audit_logs.record_id AND (
        c.user_id = auth.uid() OR c.data_criacao_por = auth.uid()
      )
    )
  );

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create sample data for testing
INSERT INTO teams (id, name, description, created_by, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Frontend Team', 'Frontend development team', '11111111-1111-1111-1111-111111111111', true),
  ('22222222-2222-2222-2222-222222222222', 'Backend Team', 'Backend development team', '11111111-1111-1111-1111-111111111111', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO team_members (team_id, user_id, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'lead'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'lead')
ON CONFLICT (team_id, user_id) DO NOTHING;

INSERT INTO sprints (id, name, description, start_date, end_date, team_id, created_by, status, velocity_goal)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Sprint 1', 'First development sprint', '2026-01-01', '2026-01-14', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'completed', 40),
  ('44444444-4444-4444-4444-444444444444', 'Sprint 2', 'Second development sprint', '2026-01-15', '2026-01-28', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'active', 45),
  ('55555555-5555-5555-5555-555555555555', 'Sprint 3', 'Third development sprint', '2026-01-29', '2026-02-11', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'planning', 35)
ON CONFLICT (id) DO NOTHING;

-- Update some cards to associate with sprints and add story points
UPDATE cards 
SET sprint_id = '33333333-3333-3333-3333-333333333333',
    story_points = 5
WHERE id IN (
  SELECT id FROM cards LIMIT 3
);

UPDATE cards 
SET sprint_id = '44444444-4444-4444-4444-444444444444',
    story_points = 8
WHERE id IN (
  SELECT id FROM cards OFFSET 3 LIMIT 3
);

-- Create audit triggers
DROP TRIGGER IF EXISTS audit_cards_trigger ON cards;
CREATE TRIGGER audit_cards_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_sprints_trigger ON sprints;
CREATE TRIGGER audit_sprints_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sprints
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sprints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Refresh the analytics views function (will be created by 002_modified_analytics_schema.sql)
-- This will be called after the analytics schema is created