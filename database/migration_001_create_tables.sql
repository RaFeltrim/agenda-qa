-- =====================================================
-- Migration 001: Align existing DB schema with code
-- Target: Supabase SQL Editor
-- Date: 2026-02-10
-- 
-- This migration ALTERS existing tables to add missing
-- columns and fix CHECK constraints. All tables already
-- exist in the database.
-- =====================================================

BEGIN;

-- =============================================================
-- 1. MEETINGS: Add missing 'status' and 'updated_by' columns
--    Code expects: status ('a-agendar','confirmada','realizada')
--    Code expects: updated_by uuid
-- =============================================================
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'a-agendar',
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- Add CHECK constraint for meeting status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'meetings_status_check'
      AND conrelid = 'public.meetings'::regclass
  ) THEN
    ALTER TABLE public.meetings
      ADD CONSTRAINT meetings_status_check
      CHECK (status IN ('a-agendar', 'confirmada', 'realizada'));
  END IF;
END $$;


-- =============================================================
-- 2. CARDS: Expand status CHECK to include 'a-fazer'
--    Current DB: backlog, em-progresso, bloqueado, concluido
--    Code needs: + 'a-fazer'
-- =============================================================
DO $$
DECLARE
  cname text;
BEGIN
  -- Find existing CHECK constraint on cards.status
  SELECT con.conname INTO cname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname = 'cards'
    AND nsp.nspname = 'public'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.cards DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE public.cards
  ADD CONSTRAINT cards_status_check
  CHECK (status IN ('backlog', 'a-fazer', 'em-progresso', 'bloqueado', 'concluido'));


-- =============================================================
-- 3. SPRINTS: Update status values Portuguese → English
--    DB has:   planejada, ativa, concluida, arquivada
--    Code uses: planning, active, completed, archived
-- =============================================================
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname = 'sprints'
    AND nsp.nspname = 'public'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.sprints DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- Convert existing Portuguese values to English
UPDATE public.sprints SET status = 'planning'  WHERE status = 'planejada';
UPDATE public.sprints SET status = 'active'    WHERE status = 'ativa';
UPDATE public.sprints SET status = 'completed' WHERE status = 'concluida';
UPDATE public.sprints SET status = 'archived'  WHERE status = 'arquivada';

-- Change default and add new constraint
ALTER TABLE public.sprints ALTER COLUMN status SET DEFAULT 'planning';
ALTER TABLE public.sprints
  ADD CONSTRAINT sprints_status_check
  CHECK (status IN ('planning', 'active', 'completed', 'archived'));


-- =============================================================
-- 4. PROFILES: Add avatar_url, fix username default, fix role CHECK
--    Missing column: avatar_url
--    username is NOT NULL but code doesn't set it → add default
--    Role CHECK: add 'user' value used by code
-- =============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Set a default for username so upserts without it don't fail
ALTER TABLE public.profiles
  ALTER COLUMN username SET DEFAULT '';

-- Drop old role CHECK and add updated one (include 'user')
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname = 'profiles'
    AND nsp.nspname = 'public'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%role%';

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('viewer', 'user', 'editor', 'admin'));


-- =============================================================
-- 5. RLS Policies — ensure RLS is enabled & basic policies exist
-- =============================================================
ALTER TABLE public.meetings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Meetings: everyone can read, authenticated users can write
DROP POLICY IF EXISTS meetings_select ON public.meetings;
CREATE POLICY meetings_select ON public.meetings FOR SELECT USING (true);

DROP POLICY IF EXISTS meetings_insert ON public.meetings;
CREATE POLICY meetings_insert ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS meetings_update ON public.meetings;
CREATE POLICY meetings_update ON public.meetings FOR UPDATE USING (true);

DROP POLICY IF EXISTS meetings_delete ON public.meetings;
CREATE POLICY meetings_delete ON public.meetings FOR DELETE
  USING (auth.uid() = created_by);

-- Cards: everyone can read, authenticated users can write
DROP POLICY IF EXISTS cards_select ON public.cards;
CREATE POLICY cards_select ON public.cards FOR SELECT USING (true);

DROP POLICY IF EXISTS cards_insert ON public.cards;
CREATE POLICY cards_insert ON public.cards FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS cards_update ON public.cards;
CREATE POLICY cards_update ON public.cards FOR UPDATE USING (true);

DROP POLICY IF EXISTS cards_delete ON public.cards;
CREATE POLICY cards_delete ON public.cards FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Sprints: everyone can read, authenticated users can write
DROP POLICY IF EXISTS sprints_select ON public.sprints;
CREATE POLICY sprints_select ON public.sprints FOR SELECT USING (true);

DROP POLICY IF EXISTS sprints_insert ON public.sprints;
CREATE POLICY sprints_insert ON public.sprints FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS sprints_update ON public.sprints;
CREATE POLICY sprints_update ON public.sprints FOR UPDATE USING (true);

DROP POLICY IF EXISTS sprints_delete ON public.sprints;
CREATE POLICY sprints_delete ON public.sprints FOR DELETE
  USING (auth.uid() = created_by);

-- Profiles: users can read all, update own
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Audit logs: users can read own, insert own
DROP POLICY IF EXISTS audit_logs_select ON public.audit_logs;
CREATE POLICY audit_logs_select ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- =============================================================
-- 6. Indexes for performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_meetings_status     ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_data       ON public.meetings(data);

CREATE INDEX IF NOT EXISTS idx_cards_status         ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_sprint_id      ON public.cards(sprint_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_by     ON public.cards(created_by);
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at     ON public.cards(deleted_at);

CREATE INDEX IF NOT EXISTS idx_sprints_status       ON public.sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_created_by   ON public.sprints(created_by);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id   ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity    ON public.audit_logs(entity_type, entity_id);


-- =============================================================
-- 7. Reload PostgREST schema cache (fixes 404 errors)
-- =============================================================
NOTIFY pgrst, 'reload schema';


COMMIT;
