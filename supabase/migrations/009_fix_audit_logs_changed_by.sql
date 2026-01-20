-- Simple fix for audit_logs missing changed_by column
-- Run this after ensuring sprints table exists

-- Add missing changed_by column to audit_logs
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS changed_by uuid REFERENCES auth.users(id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;