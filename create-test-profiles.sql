-- Simplified Test Users Script - Insert into existing profiles table
-- Use this if auth.users entries already exist

-- Clear any existing conflicting profiles first
DELETE FROM public.profiles 
WHERE username IN ('board_lmuller', 'viewer_john', 'admin_sarah');

-- Insert test profiles
INSERT INTO public.profiles (id, username, full_name, role, first_login, is_active, created_at, updated_at) VALUES
-- Editor user (your main user)
('11111111-1111-1111-1111-111111111111', 'board_lmuller', 'Lucas Müller', 'editor', TRUE, TRUE, NOW(), NOW()),

-- Viewer user (read-only access)
('22222222-2222-2222-2222-222222222222', 'viewer_john', 'John Viewer', 'viewer', TRUE, TRUE, NOW(), NOW()),

-- Admin user (full access + admin features)  
('33333333-3333-3333-3333-333333333333', 'admin_sarah', 'Sarah Admin', 'admin', TRUE, TRUE, NOW(), NOW());

-- Verify insertion
SELECT username, full_name, role, first_login, is_active FROM public.profiles 
WHERE username IN ('board_lmuller', 'viewer_john', 'admin_sarah')
ORDER BY role DESC;