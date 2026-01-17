-- 🛠️ SCRIPT DE SETUP COMPLETO E CORRIGIDO
-- Para resolver erros 400 de autenticação

-- =====================================================
-- PASSO 1: VERIFICAR ESTRUTURA ATUAL
-- =====================================================

-- Verificar se tabelas existem
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'cards', 'comentarios', 'historico', 'reunioes', 'anexos');

-- =====================================================
-- PASSO 2: CRIAR/MANTER ESTRUTURA DA TABELA PROFILES
-- =====================================================

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
-- PASSO 3: INSTRUÇÕES PARA CRIAR USUÁRIOS NO SUPABASE
-- =====================================================

/*
⚠️ IMPORTANTE - SIGA ESTAS ETAPAS NA ORDEM:

1. Acesse: Supabase Dashboard → Authentication → Users → Invite User

2. Crie EXATAMENTE estes usuários:

--- ADMINISTRADOR ---
📧 Board_RFeltrim@agenda-qa.internal
🔐 Senha: Senhainicial1
👤 Nome: Rafael Feltrim
✅ Auto confirm email: TRUE
❌ Send magic link email: FALSE

--- EDITORES ---
📧 Board_MCordeiro@agenda-qa.internal
🔐 Senha: Senhainicial2
👤 Nome: Mauricio Cordeiro Lyrio Monteiro

📧 Board_LMuller@agenda-qa.internal
🔐 Senha: Senhainicial3
👤 Nome: Luiz Muller Coromi Velasco

--- VIEWERS ---
📧 Board_FCustodio@agenda-qa.internal
🔐 Senha: Senhainicial4
👤 Nome: Fabiana Custódio de Oliveira

📧 Board_JPaulo@agenda-qa.internal
🔐 Senha: Senhainicial5
👤 Nome: João Paulo Voss Duarte

📧 Board_MNeves@agenda-qa.internal
🔐 Senha: Senhainicial6
👤 Nome: Marco Aurélio Neves

3. APÓS CRIAR TODOS OS USUÁRIOS:
   - Vá em Authentication → Users
   - Anote/copie o ID (UUID) de cada usuário criado
*/

-- =====================================================
-- PASSO 4: INSERIR PROFILES COM UUIDs REAIS
-- =====================================================

-- ⚠️ SUBSTITUA OS UUIDs ABAIXO PELOS REAIS DO SUPABASE:

-- ADMINISTRADOR
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-DO-RAFAEL', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- EDITORES
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-DO-MAURICIO', 'Board_MCordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', true),
  ('UUID-REAL-DO-LUIZ', 'Board_LMuller', 'Luiz Muller Coromi Velasco', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- VIEWERS
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-DA-FABIANA', 'Board_FCustodio', 'Fabiana Custódio de Oliveira', 'viewer', true),
  ('UUID-REAL-DO-JOAO', 'Board_JPaulo', 'João Paulo Voss Duarte', 'viewer', true),
  ('UUID-REAL-DO-MARCO', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- =====================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar setup completo
SELECT '✅ Setup finalizado!' as status;

-- Contagem por role
SELECT role, COUNT(*) as quantidade FROM public.profiles GROUP BY role;

-- Listar todos profiles com emails
SELECT 
  p.username,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.username;

-- Verificar admin específico
SELECT 
  p.username,
  p.full_name,
  p.role,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.username = 'Board_RFeltrim';

-- =====================================================
-- CREDENCIAIS PARA TESTE
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

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

/*
SE RECEBER ERRO 400 AO LOGAR:

1. Verifique se usuário existe no Auth:
   SELECT * FROM auth.users WHERE email = 'Board_RFeltrim@agenda-qa.internal';

2. Verifique se profile existe:
   SELECT * FROM public.profiles WHERE username = 'Board_RFeltrim';

3. Confirme que email está confirmado:
   O campo email_confirmed_at deve ter valor (não NULL)

4. Verifique UUIDs:
   O ID no auth.users deve ser igual ao id no public.profiles
*/