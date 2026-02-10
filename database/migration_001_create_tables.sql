-- ============================================================================
-- AGENDA-QA: Migração Completa — Criação de Tabelas Faltantes
-- Executar no Editor SQL do Supabase (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. PROFILES — Dados de perfil vinculados ao auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   text DEFAULT '',
    email       text DEFAULT '',
    avatar_url  text DEFAULT '',
    role        text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'user', 'viewer')),
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuário do Agenda-QA';

-- 2. SPRINTS — Ciclos de trabalho
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sprints (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        text NOT NULL,
    objetivo    text,
    data_inicio date NOT NULL,
    data_fim    date NOT NULL,
    status      text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    project_id  uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);

COMMENT ON TABLE public.sprints IS 'Sprints / ciclos de trabalho';

-- 3. MEETINGS — Reuniões do Kanban
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.meetings (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo          text NOT NULL,
    data            date NOT NULL,
    horario_inicio  text,
    descricao       text,
    status          text NOT NULL DEFAULT 'a-agendar' CHECK (status IN ('a-agendar', 'confirmada', 'realizada')),
    link_reuniao    text,
    project_id      uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    updated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    deleted_at      timestamptz
);

COMMENT ON TABLE public.meetings IS 'Reuniões gerenciadas no Kanban';

-- 4. CARDS — Tarefas do TaskBoard
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cards (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo                  text NOT NULL,
    descricao               text,
    status                  text NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'a-fazer', 'em-progresso', 'bloqueado', 'concluido')),
    priority                text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    responsavel_principal   text,
    responsavel             text,
    sub_responsaveis        text[] DEFAULT '{}',
    prazo                   date,
    tags                    text[] DEFAULT '{}',
    urgente                 boolean NOT NULL DEFAULT false,
    sprint_id               uuid REFERENCES public.sprints(id) ON DELETE SET NULL,
    reuniao_id              uuid REFERENCES public.meetings(id) ON DELETE SET NULL,
    sub_tasks               jsonb DEFAULT '[]'::jsonb,
    comentarios             jsonb DEFAULT '[]'::jsonb,
    anexos                  jsonb DEFAULT '[]'::jsonb,
    historico               jsonb DEFAULT '[]'::jsonb,
    version                 integer NOT NULL DEFAULT 1,
    created_by              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_by              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at              timestamptz NOT NULL DEFAULT now(),
    deleted_at              timestamptz
);

COMMENT ON TABLE public.cards IS 'Tarefas / cards do TaskBoard';

-- 5. AUDIT_LOGS — Rastreamento de ações
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action      text NOT NULL,
    entity_type text NOT NULL,
    entity_id   text,
    details     jsonb DEFAULT '{}'::jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Log de auditoria de ações no sistema';

-- ============================================================================
-- INDEXES — Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_cards_status          ON public.cards(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cards_sprint_id       ON public.cards(sprint_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at      ON public.cards(deleted_at);
CREATE INDEX IF NOT EXISTS idx_meetings_status       ON public.meetings(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_meetings_data         ON public.meetings(data) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sprints_status        ON public.sprints(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity     ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user       ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created    ON public.audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY — Habilitar e criar políticas
-- ============================================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES: Usuários autenticados podem ler todos, mas só editar o próprio
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- SPRINTS: Full access para todos autenticados (equipe pequena)
DROP POLICY IF EXISTS "sprints_all_authenticated" ON public.sprints;
CREATE POLICY "sprints_all_authenticated" ON public.sprints
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MEETINGS: Full access para todos autenticados
DROP POLICY IF EXISTS "meetings_all_authenticated" ON public.meetings;
CREATE POLICY "meetings_all_authenticated" ON public.meetings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CARDS: Full access para todos autenticados
DROP POLICY IF EXISTS "cards_all_authenticated" ON public.cards;
CREATE POLICY "cards_all_authenticated" ON public.cards
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AUDIT_LOGS: Todos podem inserir/ler, ninguém deleta
DROP POLICY IF EXISTS "audit_logs_select_authenticated" ON public.audit_logs;
CREATE POLICY "audit_logs_select_authenticated" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- TRIGGER: Auto-criar profile quando novo usuário se registra
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_count integer;
    default_role text;
BEGIN
    -- Contar profiles existentes para determinar role
    SELECT count(*) INTO user_count FROM public.profiles;
    
    -- Primeiro usuário vira admin, demais viram viewer
    IF user_count = 0 THEN
        default_role := 'admin';
    ELSE
        default_role := 'viewer';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
        default_role,
        true,
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SEED: Criar profiles para usuários existentes que ainda não têm
-- ============================================================================
INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(COALESCE(u.email, ''), '@', 1)),
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY u.created_at ASC) = 1 THEN 'admin'
        ELSE 'viewer'
    END,
    true,
    now(),
    now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ORDER BY u.created_at ASC;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
DO $$
DECLARE
    tbl text;
    cnt integer;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['profiles','sprints','meetings','cards','audit_logs'])
    LOOP
        EXECUTE format('SELECT count(*) FROM public.%I', tbl) INTO cnt;
        RAISE NOTICE 'Tabela %: % registros', tbl, cnt;
    END LOOP;
    RAISE NOTICE '✅ Migração concluída com sucesso!';
END $$;
