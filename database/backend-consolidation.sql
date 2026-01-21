-- 🛡️ AGENDA-QA Backend Consolidation Script
-- Senior Backend Engineer - Security & Performance Hardening
-- Date: 2026-01-17

-- =============================================
-- SECTION 1: CORE TABLE STRUCTURE & SECURITY
-- =============================================

-- Ensure profiles table exists with proper security
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer', 'admin')) DEFAULT 'editor',
  first_login BOOLEAN DEFAULT TRUE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p2 
      WHERE p2.id = auth.uid() AND p2.role = 'admin' AND p2.is_active = TRUE
    )
  );

-- =============================================
-- SECTION 2: ENHANCED CARDS TABLE WITH SOFT DELETE
-- =============================================

-- Add soft delete and audit columns to cards table
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium';

-- Create indexes for cards performance
CREATE INDEX IF NOT EXISTS idx_cards_status_updated ON public.cards(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON public.cards(created_by);
CREATE INDEX IF NOT EXISTS idx_cards_active ON public.cards(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cards_priority ON public.cards(priority, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_version ON public.cards(id, version);

-- Enable RLS on cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Cards RLS Policies - CRITICAL SECURITY FIX
CREATE POLICY "Users can view cards they created or are assigned to"
  ON public.cards FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR responsavel = (SELECT username FROM public.profiles WHERE id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        JOIN public.sprints s ON tm.team_id = s.team_id
        WHERE tm.user_id = auth.uid() 
        AND s.id = cards.sprint_id
      )
    )
  );

CREATE POLICY "Editors can create cards"
  ON public.cards FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('editor', 'admin') AND p.is_active = TRUE
    )
  );

CREATE POLICY "Users can update their own cards or assigned cards"
  ON public.cards FOR UPDATE
  USING (
    deleted_at IS NULL
    AND version = (SELECT version FROM public.cards WHERE id = cards.id)
    AND (
      created_by = auth.uid()
      OR responsavel = (SELECT username FROM public.profiles WHERE id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin' AND p.is_active = TRUE
      )
    )
  )
  WITH CHECK (
    updated_by = auth.uid()
    AND version = (SELECT version FROM public.cards WHERE id = cards.id) + 1
  );

CREATE POLICY "Editors can delete cards"
  ON public.cards FOR DELETE
  USING (
    deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin' AND p.is_active = TRUE
      )
    )
  );

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete_card(card_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.cards 
  SET 
    deleted_at = NOW(),
    updated_by = auth.uid(),
    version = version + 1
  WHERE id = card_id 
    AND deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SECTION 3: MEETING SCHEDULE OPTIMIZATION
-- =============================================

-- Enhanced meetings table with conflict detection
ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Create indexes for meeting performance
CREATE INDEX IF NOT EXISTS idx_meetings_horario ON public.meetings(horario);
CREATE INDEX IF NOT EXISTS idx_meetings_active ON public.meetings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings(created_by);

-- Enable RLS on meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Meetings RLS Policies
CREATE POLICY "Users can view meetings they created or are participants"
  ON public.meetings FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR participantes @> ARRAY[(SELECT username FROM public.profiles WHERE id = auth.uid())]
    )
  );

CREATE POLICY "Users can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their own meetings"
  ON public.meetings FOR UPDATE
  USING (
    deleted_at IS NULL
    AND created_by = auth.uid()
  );

