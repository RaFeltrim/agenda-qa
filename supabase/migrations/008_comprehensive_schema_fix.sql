-- Comprehensive database schema fix migration
-- Addresses multiple missing columns and schema issues

-- 1. Fix audit_logs table - add missing changed_by column
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS changed_by uuid REFERENCES auth.users(id);

-- 2. Ensure cards table has sprint_id column (redundant check)
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS sprint_id uuid REFERENCES public.sprints(id) ON DELETE SET NULL;

-- 3. Fix comentarios table structure and data types
-- First, check if comentarios table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  autor text,
  texto text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comentarios_pkey PRIMARY KEY (id)
);

-- Add missing columns if they don't exist
ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS autor text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_sprint_id ON cards(sprint_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_card_id ON comentarios(card_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);

-- 5. Grant proper permissions
GRANT SELECT, INSERT, UPDATE ON cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON comentarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;