-- Quick fix migration for immediate database issues
-- Addresses the column dependency error and audit logs problem

-- 1. Drop the problematic policy first
DROP POLICY IF EXISTS "Users can add comentarios to their cards" ON comentarios;

-- 2. Add missing columns to existing tables
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS additional_info jsonb;

ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS autor text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3. Ensure cards table has created_by for proper RLS
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 4. Create simple, non-conflicting RLS policies
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage comentarios"
  ON comentarios FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON comentarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;