-- 🔧 SETUP COMPATÍVEL COM SCHEMA ATUAL
-- Script adaptado para o schema existente do Supabase

-- =====================================================
-- PASSO 1: VERIFICAR ESTRUTURA ATUAL
-- =====================================================

-- Primeiro, vamos verificar a estrutura atual da tabela
\d public.profiles;

-- =====================================================
-- PASSO 2: CRIAR USUÁRIOS NO SUPABASE DASHBOARD
-- =====================================================

/*
CRIE ESTES USUÁRIOS EXATOS NO SUPABASE DASHBOARD:

--- ADMINISTRADOR (USANDO ROLE EDITOR) ---
📧 Board_RFeltrim@agenda-qa.internal
🔐 Senha: Senhainicial1
👤 Nome: Rafael Feltrim

--- EDITORES ---
📧 Board_MCordeiro@agenda-qa.internal
🔐 Senha: Senhainicial2
👤 Nome: Mauricio Cordeiro Lyrio Monteiro

📧 Board_LMuller@agenda-qa.internal
🔐 Senha: Senhainicial3
👤 Nome: Luiz Muller Coromi Velasco

--- VISUALIZADORES ---
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
-- PASSO 3: INSERIR PROFILES (APÓS CRIAR USUÁRIOS)
-- =====================================================

-- SUBSTITUA OS UUIDs FICTÍCIOS PELOS REAIS DO SUPABASE:

-- ADMINISTRADOR (como editor com privilégios especiais)
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-RAFAEL', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- EDITORES
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-MAURICIO', 'Board_MCordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', true),
  ('UUID-REAL-LUIZ', 'Board_LMuller', 'Luiz Muller Coromi Velasco', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- VISUALIZADORES
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-FABIANA', 'Board_FCustodio', 'Fabiana Custódio de Oliveira', 'viewer', true),
  ('UUID-REAL-JOAO', 'Board_JPaulo', 'João Paulo Voss Duarte', 'viewer', true),
  ('UUID-REAL-MARCO', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- =====================================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar inserção
SELECT '✅ Setup compatível concluído!' as status;
SELECT role, COUNT(*) as quantidade FROM public.profiles GROUP BY role;
SELECT username, full_name, role FROM public.profiles ORDER BY role, username;

-- =====================================================
-- PASSO 5: IDENTIFICAR ADMINISTRADOR
-- =====================================================

-- Como não temos coluna is_admin, identificaremos o admin pelo username
-- O administrador será Board_RFeltrim (primeiro editor da lista)

-- Query para identificar admin em queries futuras:
SELECT * FROM public.profiles WHERE username = 'Board_RFeltrim';

-- =====================================================
-- CREDENCIAIS FINAIS
-- =====================================================

/*
USUÁRIO ADMINISTRADOR:
📧 Board_RFeltrim@agenda-qa.internal → Senhainicial1

USUÁRIOS EDITOR:
📧 Board_MCordeiro@agenda-qa.internal → Senhainicial2
📧 Board_LMuller@agenda-qa.internal → Senhainicial3

USUÁRIOS VIEWER:
📧 Board_FCustodio@agenda-qa.internal → Senhainicial4
📧 Board_JPaulo@agenda-qa.internal → Senhainicial5
📧 Board_MNeves@agenda-qa.internal → Senhainicial6
*/

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================

/*
1. O administrador (Board_RFeltrim) terá role 'editor' mas será tratado como admin na aplicação
2. A lógica de permissões especiais será implementada no frontend
3. Para identificar o admin: WHERE username = 'Board_RFeltrim'
4. Todos os outros privilégios de admin serão tratados via código
*/