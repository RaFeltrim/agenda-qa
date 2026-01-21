-- Script to delete user Luiz Müller (board_lmuller)
-- ID: 22222222-2222-2222-2222-222222222222

-- 1. Reassign Cards (Optional: set to unassigned or keep history)
-- We will set responsible to NULL for his cards to keep the card but unassign it
UPDATE public.cards 
SET responsavel = 'Unassigned' 
WHERE responsavel = 'board_lmuller' OR responsavel = 'Luiz Müller';

-- 2. Delete Team Membership
DELETE FROM public.team_members 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- 3. Delete Comments (or reassign to system/deleted user placeholder)
DELETE FROM public.comentarios 
WHERE autor = 'board_lmuller' OR autor = 'Luiz Müller';

-- 4. Delete Audit Logs (optional, but requested to "remove him")
DELETE FROM public.audit_logs 
WHERE changed_by = '22222222-2222-2222-2222-222222222222';

-- 5. Delete Profile
DELETE FROM public.profiles 
WHERE id = '22222222-2222-2222-2222-222222222222' OR username = 'board_lmuller';

-- 6. Delete Auth User (if possible via SQL, usually specific to supabase auth schema)
DELETE FROM auth.users 
WHERE id = '22222222-2222-2222-2222-222222222222' OR email = 'board_lmuller@agenda-qa.internal';

-- Verification
SELECT * FROM public.profiles WHERE username = 'board_lmuller';
