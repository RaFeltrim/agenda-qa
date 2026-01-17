-- 🔧 SCRIPT DE SETUP REAL PARA SUPABASE
-- Siga estas etapas em ordem para configurar usuários funcionais

-- =====================================================
-- PASSO 1: Garantir estrutura da tabela profiles
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Ativar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para desenvolvimento
DROP POLICY IF EXISTS "Dev: Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Dev: Users can update own profile" ON public.profiles;

CREATE POLICY "Dev: Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR CURRENT_USER = 'postgres');

CREATE POLICY "Dev: Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR CURRENT_USER = 'postgres');

-- =====================================================
-- PASSO 2: INSTRUÇÕES PARA CRIAR USUÁRIOS NO DASHBOARD
-- =====================================================

/*
INSTRUÇÕES MANUAIS - FAÇA ISTO PRIMEIRO:

1. Acesse o Supabase Dashboard
2. Vá em: Authentication → Users → Invite User

3. Crie ESTES USUÁRIOS EXATOS:

--- EDITORS (Acesso Completo) ---
📧 editor1@agenda-qa.test
🔐 Senha: Teste123!@#Editor
👤 Nome: Editor Teste 1

📧 editor2@agenda-qa.test  
🔐 Senha: Teste456$%&Editor
👤 Nome: Editor Teste 2

📧 editor3@agenda-qa.test
🔐 Senha: Teste789*()Editor
👤 Nome: Editor Teste 3

--- VIEWERS (Acesso Limitado) ---
📧 viewer1@agenda-qa.test
🔐 Senha: Teste123!@#Viewer
👤 Nome: Viewer Teste 1

📧 viewer2@agenda-qa.test
🔐 Senha: Teste456$%&Viewer
👤 Nome: Viewer Teste 2

📧 viewer3@agenda-qa.test
🔐 Senha: Teste789*()Viewer
👤 Nome: Viewer Teste 3

IMPORTANTE: 
✅ Marque "Auto confirm email" = TRUE
✅ Desmarque "Send magic link email"
*/

-- =====================================================
-- PASSO 3: APÓS CRIAR USUÁRIOS, EXECUTE ESTA QUERY
-- =====================================================

-- Substitua os UUIDs abaixo pelos REAIS do Supabase Dashboard
-- Você encontra os UUIDs em: Authentication → Users → Clique no usuário → ID

/*
SUBSTITUA OS UUIDs FICTÍCIOS PELOS REAIS:

Exemplo de como ficará após substituir:
*/

-- EXEMPLO (substitua com UUIDs reais):
/*
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-DO-EDITOR1', 'editor1', 'Editor Teste 1', 'editor', true),
  ('UUID-REAL-DO-EDITOR2', 'editor2', 'Editor Teste 2', 'editor', true),
  ('UUID-REAL-DO-EDITOR3', 'editor3', 'Editor Teste 3', 'editor', true),
  ('UUID-REAL-DO-VIEWER1', 'viewer1', 'Viewer Teste 1', 'viewer', true),
  ('UUID-REAL-DO-VIEWER2', 'viewer2', 'Viewer Teste 2', 'viewer', true),
  ('UUID-REAL-DO-VIEWER3', 'viewer3', 'Viewer Teste 3', 'viewer', true);
*/

-- Template para copiar e colar (substitua UUIDs reais):
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('00000000-0000-0000-0000-000000000000', 'editor1', 'Editor Teste 1', 'editor', true),
  ('00000000-0000-0000-0000-000000000000', 'editor2', 'Editor Teste 2', 'editor', true),
  ('00000000-0000-0000-0000-000000000000', 'editor3', 'Editor Teste 3', 'editor', true),
  ('00000000-0000-0000-0000-000000000000', 'viewer1', 'Viewer Teste 1', 'viewer', true),
  ('00000000-0000-0000-0000-000000000000', 'viewer2', 'Viewer Teste 2', 'viewer', true),
  ('00000000-0000-0000-0000-000000000000', 'viewer3', 'Viewer Teste 3', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- =====================================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT '✅ Setup de usuários concluído!' as status;
SELECT COUNT(*) as total_perfis FROM public.profiles;
SELECT role, COUNT(*) as quantidade FROM public.profiles GROUP BY role;
SELECT * FROM public.profiles ORDER BY role, username;

-- =====================================================
-- CREDENCIAIS PARA TESTE
-- =====================================================

/*
APONTE PARA O SUPORTE:

USUÁRIOS EDITOR:📧 editor1@agenda-qa.test → Teste123!@#Editor
📧 editor2@agenda-qa.test → Teste456$%&Editor  
📧 editor3@agenda-qa.test → Teste789*()Editor

USUÁRIOS VIEWER:
📧 viewer1@agenda-qa.test → Teste123!@#Viewer
📧 viewer2@agenda-qa.test → Teste456$%&Viewer
📧 viewer3@agenda-qa.test → Teste789*()Viewer
*/