-- 🧪 USUÁRIOS DE TESTE PARA DESENVOLVIMENTO
-- Execute este script para criar usuários funcionais de teste

-- Primeiro, vamos garantir que as tabelas existem
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  first_login BOOLEAN DEFAULT TRUE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Ativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para desenvolvimento
DROP POLICY IF EXISTS "Dev: Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Dev: Users can update own profile" ON public.profiles;

CREATE POLICY "Dev: Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR CURRENT_USER = 'postgres');

CREATE POLICY "Dev: Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR CURRENT_USER = 'postgres');

-- ⚠️ IMPORTANTE: ESTES USUÁRIOS DEVEM SER CRIADOS VIA SUPABASE DASHBOARD
-- As senhas abaixo são temporárias para desenvolvimento

/*
PASSO 1: Criar usuários via Supabase Dashboard

Ir em: Authentication → Users → Invite User

USUÁRIOS EDITOR (acesso completo):
1. Email: editor1@agenda-qa.test
   Senha: Teste123!@#Editor
   Nome: Editor Teste 1

2. Email: editor2@agenda-qa.test  
   Senha: Teste456$%&Editor
   Nome: Editor Teste 2

3. Email: editor3@agenda-qa.test
   Senha: Teste789*()Editor
   Nome: Editor Teste 3

USUÁRIOS VIEWER (acesso limitado):
4. Email: viewer1@agenda-qa.test
   Senha: Teste123!@#Viewer
   Nome: Viewer Teste 1

5. Email: viewer2@agenda-qa.test
   Senha: Teste456$%&Viewer
   Nome: Viewer Teste 2

6. Email: viewer3@agenda-qa.test
   Senha: Teste789*()Viewer
   Nome: Viewer Teste 3
*/

-- PASSO 2: Após criar os usuários, execute esta inserção
-- Substitua os UUIDs pelos reais do Supabase

INSERT INTO public.profiles (id, username, full_name, role, first_login)
VALUES
  -- EDITORS (substituir UUIDs reais)
  ('00000000-0000-0000-0000-000000000001', 'editor1', 'Editor Teste 1', 'editor', true),
  ('00000000-0000-0000-0000-000000000002', 'editor2', 'Editor Teste 2', 'editor', true),
  ('00000000-0000-0000-0000-000000000003', 'editor3', 'Editor Teste 3', 'editor', true),
  
  -- VIEWERS (substituir UUIDs reais)
  ('00000000-0000-0000-0000-000000000004', 'viewer1', 'Viewer Teste 1', 'viewer', true),
  ('00000000-0000-0000-0000-000000000005', 'viewer2', 'Viewer Teste 2', 'viewer', true),
  ('00000000-0000-0000-0000-000000000006', 'viewer3', 'Viewer Teste 3', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- Verificação
SELECT '✅ Usuários de teste configurados!' as status;
SELECT COUNT(*) as total_usuarios FROM public.profiles;
SELECT role, COUNT(*) as quantidade FROM public.profiles GROUP BY role;