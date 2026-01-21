-- Test Users Creation Script for Agenda QA
-- Run this in your Supabase SQL editor

-- Create test users with different roles
-- Note: These will create auth.users entries and corresponding profiles

-- User 1: Editor role (full access)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'board_lmuller@agenda-qa.internal',
  crypt('Suasenha7', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Lucas Müller","username":"board_lmuller"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, role, first_login, is_active, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'board_lmuller',
  'Lucas Müller',
  'editor',
  TRUE,
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- User 2: Viewer role (read-only access)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'viewer_john@agenda-qa.internal',
  crypt('ViewerPass123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"John Viewer","username":"viewer_john"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, role, first_login, is_active, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'viewer_john',
  'John Viewer',
  'viewer',
  TRUE,
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- User 3: Admin role (full access + admin features)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'admin_sarah@agenda-qa.internal',
  crypt('AdminPass123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sarah Admin","username":"admin_sarah"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, role, first_login, is_active, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'admin_sarah',
  'Sarah Admin',
  'admin',
  TRUE,
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the users were created
SELECT 
  p.username,
  p.full_name,
  p.role,
  p.first_login,
  u.email,
  u.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.username IN ('board_lmuller', 'viewer_john', 'admin_sarah')
ORDER BY p.role DESC;