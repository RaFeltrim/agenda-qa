-- Enhanced Audit Logging Migration
-- Adds support for comprehensive user activity tracking

-- First, check if audit_logs table exists and create if needed
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'INSERT', 'UPDATE', 'DELETE', 'ARCHIVE', 
    'COMMENT_ADD', 'COMMENT_EDIT', 'COMMENT_DELETE',
    'DOWNLOAD_KANBAN', 'LOGIN', 'LOGOUT',
    'SPRINT_ARCHIVE', 'CARD_ARCHIVE', 'BULK_OPERATION'
  )),
  changed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs(changed_by, created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (changed_by = auth.uid());

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Only allow inserts (no updates or deletes - immutable logs)
CREATE POLICY "Allow audit log inserts"
  ON audit_logs FOR INSERT
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
  
  -- Get client information from JWT claims (if available)
  BEGIN
    client_ip := current_setting('request.jwt.claims', true)::json->>'ip_address';
    user_agent := current_setting('request.jwt.claims', true)::json->>'user_agent';
    session_id := current_setting('request.jwt.claims', true)::json->>'session_id';
  EXCEPTION WHEN others THEN
    -- Fallback values if JWT claims not available
    client_ip := '127.0.0.1';
    user_agent := 'Unknown';
    session_id := 'unknown_session';
  END;

  -- Handle different operations
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, changed_by, 
      new_values, ip_address, user_agent, session_id
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'INSERT', user_id,
      row_to_json(NEW), client_ip::INET, user_agent, session_id
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, changed_by,
      old_values, new_values, ip_address, user_agent, session_id
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'UPDATE', user_id,
      row_to_json(OLD), row_to_json(NEW), client_ip::INET, user_agent, session_id
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
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

-- Create triggers for main tables
-- Cards table
DROP TRIGGER IF EXISTS audit_cards_trigger ON cards;
CREATE TRIGGER audit_cards_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

-- Sprints table  
DROP TRIGGER IF EXISTS audit_sprints_trigger ON sprints;
CREATE TRIGGER audit_sprints_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sprints
  FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

-- Comments table
DROP TRIGGER IF EXISTS audit_comments_trigger ON card_comments;
CREATE TRIGGER audit_comments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON card_comments
  FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

-- Profiles table (limited for privacy)
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION enhanced_audit_trigger();

-- Function to manually insert audit logs (for client-side logging)
CREATE OR REPLACE FUNCTION create_audit_log(
  p_table_name TEXT,
  p_record_id UUID,
  p_action TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_additional_info JSONB DEFAULT NULL
)
RETURNS VOID AS $$
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
    client_ip := current_setting('request.jwt.claims', true)::json->>'ip_address';
    user_agent := current_setting('request.jwt.claims', true)::json->>'user_agent';
    session_id := current_setting('request.jwt.claims', true)::json->>'session_id';
  EXCEPTION WHEN others THEN
    client_ip := '127.0.0.1';
    user_agent := 'Unknown';
    session_id := 'unknown_session';
  END;

  -- Insert audit log
  INSERT INTO audit_logs (
    table_name, record_id, action, changed_by,
    old_values, new_values, ip_address, user_agent, session_id, additional_info
  ) VALUES (
    p_table_name, p_record_id, p_action, user_id,
    p_old_values, p_new_values, client_ip::INET, user_agent, session_id, p_additional_info
  );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a view for easier audit log querying
CREATE OR REPLACE VIEW audit_logs_with_user_info AS
SELECT 
  al.*,
  p.username,
  p.full_name,
  p.role as user_role
FROM audit_logs al
LEFT JOIN profiles p ON al.changed_by = p.id
ORDER BY al.created_at DESC;

-- Create materialized view for audit statistics (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS audit_statistics AS
SELECT 
  DATE(created_at) as log_date,
  action,
  table_name,
  COUNT(*) as action_count,
  COUNT(DISTINCT changed_by) as unique_users
FROM audit_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), action, table_name
ORDER BY log_date DESC, action_count DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_audit_stats_date ON audit_statistics(log_date);

-- Function to refresh audit statistics
CREATE OR REPLACE FUNCTION refresh_audit_statistics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY audit_statistics;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional)
-- INSERT INTO audit_logs (table_name, record_id, action, changed_by, new_values)
-- VALUES 
--   ('cards', gen_random_uuid(), 'INSERT', auth.uid(), '{"title": "Test Card", "status": "backlog"}'::jsonb),
--   ('sprints', gen_random_uuid(), 'UPDATE', auth.uid(), '{"status": "active"}'::jsonb);

-- Verification queries
-- Check audit log structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'audit_logs' 
-- ORDER BY ordinal_position;

-- Check trigger creation
-- SELECT tgname, tgrelid::regclass 
-- FROM pg_trigger 
-- WHERE tgname LIKE '%audit%' 
-- ORDER BY tgname;