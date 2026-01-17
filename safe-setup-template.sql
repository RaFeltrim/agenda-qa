-- 🛡️ TEMPLATE SEGURO DE SETUP
-- Execute este script primeiro para preparar a estrutura
-- Depois substitua os UUIDs manualmente

-- =====================================================
-- PASSO 1: GARANTIR ESTRUTURA DA TABELA
-- =====================================================

-- Criar/mantener tabela profiles
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

-- Políticas básicas
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR CURRENT_USER = 'postgres');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR CURRENT_USER = 'postgres');

-- =====================================================
-- PASSO 2: VERIFICAR USUÁRIOS EXISTENTES
-- =====================================================

-- Verificar se já existem usuários no Auth
SELECT 
  '🔍 Verificando usuários existentes...' as status,
  COUNT(*) as total_usuarios
FROM auth.users;

-- Listar usuários existentes (se houver)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- PASSO 3: INSTRUÇÕES PARA CRIAR USUÁRIOS
-- =====================================================

/*
⚠️ SIGA ESTAS ETAPAS EXATAS:

1. Acesse Supabase Dashboard → Authentication → Users → Invite User

2. Crie estes 6 usuários EXATOS:

--- ADMINISTRADOR ---
📧 Board_RFeltrim@agenda-qa.internal
🔐 Senha: Senhainicial1
👤 Nome: Rafael Feltrim
✅ Auto confirm email: TRUE
❌ Send magic link email: FALSE

--- EDITORES ---
📧 Board_MCordeiro@agenda-qa.internal → Senhainicial2
📧 Board_LMuller@agenda-qa.internal → Senhainicial3

--- VIEWERS ---
📧 Board_FCustodio@agenda-qa.internal → Senhainicial4
📧 Board_JPaulo@agenda-qa.internal → Senhainicial5
📧 Board_MNeves@agenda-qa.internal → Senhainicial6

3. APÓS CRIAR CADA USUÁRIO:
   - Copie o ID (UUID) que aparece no dashboard
   - Guarde em um bloco de notas organizado por usuário
*/

-- =====================================================
-- PASSO 4: TEMPLATE PARA INSERÇÃO MANUAL
-- =====================================================

-- ⚠️ NÃO EXECUTE ESTE BLOCO AINDA!
-- Substitua os UUIDs abaixo pelos REAIS antes de executar:

/*
-- ADMINISTRADOR (substitua 'UUID-AQUI' pelo UUID real do Rafael)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-AQUI', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- EDITORES (substitua UUIDs reais)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-AQUI', 'Board_MCordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', true),
  ('UUID-AQUI', 'Board_LMuller', 'Luiz Muller Coromi Velasco', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- VIEWERS (substitua UUIDs reais)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-AQUI', 'Board_FCustodio', 'Fabiana Custódio de Oliveira', 'viewer', true),
  ('UUID-AQUI', 'Board_JPaulo', 'João Paulo Voss Duarte', 'viewer', true),
  ('UUID-AQUI', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;
*/

-- =====================================================
-- PASSO 5: SCRIPT DE VERIFICAÇÃO PÓS-SETUP
-- =====================================================

-- Execute após inserir todos os profiles:
SELECT 
  '✅ Verificação final:' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'editor' THEN 1 END) as editors,
  COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewers
FROM public.profiles;

-- Listar todos profiles criados
SELECT 
  username,
  full_name,
  role,
  first_login
FROM public.profiles
ORDER BY role, username;

-- =====================================================
-- PASSO 6: COMO ENCONTRAR OS UUIDs REAIS
-- =====================================================

/*
MÉTODO 1 - Via Supabase Dashboard:
1. Vá em Authentication → Users
2. Clique em cada usuário criado
3. Copie o campo "User ID" (é o UUID)

MÉTODO 2 - Via SQL Query:
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email IN (
  'Board_RFeltrim@agenda-qa.internal',
  'Board_MCordeiro@agenda-qa.internal',
  'Board_LMuller@agenda-qa.internal',
  'Board_FCustodio@agenda-qa.internal',
  'Board_JPaulo@agenda-qa.internal',
  'Board_MNeves@agenda-qa.internal'
)
ORDER BY email;
*/

-- =====================================================
-- CREDENCIAIS FINAIS PARA TESTE
-- =====================================================

/*
ADMINISTRADOR:
📧 Board_RFeltrim@agenda-qa.internal → Senhainicial1

EDITORES:
📧 Board_MCordeiro@agenda-qa.internal → Senhainicial2
📧 Board_LMuller@agenda-qa.internal → Senhainicial3

VIEWERS:
📧 Board_FCustodio@agenda-qa.internal → Senhainicial4
📧 Board_JPaulo@agenda-qa.internal → Senhainicial5
📧 Board_MNeves@agenda-qa.internal → Senhainicial6
*/