-- 🔧 SETUP PERSONALIZADO DE USUÁRIOS
-- Usuários com formato Board_NomeSobrenome e senhas iniciais

-- =====================================================
-- PASSO 1: Garantir estrutura da tabela profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  first_login BOOLEAN DEFAULT TRUE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Ativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR is_admin = true OR CURRENT_USER = 'postgres');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin = true OR CURRENT_USER = 'postgres');

-- =====================================================
-- PASSO 2: INSTRUÇÕES PARA CRIAR USUÁRIOS NO SUPABASE
-- =====================================================

/*
CRIE ESTES USUÁRIOS EXATOS NO SUPABASE DASHBOARD:

--- ADMIN (Acesso Privilegiado) ---
📧 Board_RFeltrim@agenda-qa.internal
🔐 Senha: Senhainicial1
👤 Nome: Rafael Feltrim

--- EDITORS ---
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
*/

-- =====================================================
-- PASSO 3: APÓS CRIAR USUÁRIOS, EXECUTE COM UUIDS REAIS
-- =====================================================

-- SUBSTITUA OS UUIDs FICTÍCIOS PELOS REAIS DO SUPABASE:
INSERT INTO public.profiles (id, username, full_name, role, first_login, is_admin) VALUES
  -- ADMIN PRINCIPAL
  ('UUID-REAL-RAFAEL', 'Board_RFeltrim', 'Rafael Feltrim', 'admin', true, true),
  
  -- EDITORS
  ('UUID-REAL-MAURICIO', 'Board_MCordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', true, false),
  ('UUID-REAL-LUIZ', 'Board_LMuller', 'Luiz Muller Coromi Velasco', 'editor', true, false),
  
  -- VIEWERS
  ('UUID-REAL-FABIANA', 'Board_FCustodio', 'Fabiana Custódio de Oliveira', 'viewer', true, false),
  ('UUID-REAL-JOAO', 'Board_JPaulo', 'João Paulo Voss Duarte', 'viewer', true, false),
  ('UUID-REAL-MARCO', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true, false)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login,
  is_admin = EXCLUDED.is_admin;

-- =====================================================
-- PASSO 4: VERIFICAÇÃO
-- =====================================================

SELECT '✅ Setup personalizado concluído!' as status;
SELECT role, COUNT(*) as quantidade FROM public.profiles GROUP BY role;
SELECT username, full_name, role, is_admin FROM public.profiles ORDER BY role, username;

-- =====================================================
-- CREDENCIAIS FINAIS
-- =====================================================

/*
USUÁRIO ADMIN (você):
📧 Board_RFeltrim@agenda-qa.internal → Senhainicial1

USUÁRIOS EDITOR:
📧 Board_MCordeiro@agenda-qa.internal → Senhainicial2
📧 Board_LMuller@agenda-qa.internal → Senhainicial3

USUÁRIOS VIEWER:
📧 Board_FCustodio@agenda-qa.internal → Senhainicial4
📧 Board_JPaulo@agenda-qa.internal → Senhainicial5
📧 Board_MNeves@agenda-qa.internal → Senhainicial6
*/