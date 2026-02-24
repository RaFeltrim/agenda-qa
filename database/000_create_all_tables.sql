-- =====================================================
-- AGENDA-QA: FULL SCHEMA CREATION
-- Run this in Supabase SQL Editor to create all tables
-- =====================================================

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT DEFAULT '',
    full_name TEXT DEFAULT '',
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'user', 'editor', 'admin')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PROJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. SPRINTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    goal TEXT,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CARDS (Tarefas do Kanban)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'a-fazer', 'em-progresso', 'bloqueado', 'concluido', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    tags TEXT[] DEFAULT '{}',
    responsavel_principal UUID REFERENCES auth.users(id),
    sub_responsaveis UUID[] DEFAULT '{}',
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
    reuniao_id UUID,
    urgente BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. MEETINGS (Reuniões)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    data DATE,
    horario_inicio TIME,
    descricao TEXT,
    status TEXT NOT NULL DEFAULT 'a-agendar' CHECK (status IN ('a-agendar', 'confirmada', 'realizada')),
    link_reuniao TEXT,
    local TEXT,
    prioridade TEXT DEFAULT 'media',
    participantes UUID[] DEFAULT '{}',
    pauta TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. COMENTARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    autor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ANEXOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    url TEXT NOT NULL,
    tipo TEXT,
    tamanho BIGINT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. AUDIT LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. COMMENT READS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comment_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(card_id, user_id)
);

-- =====================================================
-- 10. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON public.cards(created_by);
CREATE INDEX IF NOT EXISTS idx_cards_sprint_id ON public.cards(sprint_id);
CREATE INDEX IF NOT EXISTS idx_cards_deleted ON public.cards(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_meetings_data ON public.meetings(data);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_deleted ON public.meetings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);

-- =====================================================
-- 11. RLS
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reads ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 12. POLICIES (permissive for authenticated users)
-- =====================================================

-- Profiles
CREATE POLICY IF NOT EXISTS "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Cards
CREATE POLICY IF NOT EXISTS "cards_select" ON public.cards FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "cards_insert" ON public.cards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "cards_update" ON public.cards FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "cards_delete" ON public.cards FOR DELETE USING (auth.uid() IS NOT NULL);

-- Meetings
CREATE POLICY IF NOT EXISTS "meetings_select" ON public.meetings FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "meetings_insert" ON public.meetings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "meetings_update" ON public.meetings FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "meetings_delete" ON public.meetings FOR DELETE USING (auth.uid() IS NOT NULL);

-- Sprints
CREATE POLICY IF NOT EXISTS "sprints_select" ON public.sprints FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "sprints_insert" ON public.sprints FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "sprints_update" ON public.sprints FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "sprints_delete" ON public.sprints FOR DELETE USING (auth.uid() IS NOT NULL);

-- Projects
CREATE POLICY IF NOT EXISTS "projects_select" ON public.projects FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "projects_insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "projects_update" ON public.projects FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "projects_delete" ON public.projects FOR DELETE USING (auth.uid() IS NOT NULL);

-- Comentarios
CREATE POLICY IF NOT EXISTS "comentarios_select" ON public.comentarios FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "comentarios_insert" ON public.comentarios FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "comentarios_update" ON public.comentarios FOR UPDATE USING (auth.uid() = autor_id);
CREATE POLICY IF NOT EXISTS "comentarios_delete" ON public.comentarios FOR DELETE USING (auth.uid() = autor_id);

-- Anexos
CREATE POLICY IF NOT EXISTS "anexos_select" ON public.anexos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anexos_insert" ON public.anexos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "anexos_delete" ON public.anexos FOR DELETE USING (auth.uid() = uploaded_by);

-- Audit logs
CREATE POLICY IF NOT EXISTS "audit_logs_select" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Comment reads
CREATE POLICY IF NOT EXISTS "comment_reads_all" ON public.comment_reads FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 13. TRIGGERS — auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON public.cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON public.meetings;
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sprints_updated_at ON public.sprints;
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- 15. Reload PostgREST schema cache
-- =====================================================
NOTIFY pgrst, 'reload schema';

COMMIT;
