-- Resetar perfis dos usuários do time e forçar troca de senha
-- Compatível com o esquema atual da tabela profiles

-- Primeiro, limpar perfis existentes (opcional - descomente se quiser reset total)
-- DELETE FROM public.profiles 
-- WHERE username IN ('Board_LMuller', 'Board_MCordeiro', 'Board_FCustodio', 'Board_JPaulo', 'Board_MNeves', 'Board_RFeltrim');

-- Atualizar/inserir perfis para os usuários do time com first_login = TRUE para forçar mudança de senha
INSERT INTO public.profiles (
  id, 
  username, 
  full_name, 
  role, 
  first_login, 
  password_changed_at, 
  created_at, 
  updated_at
)
VALUES 
  -- Board_LMuller (corrigido: Luiz Müller)
  ('02eb4ef3-fa66-4392-9048-af85addd3dc7', 'Board_LMuller', 'Luiz Müller', 'editor', TRUE, NULL, NOW(), NOW()),

  -- Board_MCordeiro
  ('679e4b9b-c065-4c9d-836d-25e8304298b4', 'Board_MCordeiro', 'Mauricio Cordeiro', 'editor', TRUE, NULL, NOW(), NOW()),

  -- Board_FCustodio (corrigido: Fabiana Custódio)
  ('b42ac6bc-7b14-4592-b1fc-140cd3b73a0b', 'Board_FCustodio', 'Fabiana Custódio', 'editor', TRUE, NULL, NOW(), NOW()),

  -- Board_JPaulo
  ('1cf406eb-4508-47ce-9cdf-625b6e8e78a2', 'Board_JPaulo', 'João Paulo', 'editor', TRUE, NULL, NOW(), NOW()),

  -- Board_MNeves (corrigido: Marco Neves)
  ('9400c897-e261-4570-9f15-3204d4ec2615', 'Board_MNeves', 'Marco Neves', 'editor', TRUE, NULL, NOW(), NOW()),

  -- Board_RFeltrim (como editor, pois admin não existe no schema atual)
  ('da441a58-b6bd-448c-960d-92ccf38e9c75', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', TRUE, NULL, NOW(), NOW())

ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = TRUE,  -- Força primeiro login
  password_changed_at = NULL,  -- Reseta a senha
  updated_at = NOW();

-- Verificar os perfis atualizados
SELECT 
  p.username,
  p.full_name,
  p.role,
  p.first_login,
  p.password_changed_at,
  p.created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id) THEN 'Exists'
    ELSE 'Missing in auth.users'
  END as auth_status
FROM public.profiles p
WHERE p.username IN (
  'Board_LMuller',
  'Board_MCordeiro', 
  'Board_FCustodio',
  'Board_JPaulo',
  'Board_MNeves',
  'Board_RFeltrim'
)
ORDER BY p.role DESC, p.username;

-- Contagem geral dos perfis
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(CASE WHEN first_login = TRUE THEN 1 END) as users_needing_password_reset
FROM public.profiles 
WHERE username IN (
  'Board_LMuller',
  'Board_MCordeiro', 
  'Board_FCustodio',
  'Board_JPaulo',
  'Board_MNeves',
  'Board_RFeltrim'
)
GROUP BY role
ORDER BY role;