-- =============================================================================
-- Migration: 002_v3_indexes_and_realtime.sql
-- Version: V3
-- Description: Performance indexes, Realtime publication, and audit improvements
-- Author: Agenda QA Team / Tech Lead Review
-- Date: 2026-02-24
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: Performance Indexes (Silent Bottleneck Fix)
-- Without indexes, full table scans occur on every RLS policy evaluation.
-- All FK columns and common filter columns must be indexed.
-- -----------------------------------------------------------------------------

-- cards table indexes
CREATE INDEX IF NOT EXISTS idx_cards_created_by
  ON public.cards (created_by);

CREATE INDEX IF NOT EXISTS idx_cards_sprint_id
  ON public.cards (sprint_id);

CREATE INDEX IF NOT EXISTS idx_cards_status
  ON public.cards (status);

CREATE INDEX IF NOT EXISTS idx_cards_deleted_at
  ON public.cards (deleted_at)
  WHERE deleted_at IS NULL; -- Partial index: only active cards

CREATE INDEX IF NOT EXISTS idx_cards_priority
  ON public.cards (priority);

-- meetings table indexes
CREATE INDEX IF NOT EXISTS idx_meetings_created_by
  ON public.meetings (created_by);

CREATE INDEX IF NOT EXISTS idx_meetings_status
  ON public.meetings (status);

CREATE INDEX IF NOT EXISTS idx_meetings_deleted_at
  ON public.meetings (deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_meetings_data
  ON public.meetings (data);

-- sprints table indexes
CREATE INDEX IF NOT EXISTS idx_sprints_project_id
  ON public.sprints (project_id);

CREATE INDEX IF NOT EXISTS idx_sprints_status
  ON public.sprints (status);

CREATE INDEX IF NOT EXISTS idx_sprints_deleted_at
  ON public.sprints (deleted_at)
  WHERE deleted_at IS NULL;

-- card_comments indexes
CREATE INDEX IF NOT EXISTS idx_card_comments_card_id
  ON public.card_comments (card_id);

CREATE INDEX IF NOT EXISTS idx_card_comments_author_id
  ON public.card_comments (author_id);

-- card_attachments indexes
CREATE INDEX IF NOT EXISTS idx_card_attachments_card_id
  ON public.card_attachments (card_id);

-- audit_logs indexes (high write volume table - index for reads)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON public.audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);

-- projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by
  ON public.projects (created_by);

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

-- -----------------------------------------------------------------------------
-- SECTION 2: Supabase Realtime - Enable publication for collaboration (V3)
-- This enables live sync of cards/meetings without manual page refreshes.
-- Cards and meetings added to supabase_realtime publication.
-- NOTE: Realtime on Free Tier is limited to 2 concurrent connections.
--       Upgrade to Pro before enabling for more than ~5 concurrent users.
-- -----------------------------------------------------------------------------

-- Enable Realtime for cards (collaborative board updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;

-- Enable Realtime for meetings (live meeting status sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;

-- Enable Realtime for card_comments (live comment feed)
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_comments;

-- -----------------------------------------------------------------------------
-- SECTION 3: Audit Log Helper Function
-- Centralizes audit logging to avoid code duplication in application layer.
-- Called via Supabase RPC to log actions atomically with transactions.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_details JSONB DEFAULT '{}'::JSONB
  )
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, NOW());
END;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;

-- -----------------------------------------------------------------------------
-- SECTION 4: Connection Pool Advisory Comment
-- (Cannot be automated - requires Supabase dashboard action)
-- TODO(V3-infra): Migrate project to Pro plan and set:
--   Pool Mode: Transaction (not Session)
--   Pool Size: 15 (safe for Free-to-Pro migration)
--   Max Client Conn: 100
-- This resolves the silent pool exhaustion risk at 25+ concurrent users.
-- -----------------------------------------------------------------------------

-- Verify migration applied successfully
DO $$
BEGIN
  RAISE NOTICE 'Migration 002_v3_indexes_and_realtime applied successfully at %', NOW();
END;
$$;
