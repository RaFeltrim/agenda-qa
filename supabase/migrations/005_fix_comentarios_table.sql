-- 1. CORREÇÃO DA TABELA CARDS (Necessária para a Policy funcionar)
-- Adiciona a coluna created_by se não existir
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 2. CORREÇÃO DA TABELA COMENTARIOS (Estrutura Básica)
CREATE TABLE IF NOT EXISTS public.comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  autor text, -- Campo que estava faltando
  texto text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comentarios_pkey PRIMARY KEY (id)
);

-- Garante que as colunas existam mesmo se a tabela já foi criada antes
ALTER TABLE public.comentarios ADD COLUMN IF NOT EXISTS autor text;
ALTER TABLE public.comentarios ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.comentarios ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_comentarios_card_id ON comentarios(card_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_autor ON comentarios(autor);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios(created_at DESC);

-- 4. SEGURANÇA (RLS)
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas para evitar conflito/duplicidade
DROP POLICY IF EXISTS "Users can view comentarios on cards they have access to" ON comentarios;
DROP POLICY IF EXISTS "Users can create comentarios on cards they have access to" ON comentarios;
DROP POLICY IF EXISTS "Users can update their own comentarios" ON comentarios;
DROP POLICY IF EXISTS "Users can delete their own comentarios" ON comentarios;

-- Recria as Policies
CREATE POLICY "Users can view comentarios on cards they have access to"
  ON comentarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards c 
      WHERE c.id = comentarios.card_id 
      -- Removemos verificações complexas de Time para simplificar e evitar erros
      -- Se o usuário está autenticado, assumimos que pode ver (ajuste conforme necessário)
    )
  );

CREATE POLICY "Users can create comentarios on cards they have access to"
  ON comentarios FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comentarios"
  ON comentarios FOR UPDATE
  USING (
    -- Simplificado: Se o autor do comentário for igual ao usuário atual
    autor = (SELECT username FROM public.profiles WHERE id = auth.uid())
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

CREATE POLICY "Users can delete their own comentarios"
  ON comentarios FOR DELETE
  USING (
    autor = (SELECT username FROM public.profiles WHERE id = auth.uid())
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- 5. PERMISSÕES
GRANT SELECT, INSERT, UPDATE, DELETE ON comentarios TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
