-- Script completo para reset de senhas e correção de nomes
-- Este script corrige nomes de usuários e força reset de senhas

-- 1. Corrigir nomes dos usuários e resetar flags de primeiro login
UPDATE public.profiles 
SET 
  full_name = CASE username
    WHEN 'Board_FCustodio' THEN 'Fabiana Custódio'
    WHEN 'Board_LMuller' THEN 'Luiz Müller'
    WHEN 'Board_MNeves' THEN 'Marco Neves'
    ELSE full_name
  END,
  first_login = TRUE,
  password_changed_at = NULL,
  updated_at = NOW()
WHERE username IN (
  'Board_LMuller',
  'Board_MCordeiro', 
  'Board_FCustodio',
  'Board_JPaulo',
  'Board_MNeves',
  'Board_RFeltrim'
);

-- 2. Verificar estado atual dos perfiso 
SELECT 
  username,
  full_name,
  role,
  first_login,
  password_changed_at,
  created_at
FROM public.profiles 
WHERE username IN (
  'Board_LMuller',
  'Board_MCordeiro', 
  'Board_FCustodio',
  'Board_JPaulo',
  'Board_MNeves',
  'Board_RFeltrim'
)
ORDER BY role DESC, username;

-- 3. Contagem de usuários que precisam resetar senha
SELECT 
  'Users requiring password reset' as metric,
  COUNT(*) as count
FROM public.profiles 
WHERE username IN (
  'Board_LMuller',
  'Board_MCordeiro', 
  'Board_FCustodio',
  'Board_JPaulo',
  'Board_MNeves',
  'Board_RFeltrim'
) AND first_login = TRUE;

-- 4. Verificação de integridade com auth.users
SELECT 
  p.username,
  p.full_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id) THEN '✓ User exists in auth'
    ELSE '✗ Missing in auth.users'
  END as auth_status,
  CASE 
    WHEN p.first_login = TRUE THEN 'Needs password reset'
    ELSE 'Password already set'
  END as password_status
FROM public.profiles p
WHERE p.username IN (
  'Board_LMuller',
  'Board_MCordeiro', 
  'Board_FCustodio',
  'Board_JPaulo',
  'Board_MNeves',
  'Board_RFeltrim'
)
ORDER BY p.username;