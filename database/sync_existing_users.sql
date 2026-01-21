-- 🛡️ EXISTING USERS SYNC SCRIPT
-- Purpose: Link your existing Auth Users (from screenshot) to the Profiles table with correct Roles.
-- Run this AFTER running 'final_db_migration.sql'.

-- 1. Sync Rafael Feltrim (Editor)
INSERT INTO public.profiles (id, username, full_name, role, email)
SELECT id, 'rafael.feltrim', 'Rafael Feltrim', 'editor', email
FROM auth.users 
WHERE email = 'board_rfeltrim@agenda-qa.internal'
ON CONFLICT (id) DO UPDATE 
SET role = 'editor', full_name = 'Rafael Feltrim', is_active = true;

-- 2. Sync Mauricio Cordeiro (Editor)
INSERT INTO public.profiles (id, username, full_name, role, email)
SELECT id, 'mauricio.cordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', email
FROM auth.users 
WHERE email = 'board_mcordeiro@agenda-qa.internal'
ON CONFLICT (id) DO UPDATE 
SET role = 'editor', full_name = 'Mauricio Cordeiro Lyrio Monteiro', is_active = true;

-- 3. Sync Fabiana Custódio (Viewer)
INSERT INTO public.profiles (id, username, full_name, role, email)
SELECT id, 'fabiana.custodio', 'Fabiana Custódio de Oliveira', 'viewer', email
FROM auth.users 
WHERE email = 'board_fcustodio@agenda-qa.internal'
ON CONFLICT (id) DO UPDATE 
SET role = 'viewer', full_name = 'Fabiana Custódio de Oliveira', is_active = true;

-- 4. Sync João Paulo Voss (Viewer)
INSERT INTO public.profiles (id, username, full_name, role, email)
SELECT id, 'joao.voss', 'João Paulo Voss Duarte', 'viewer', email
FROM auth.users 
WHERE email = 'board_jpaulo@agenda-qa.internal'
ON CONFLICT (id) DO UPDATE 
SET role = 'viewer', full_name = 'João Paulo Voss Duarte', is_active = true;

-- 5. Sync Marco Aurélio Neves (Viewer)
INSERT INTO public.profiles (id, username, full_name, role, email)
SELECT id, 'marco.neves', 'Marco Aurélio Neves', 'viewer', email
FROM auth.users 
WHERE email = 'board_mneves@agenda-qa.internal'
ON CONFLICT (id) DO UPDATE 
SET role = 'viewer', full_name = 'Marco Aurélio Neves', is_active = true;

-- Verify the result
SELECT full_name, role, email FROM public.profiles;
