-- Team Demo Data Setup Script for Agenda QA
-- Creates 3 user profiles and demo cards for team collaboration demonstration

-- First, create the team demo users (if they don't exist)
-- These are the main team members for your presentation

-- User 1: Rafael Feltrim (You) - Editor/Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'rafael.feltrim@agenda-qa.internal',
  crypt('DemoPass123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Rafael Feltrim","username":"rafael.feltrim"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, role, first_login, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'rafael.feltrim',
  'Rafael Feltrim',
  'editor',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login,
  updated_at = NOW();



-- User 3: Mauricio Cordeiro - Editor
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'board_mcordeiro@agenda-qa.internal',
  crypt('Suasenha3', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Mauricio Cordeiro","username":"board_mcordeiro"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, role, first_login, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'board_mcordeiro',
  'Mauricio Cordeiro',
  'editor',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login,
  updated_at = NOW();

-- Create a demo team
INSERT INTO public.teams (id, name, description, created_by, is_active)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Equipe QA Agenda',
  'Time de demonstração para o projeto Agenda QA',
  '11111111-1111-1111-1111-111111111111',
  true
) ON CONFLICT (id) DO NOTHING;

-- Add all users to the demo team
INSERT INTO public.team_members (team_id, user_id, role)
VALUES (

  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'member')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Create demo sprint
INSERT INTO public.sprints (id, name, description, start_date, end_date, team_id, created_by, status, velocity_goal)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Sprint de Demonstração',
  'Sprint para mostrar funcionalidades do sistema Agenda QA',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '14 days',
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'active',
  30
) ON CONFLICT (id) DO NOTHING;

-- Create demo cards for the team to work with
-- Backlog cards
INSERT INTO public.cards (
  id, titulo, descricao, responsavel, prazo, status, tags, data_criacao, data_criacao_por, sprint_id
) VALUES 
(
  '66666666-6666-6666-6666-666666666666',
  'Implementar Autenticação por Biometria',
  'Desenvolver sistema de login biométrico para dispositivos móveis usando Touch ID/Face ID',
  'board_lmuller',
  (CURRENT_DATE + INTERVAL '5 days')::text,
  'backlog',
  ARRAY['frontend', 'segurança', 'mobile'],
  NOW(),
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
),
(
  '77777777-7777-7777-7777-777777777777',
  'Integração com Jira Cloud',
  'Conectar o sistema com Jira Cloud para sincronização automática de tarefas e tickets',
  'board_mcordeiro',
  (CURRENT_DATE + INTERVAL '7 days')::text,
  'backlog',
  ARRAY['integração', 'api', 'jira'],
  NOW(),
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
),
(
  '88888888-8888-8888-8888-888888888888',
  'Dashboard Analytics em Tempo Real',
  'Criar painel de métricas com atualização em tempo real das atividades da equipe',
  'rafael.feltrim',
  (CURRENT_DATE + INTERVAL '10 days')::text,
  'backlog',
  ARRAY['analytics', 'dashboard', 'tempo-real'],
  NOW(),
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
),
(
  '99999999-9999-9999-9999-999999999999',
  'Exportação de Relatórios PDF',
  'Implementar funcionalidade de exportar relatórios completos em formato PDF',
  'Unassigned',
  (CURRENT_DATE + INTERVAL '3 days')::text,
  'backlog',
  ARRAY['relatórios', 'pdf', 'exportação'],
  NOW(),
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
);

-- In Progress cards
INSERT INTO public.cards (
  id, titulo, descricao, responsavel, prazo, status, tags, data_criacao, data_criacao_por, sprint_id
) VALUES 
(
  'demo-card-005-progress-001',
  'Desenvolvimento do Módulo de Testes Automatizados',
  'Criar framework de testes automatizados para validar funcionalidades críticas do sistema',
  'board_mcordeiro',
  (CURRENT_DATE + INTERVAL '2 days')::text,
  'em-progresso',
  ARRAY['testes', 'automatização', 'qa'],
  NOW(),
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Refatoração da Interface do Usuário',
  'Melhorar a experiência do usuário com redesign moderno e mais intuitivo',
  'rafael.feltrim',
  (CURRENT_DATE + INTERVAL '4 days')::text,
  'em-progresso',
  ARRAY['ui', 'ux', 'refatoração'],
  NOW(),
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
);

-- Blocked cards
INSERT INTO public.cards (
  id, titulo, descricao, responsavel, prazo, status, tags, data_criacao, data_criacao_por, sprint_id
) VALUES 
(
  'demo-card-007-blocked-001',
  'Integração com Sistema Legado',
  'Conectar com o sistema antigo de gestão de projetos - BLOQUEADO por falta de documentação da API',
  'Unassigned',
  (CURRENT_DATE + INTERVAL '8 days')::text,
  'bloqueado',
  ARRAY['integração', 'legado', 'bloqueado'],
  NOW(),
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
);

-- Completed cards
INSERT INTO public.cards (
  id, titulo, descricao, responsavel, prazo, status, tags, data_criacao, data_criacao_por, sprint_id
) VALUES 
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'Setup Inicial do Projeto',
  'Configurar ambiente de desenvolvimento, estrutura de pastas e dependências iniciais',
  'rafael.feltrim',
  (CURRENT_DATE - INTERVAL '5 days')::text,
  'concluido',
  ARRAY['setup', 'inicial', 'ambiente'],
  NOW() - INTERVAL '7 days',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Criação do Board Kanban Base',
  'Implementar a estrutura básica do quadro Kanban com as 4 colunas principais',
  'board_mcordeiro',
  (CURRENT_DATE - INTERVAL '3 days')::text,
  'concluido',
  ARRAY['kanban', 'estrutura', 'frontend'],
  NOW() - INTERVAL '5 days',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555'
);

-- Create some comments on the cards to show collaboration
INSERT INTO public.comentarios (id, card_id, autor, texto, timestamp)
VALUES 
(
  'comment-001-demo-card-005',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'board_mcordeiro',
  'Comecei a configurar o Jest para os testes automatizados. Preciso de acesso ao ambiente de staging para continuar.',
  NOW() - INTERVAL '1 day'
),
(
  'comment-002-demo-card-005',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'rafael.feltrim',
  '@board_mcordeiro Acabei de liberar o acesso ao staging. As credenciais estão no canal #dev-ops do Slack.',
  NOW() - INTERVAL '12 hours'
),


-- Create audit logs for some actions
INSERT INTO public.audit_logs (id, table_name, record_id, action, new_values, changed_by, created_at)
VALUES 

(
  'audit-002-demo-card-update',
  'cards',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'UPDATE',
  '{"status": "em-progresso"}'::jsonb,
  'board_mcordeiro',
  NOW() - INTERVAL '1 day'
);

-- Verification query
SELECT 
  'USERS CREATED:' as section,
  p.username,
  p.full_name,
  p.role,
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.username IN ('rafael.feltrim', 'board_mcordeiro')

UNION ALL

SELECT 
  'CARDS SUMMARY:' as section,
  c.status as username,
  COUNT(*)::text as full_name,
  '' as role,
  '' as email
FROM public.cards c
WHERE c.id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
GROUP BY c.status

UNION ALL

SELECT 
  'TOTAL DEMO DATA:' as section,
  'Cards' as username,
  COUNT(*)::text as full_name,
  'Created' as role,
  '' as email
FROM public.cards
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

ORDER BY section, username;