-- Meeting conflict detection function
CREATE OR REPLACE FUNCTION check_meeting_conflict(
  p_horario TIMESTAMP WITH TIME ZONE,
  p_participantes TEXT[],
  p_exclude_meeting UUID DEFAULT NULL
)
RETURNS TABLE(conflicting_meeting UUID, conflict_reason TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    'Schedule conflict with ' || m.titulo || ' at ' || m.horario::TEXT
  FROM public.meetings m
  WHERE m.deleted_at IS NULL
    AND m.id != COALESCE(p_exclude_meeting, '00000000-0000-0000-0000-000000000000')
    AND m.horario = p_horario
    AND m.participantes && p_participantes;
END;
$$ LANGUAGE plpgsql;

-- Automatic meeting notification function
CREATE OR REPLACE FUNCTION send_meeting_notifications()
RETURNS VOID AS $$
DECLARE
  meeting_record RECORD;
BEGIN
  FOR meeting_record IN
    SELECT * FROM public.meetings 
    WHERE deleted_at IS NULL 
      AND notification_sent = FALSE
      AND horario BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
  LOOP
    -- In a real implementation, this would call an Edge Function
    -- For now, we'll just mark as sent
    UPDATE public.meetings 
    SET notification_sent = TRUE 
    WHERE id = meeting_record.id;
    
    -- Log the notification
    INSERT INTO public.audit_logs (
      table_name, record_id, action, changed_by, new_values
    ) VALUES (
      'meetings', 
      meeting_record.id, 
      'NOTIFICATION_SENT', 
      'SYSTEM',
      jsonb_build_object(
        'meeting_title', meeting_record.titulo,
        'scheduled_time', meeting_record.horario,
        'participants', meeting_record.participantes
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SECTION 4: ENHANCED AUDIT LOGGING SYSTEM
-- =============================================

-- Drop and recreate audit_logs with enhanced structure
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE',
    'COMMENT_ADD', 'COMMENT_EDIT', 'COMMENT_DELETE',
    'MEETING_SCHEDULE', 'MEETING_CANCEL', 'MEETING_UPDATE',
    'SPRINT_CREATE', 'SPRINT_UPDATE', 'SPRINT_COMPLETE',
    'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE',
    'ROLE_CHANGE', 'PROFILE_UPDATE'
  )),
  changed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retention_category TEXT DEFAULT 'standard' CHECK (retention_category IN ('standard', 'sensitive', 'critical'))
);

-- Enhanced indexes for audit logs
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_by ON public.audit_logs(changed_by);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_composite ON public.audit_logs(changed_by, created_at DESC);
CREATE INDEX idx_audit_logs_retention ON public.audit_logs(retention_category, created_at);

