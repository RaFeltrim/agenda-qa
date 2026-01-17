-- 🔍 SCRIPT PARA ENCONTRAR UUIDs DOS USUÁRIOS
-- Execute após criar os usuários para obter os UUIDs reais

-- =====================================================
-- BUSCAR UUIDs DOS USUÁRIOS ESPECÍFICOS
-- =====================================================

SELECT 
  email,
  id as uuid_real,
  email_confirmed_at,
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
ORDER BY 
  CASE email
    WHEN 'Board_RFeltrim@agenda-qa.internal' THEN 1
    WHEN 'Board_MCordeiro@agenda-qa.internal' THEN 2
    WHEN 'Board_LMuller@agenda-qa.internal' THEN 3
    WHEN 'Board_FCustodio@agenda-qa.internal' THEN 4
    WHEN 'Board_JPaulo@agenda-qa.internal' THEN 5
    WHEN 'Board_MNeves@agenda-qa.internal' THEN 6
  END;

-- =====================================================
-- TEMPLATE FORMATADO PARA COPIAR/COLOCAR
-- =====================================================

-- Execute a query acima e use os resultados para criar o script final:
/*
-- SUBSTITUA OS UUIDs ABAIXO com os valores reais encontrados:

-- ADMINISTRADOR
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-DO-RAFAEL-AQUI', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- EDITORES
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-DO-MAURICIO-AQUI', 'Board_MCordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', true),
  ('UUID-REAL-DO-LUIZ-AQUI', 'Board_LMuller', 'Luiz Muller Coromi Velasco', 'editor', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- VIEWERS
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-REAL-DA-FABIANA-AQUI', 'Board_FCustodio', 'Fabiana Custódio de Oliveira', 'viewer', true),
  ('UUID-REAL-DO-JOAO-AQUI', 'Board_JPaulo', 'João Paulo Voss Duarte', 'viewer', true),
  ('UUID-REAL-DO-MARCO-AQUI', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Após inserir os profiles, execute:
SELECT 
  p.username,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at,
  LENGTH(p.id::TEXT) as uuid_length -- Deve ser 36 caracteres
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.username;