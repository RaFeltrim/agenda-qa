-- 🔍 SCRIPT DE DIAGNÓSTICO DE AUTENTICAÇÃO
-- Execute para verificar o estado atual do sistema

-- =====================================================
-- 1. VERIFICAR USUÁRIOS NO AUTH
-- =====================================================

-- Listar todos os usuários do Auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- 2. VERIFICAR PROFILES EXISTENTES
-- =====================================================

-- Listar todos os profiles
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.role,
  p.first_login,
  u.email,
  u.email_confirmed_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.username;

-- =====================================================
-- 3. VERIFICAR CONTAGEM POR ROLE
-- =====================================================

SELECT 
  role,
  COUNT(*) as quantidade
FROM public.profiles
GROUP BY role;

-- =====================================================
-- 4. VERIFICAR USUÁRIOS SEM PROFILE
-- =====================================================

SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- =====================================================
-- 5. VERIFICAR PERFIL ESPECÍFICO
-- =====================================================

-- Verificar se o admin existe
SELECT 
  p.*,
  u.email,
  u.email_confirmed_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.username = 'Board_RFeltrim';

-- =====================================================
-- RESULTADOS ESPERADOS:
-- =====================================================

/*
✅ DEVE MOSTRAR:
- Usuários criados no Auth (com emails confirmados)
- Profiles correspondentes para cada usuário
- Contagem correta: 1 admin + 2 editors + 3 viewers
- Email confirmado para todos usuários

❌ PROBLEMAS COMUNS:
- Usuários no Auth mas sem profiles → falta inserção
- Profiles sem usuários correspondentes → erro de UUID
- Email não confirmado → usuário não pode logar
- Zero resultados → setup incompleto
*/