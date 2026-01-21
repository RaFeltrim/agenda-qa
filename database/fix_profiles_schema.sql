-- 🔧 FIX: Comprehensive Profiles Table Update
-- Usage: Run this script to fix missing columns in the 'profiles' table.

-- 1. Add 'email' column if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add 'is_active' column if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Add 'role' column if missing (with default)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer';

-- 4. Add 'full_name' column if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 5. Add 'username' column if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