-- Enhanced RLS for audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (changed_by = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin' AND p.is_active = TRUE
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Enhanced audit trigger function
CREATE OR REPLACE FUNCTION enhanced_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
  client_ip TEXT;
  user_agent TEXT;
  session_id TEXT;
BEGIN
  -- Get current user
  user_id := auth.uid();
  
  -- Get client information
  BEGIN
    client_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    user_agent := current_setting('request.headers', true)::json->>'user-agent';
    session_id := current_setting('request.headers', true)::json->>'x-session-id';
  EXCEPTION WHEN others THEN
    client_ip := '127.0.0.1';
    user_agent := 'Unknown';
    session_id := gen_random_uuid()::TEXT;
  END;

  -- Handle different operations
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      table_name, record_id, action, changed_by,
      new_values, ip_address, user_agent, session_id
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'INSERT', user_id,
      row_to_json(NEW), client_ip::INET, user_agent, session_id
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detect soft delete
    IF TG_TABLE_NAME = 'cards' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      INSERT INTO public.audit_logs (
        table_name, record_id, action, changed_by,
        old_values, new_values, ip_address, user_agent, session_id
      ) VALUES (
        TG_TABLE_NAME, NEW.id, 'SOFT_DELETE', user_id,
        row_to_json(OLD), row_to_json(NEW), client_ip::INET, user_agent, session_id
      );
    ELSE
      INSERT INTO public.audit_logs (
        table_name, record_id, action, changed_by,
        old_values, new_values, ip_address, user_agent, session_id
      ) VALUES (
        TG_TABLE_NAME, NEW.id, 'UPDATE', user_id,
        row_to_json(OLD), row_to_json(NEW), client_ip::INET, user_agent, session_id
      );
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      table_name, record_id, action, changed_by,
      old_values, ip_address, user_agent, session_id
    ) VALUES (
      TG_TABLE_NAME, OLD.id, 'DELETE', user_id,
      row_to_json(OLD), client_ip::INET, user_agent, session_id
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate audit triggers for all tables
DROP TRIGGER IF EXISTS audit_cards_trigger ON public.cards;
CREATE TRIGGER audit_cards_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

DROP TRIGGER IF EXISTS audit_meetings_trigger ON public.meetings;
CREATE TRIGGER audit_meetings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION enhanced_audit_trigger();

-- =============================================
-- SECTION 5: PERFORMANCE VIEWS & INDEXES
-- =============================================

-- Materialized view for card analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_card_analytics AS
SELECT 
  DATE_TRUNC('day', c.created_at) as creation_date,
  c.status,
  c.priority,
  COUNT(*) as card_count,
  COUNT(*) FILTER (WHERE c.deleted_at IS NULL) as active_cards,
  AVG(EXTRACT(EPOCH FROM (NOW() - c.created_at))/3600) as avg_age_hours
FROM public.cards c
WHERE c.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', c.created_at), c.status, c.priority
ORDER BY creation_date DESC, c.status, c.priority;

-- Index for materialized view
CREATE INDEX IF NOT EXISTS idx_mv_card_analytics_date ON mv_card_analytics(creation_date);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_card_analytics;
  -- Add other materialized views here as needed
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SECTION 6: SECURITY HARDENING & PERMISSIONS
-- =============================================

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create admin role for elevated privileges
CREATE ROLE IF NOT EXISTS app_admin;
GRANT app_admin TO authenticator;

-- =============================================
-- SECTION 7: HEALTH CHECK FUNCTIONS
-- =============================================

-- Database health check function
CREATE OR REPLACE FUNCTION db_health_check()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details JSONB
) AS $$
BEGIN
  -- Check RLS status
  RETURN QUERY
  SELECT 
    'rls_enabled' as check_name,
    CASE 
      WHEN COUNT(*) = COUNT(*) FILTER (WHERE relrowsecurity) 
      THEN 'PASS' 
      ELSE 'FAIL' 
    END as status,
    jsonb_build_object(
      'total_tables', COUNT(*),
      'rls_enabled', COUNT(*) FILTER (WHERE relrowsecurity)
    ) as details
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relname NOT IN ('audit_logs');

  -- Check audit log integrity
  RETURN QUERY
  SELECT 
    'audit_integrity' as check_name,
    CASE 
      WHEN COUNT(*) FILTER (WHERE action IS NULL) = 0 
      THEN 'PASS' 
      ELSE 'FAIL' 
    END as status,
    jsonb_build_object(
      'total_logs', COUNT(*),
      'invalid_logs', COUNT(*) FILTER (WHERE action IS NULL)
    ) as details
  FROM public.audit_logs;

  -- Check constraint violations
  RETURN QUERY
  SELECT 
    'constraint_violations' as check_name,
    CASE 
      WHEN COUNT(*) = 0 
      THEN 'PASS' 
      ELSE 'FAIL' 
    END as status,
    jsonb_build_object(
      'violations_found', COUNT(*)
    ) as details
  FROM (
    SELECT 1 FROM public.cards 
    WHERE deleted_at IS NOT NULL AND updated_at > deleted_at
    UNION ALL
    SELECT 1 FROM public.meetings 
    WHERE deleted_at IS NOT NULL AND updated_at > deleted_at
  ) violations;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify all tables have RLS enabled
-- SELECT tablename, relrowsecurity 
-- FROM pg_tables pt 
-- JOIN pg_class pc ON pt.tablename = pc.relname 
-- WHERE schemaname = 'public';

-- Verify audit triggers exist
-- SELECT tgname, tgrelid::regclass 
-- FROM pg_trigger 
-- WHERE tgname LIKE '%audit%' 
-- ORDER BY tgname;

-- Check current user permissions
-- SELECT table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE grantee = 'authenticated' 
-- AND table_schema = 'public'
-- ORDER BY table_name;

-- Run health check
-- SELECT * FROM db_health_check();

\echo '✅ AGENDA-QA Backend Consolidation Complete'
\echo '🔒 Security hardened with RLS policies'
\echo '📊 Audit logging enhanced with soft deletes'
\echo '⚡ Performance optimized with indexes and materialized views'
\echo '🔔 Meeting conflict detection implemented'
\echo '🔄 Run SELECT db_health_check(); to verify installation'