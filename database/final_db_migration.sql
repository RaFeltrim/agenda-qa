-- 🛡️ AGENDA-QA Final Migration Script
-- Purpose: Align existing Database Schema with App Frontend (types.ts)
-- Handles: "Policy already exists" errors, table renaming, and missing columns.

-- 1. Rename Tables to match Frontend Code (if they exist with old names)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reunioes') THEN
    ALTER TABLE public.reunioes RENAME TO meetings;
  END IF;
END $$;

-- 2. Create Projects Table (Missing in current DB)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  squad_lead TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Safely enable RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Authenticated users can manage projects') THEN
    CREATE POLICY "Authenticated users can manage projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 3. Update Sprints Table (Add missing columns)
ALTER TABLE public.sprints 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS objetivo TEXT;

-- 4. Update Cards Table (Align with Frontend JSONB structures)
-- The Frontend expects nested JSON arrays for these, moving from LocalStorage.
-- We add these as JSONB columns to support the current App logic immediately.
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS responsavel TEXT, -- Text fallback for UI display
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS sub_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS comentarios JSONB DEFAULT '[]'::jsonb, -- Using JSONB for App compatibility
ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb,      -- Using JSONB for App compatibility
ADD COLUMN IF NOT EXISTS historico JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 5. Update Meetings Table (Add missing columns)
ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS link_reuniao TEXT,
ADD COLUMN IF NOT EXISTS pauta TEXT,
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media',
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- 6. Ensure Audit Logs Exists (If not)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Authenticated users can read logs') THEN
    CREATE POLICY "Authenticated users can read logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users can insert logs') THEN
    CREATE POLICY "Users can insert logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 7. Global Enable Realtime
-- This block attempts to add tables to publication safely
DO $$
BEGIN
  -- Create publication if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
EXCEPTION
  WHEN duplicate_object THEN NULL; -- Ignore if already added
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sprints;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 8. Seed Data (Safe Idempotent)
INSERT INTO public.projects (id, nome, descricao, cor)
VALUES ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Projeto Principal', 'Sistema QA', '#3b82f6')
ON CONFLICT DO NOTHING;
