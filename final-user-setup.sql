-- 🚀 CONFIGURAÇÃO FINAL AUTOMÁTICA
-- Script completo com UUIDs reais fornecidos

-- =====================================================
-- PASSO 1: GARANTIR ESTRUTURA DA TABELA PROFILES
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
-- PASSO 2: INSERIR TODOS OS PROFILES COM UUIDs REAIS
-- =====================================================

-- ADMINISTRADOR (Rafael Feltrim)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('da441a58-b6bd-448c-960d-92ccf38e9c75', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- EDITOR 1 (Mauricio Cordeiro)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('679e4b9b-c065-4c9d-836d-25e8304298b4', 'Board_MCordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- EDITOR 2 (Luiz Muller)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('02eb4ef3-fa66-4392-9048-af85addd3dc7', 'Board_LMuller', 'Luiz Muller Coromi Velasco', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- VIEWER 1 (Fabiana Custódio)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('b42ac6bc-7b14-4592-b1fc-140cd3b73a0b', 'Board_FCustodio', 'Fabiana Custódio de Oliveira', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- VIEWER 2 (João Paulo)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('1cf406eb-4508-47ce-9cdf-625b6e8e78a2', 'Board_JPaulo', 'João Paulo Voss Duarte', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- VIEWER 3 (Marco Aurélio)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('9400c897-e261-4570-9f15-3204d4ec2615', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- =====================================================
-- PASSO 3: VERIFICAÇÃO COMPLETA
-- =====================================================

-- Status geral
SELECT '✅ CONFIGURAÇÃO FINALIZADA COM SUCESSO!' as status;

-- Contagem por role
SELECT 
  role,
  COUNT(*) as quantidade
FROM public.profiles 
GROUP BY role
ORDER BY role;

-- Lista completa de usuários configurados
SELECT 
  username,
  full_name,
  role,
  first_login,
  created_at
FROM public.profiles
ORDER BY role, username;

-- Verificação específica do administrador
SELECT 
  '👑 ADMINISTRADOR' as tipo,
  username,
  full_name,
  role,
  id as uuid
FROM public.profiles 
WHERE username = 'Board_RFeltrim';

-- Verificação de integridade (relacionamento com auth.users)
SELECT 
  p.username,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ Válido'
    ELSE '❌ Problema'
  END as status_auth
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.username;

-- =====================================================
-- CREDENCIAIS FINAIS PARA TESTE IMEDIATO
-- =====================================================

/*
🎉 SISTEMA PRONTO PARA USO!

ADMINISTRADOR (você):
📧 Board_RFeltrim@agenda-qa.internal → Senhainicial1

EDITORES:
📧 Board_MCordeiro@agenda-qa.internal → Senhainicial2
📧 Board_LMuller@agenda-qa.internal → Senhainicial3

VIEWERS:
📧 Board_FCustodio@agenda-qa.internal → Senhainicial4
📧 Board_JPaulo@agenda-qa.internal → Senhainicial5
📧 Board_MNeves@agenda-qa.internal → Senhainicial6

➡️ PRÓXIMO PASSO:
1. Reinicie o servidor de desenvolvimento: npm run dev
2. Acesse http://localhost:5173
3. Faça login como Board_RFeltrim / Senhainicial1
4. Teste todas funcionalidades!
*/

-- =====================================================
-- LIMPEZA DE ERROS (se necessário)
-- =====================================================

/*
CASO TENHA ERROS ANTERIORES:

-- Limpar profiles problemáticos (se houver)
DELETE FROM public.profiles 
WHERE username IN ('Board_RFeltrim', 'Board_MCordeiro', 'Board_LMuller', 
                   'Board_FCustodio', 'Board_JPaulo', 'Board_MNeves');

-- Reexecutar este script completo
*/