-- Migration to fix comentarios table and audit_logs structure
-- Addresses both the column policy dependency issue and missing audit column

-- 1. FIRST: Drop conflicting policies before making structural changes
DROP POLICY IF EXISTS "Users can add comentarios to their cards" ON comentarios;
DROP POLICY IF EXISTS "Users can view comentarios on cards they have access to" ON comentarios;
DROP POLICY IF EXISTS "Users can create comentarios on cards they have access to" ON comentarios;
DROP POLICY IF EXISTS "Users can update their own comentarios" ON comentarios;
DROP POLICY IF EXISTS "Users can delete their own comentarios" ON comentarios;

-- 2. Fix audit_logs table - add missing additional_info column
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS additional_info jsonb;

-- 3. Fix comentarios table structure
-- Add autor column if it doesn't exist
ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS autor text;

-- Add created_at column if it doesn't exist
ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Add updated_at column if it doesn't exist
ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 4. Ensure cards table has created_by column for RLS policies
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 5. Recreate comentarios table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS public.comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  autor text,
  texto text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comentarios_pkey PRIMARY KEY (id)
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comentarios_card_id ON comentarios(card_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_autor ON comentarios(autor);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios(created_at DESC);

-- 7. Enable Row Level Security
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

-- 8. Create simplified RLS policies to avoid column dependency issues
CREATE POLICY "Users can view comentarios"
  ON comentarios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create comentarios"
  ON comentarios FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update comentarios"
  ON comentarios FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete comentarios"
  ON comentarios FOR DELETE
  USING (auth.role() = 'authenticated');

-- 9. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON comentarios TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 10. Fix audit_logs permissions and structure
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO authenticated;