    -- ============================================================
    -- 🚀 AGENDA-QA - SCRIPT DE CONFIGURAÇÃO RLS E POLÍTICAS
    -- ============================================================
    -- Este script configura RLS e políticas para o schema EXISTENTE
    -- Execute no SQL Editor do Supabase Dashboard
    -- URL: https://app.supabase.com/project/[SEU-PROJETO]/sql
    -- ============================================================

    -- NOTA: As tabelas já existem no seu banco. Este script apenas
    -- adiciona índices, habilita RLS e cria políticas de segurança.

    -- ============================================================
    -- SEÇÃO 1: EXTENSÕES NECESSÁRIAS
    -- ============================================================

    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- ============================================================
    -- SEÇÃO 2: CRIAR INDEXES PARA PERFORMANCE
    -- ============================================================

    -- Indexes para profiles
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
    CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

    -- Indexes para projects
    CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);

    -- Indexes para sprints
    CREATE INDEX IF NOT EXISTS idx_sprints_project ON public.sprints(project_id);
    CREATE INDEX IF NOT EXISTS idx_sprints_dates ON public.sprints(data_inicio, data_fim);
    CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);
    CREATE INDEX IF NOT EXISTS idx_sprints_created_by ON public.sprints(created_by);
    CREATE INDEX IF NOT EXISTS idx_sprints_active ON public.sprints(deleted_at) WHERE deleted_at IS NULL;

    -- Indexes para cards
    CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
    CREATE INDEX IF NOT EXISTS idx_cards_responsavel ON public.cards(responsavel_principal);
    CREATE INDEX IF NOT EXISTS idx_cards_sprint_id ON public.cards(sprint_id);
    CREATE INDEX IF NOT EXISTS idx_cards_reuniao_id ON public.cards(reuniao_id);
    CREATE INDEX IF NOT EXISTS idx_cards_priority ON public.cards(priority);
    CREATE INDEX IF NOT EXISTS idx_cards_created_by ON public.cards(created_by);
    CREATE INDEX IF NOT EXISTS idx_cards_created_at ON public.cards(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_cards_active ON public.cards(deleted_at) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_cards_urgente ON public.cards(urgente) WHERE urgente = true;

    -- Indexes para meetings
    CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings(created_by);
    CREATE INDEX IF NOT EXISTS idx_meetings_data ON public.meetings(data);
    CREATE INDEX IF NOT EXISTS idx_meetings_prioridade ON public.meetings(prioridade);
    CREATE INDEX IF NOT EXISTS idx_meetings_active ON public.meetings(deleted_at) WHERE deleted_at IS NULL;

    -- Indexes para comentarios
    CREATE INDEX IF NOT EXISTS idx_comentarios_card_id ON public.comentarios(card_id);
    CREATE INDEX IF NOT EXISTS idx_comentarios_autor ON public.comentarios(autor_id);
    CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comentarios_active ON public.comentarios(deleted_at) WHERE deleted_at IS NULL;

    -- Indexes para anexos
    CREATE INDEX IF NOT EXISTS idx_anexos_card_id ON public.anexos(card_id);
    CREATE INDEX IF NOT EXISTS idx_anexos_uploaded_by ON public.anexos(uploaded_by);
    CREATE INDEX IF NOT EXISTS idx_anexos_active ON public.anexos(deleted_at) WHERE deleted_at IS NULL;

    -- Indexes para audit_logs
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

    -- Indexes para comment_reads
    CREATE INDEX IF NOT EXISTS idx_comment_reads_card ON public.comment_reads(card_id);

    -- ============================================================
    -- SEÇÃO 3: HABILITAR RLS EM TODAS AS TABELAS
    -- ============================================================

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.comment_reads ENABLE ROW LEVEL SECURITY;

    -- ============================================================
    -- SEÇÃO 4: POLÍTICAS RLS PARA PROFILES
    -- ============================================================

    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
    CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
        SELECT 1 FROM public.profiles p2 
        WHERE p2.id = auth.uid() AND p2.role = 'admin' AND p2.is_active = TRUE
        )
    );

    -- Permitir leitura de outros profiles (para exibir nomes)
    DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
    CREATE POLICY "Users can read all profiles" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

    -- ============================================================
    -- SEÇÃO 5: POLÍTICAS RLS PARA PROJECTS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;
    CREATE POLICY "Users can view all projects" ON public.projects
    FOR SELECT USING (auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
    CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (created_by = auth.uid());

    DROP POLICY IF EXISTS "Creators can update projects" ON public.projects;
    CREATE POLICY "Creators can update projects" ON public.projects
    FOR UPDATE USING (created_by = auth.uid());

    DROP POLICY IF EXISTS "Creators can delete projects" ON public.projects;
    CREATE POLICY "Creators can delete projects" ON public.projects
    FOR DELETE USING (created_by = auth.uid());

    -- ============================================================
    -- SEÇÃO 6: POLÍTICAS RLS PARA SPRINTS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can view all sprints" ON public.sprints;
    CREATE POLICY "Users can view all sprints" ON public.sprints
    FOR SELECT USING (
        deleted_at IS NULL AND auth.uid() IS NOT NULL
    );

    DROP POLICY IF EXISTS "Users can create sprints" ON public.sprints;
    CREATE POLICY "Users can create sprints" ON public.sprints
    FOR INSERT WITH CHECK (created_by = auth.uid());

    DROP POLICY IF EXISTS "Creators can update sprints" ON public.sprints;
    CREATE POLICY "Creators can update sprints" ON public.sprints
    FOR UPDATE USING (
        deleted_at IS NULL AND created_by = auth.uid()
    );

    DROP POLICY IF EXISTS "Creators can delete sprints" ON public.sprints;
    CREATE POLICY "Creators can delete sprints" ON public.sprints
    FOR DELETE USING (created_by = auth.uid());

    -- ============================================================
    -- SEÇÃO 7: POLÍTICAS RLS PARA CARDS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can view all cards" ON public.cards;
    CREATE POLICY "Users can view all cards" ON public.cards
    FOR SELECT USING (
        deleted_at IS NULL AND auth.uid() IS NOT NULL
    );

    DROP POLICY IF EXISTS "Users can create cards" ON public.cards;
    CREATE POLICY "Users can create cards" ON public.cards
    FOR INSERT WITH CHECK (created_by = auth.uid());

    DROP POLICY IF EXISTS "Users can update cards" ON public.cards;
    CREATE POLICY "Users can update cards" ON public.cards
    FOR UPDATE USING (
        deleted_at IS NULL
        AND (
        created_by = auth.uid()
        OR responsavel_principal = auth.uid()
        OR auth.uid() = ANY(sub_responsaveis)
        )
    );

    DROP POLICY IF EXISTS "Creators can delete cards" ON public.cards;
    CREATE POLICY "Creators can delete cards" ON public.cards
    FOR DELETE USING (created_by = auth.uid());

    -- ============================================================
    -- SEÇÃO 8: POLÍTICAS RLS PARA MEETINGS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can view all meetings" ON public.meetings;
    CREATE POLICY "Users can view all meetings" ON public.meetings
    FOR SELECT USING (
        deleted_at IS NULL AND auth.uid() IS NOT NULL
    );

    DROP POLICY IF EXISTS "Users can create meetings" ON public.meetings;
    CREATE POLICY "Users can create meetings" ON public.meetings
    FOR INSERT WITH CHECK (created_by = auth.uid());

    DROP POLICY IF EXISTS "Users can update meetings" ON public.meetings;
    CREATE POLICY "Users can update meetings" ON public.meetings
    FOR UPDATE USING (
        deleted_at IS NULL
        AND (
        created_by = auth.uid()
        OR auth.uid() = ANY(participantes)
        )
    );

    DROP POLICY IF EXISTS "Creators can delete meetings" ON public.meetings;
    CREATE POLICY "Creators can delete meetings" ON public.meetings
    FOR DELETE USING (created_by = auth.uid());

    -- ============================================================
    -- SEÇÃO 9: POLÍTICAS RLS PARA COMENTARIOS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can view all comments" ON public.comentarios;
    CREATE POLICY "Users can view all comments" ON public.comentarios
    FOR SELECT USING (
        deleted_at IS NULL AND auth.uid() IS NOT NULL
    );

    DROP POLICY IF EXISTS "Users can create comments" ON public.comentarios;
    CREATE POLICY "Users can create comments" ON public.comentarios
    FOR INSERT WITH CHECK (autor_id = auth.uid());

    DROP POLICY IF EXISTS "Authors can update comments" ON public.comentarios;
    CREATE POLICY "Authors can update comments" ON public.comentarios
    FOR UPDATE USING (
        deleted_at IS NULL AND autor_id = auth.uid()
    );

    DROP POLICY IF EXISTS "Authors can delete comments" ON public.comentarios;
    CREATE POLICY "Authors can delete comments" ON public.comentarios
    FOR DELETE USING (autor_id = auth.uid());

    -- ============================================================
    -- SEÇÃO 10: POLÍTICAS RLS PARA ANEXOS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can view all attachments" ON public.anexos;
    CREATE POLICY "Users can view all attachments" ON public.anexos
    FOR SELECT USING (
        deleted_at IS NULL AND auth.uid() IS NOT NULL
    );

    DROP POLICY IF EXISTS "Users can upload attachments" ON public.anexos;
    CREATE POLICY "Users can upload attachments" ON public.anexos
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

    DROP POLICY IF EXISTS "Uploaders can delete attachments" ON public.anexos;
    CREATE POLICY "Uploaders can delete attachments" ON public.anexos
    FOR DELETE USING (uploaded_by = auth.uid());

    -- ============================================================
    -- SEÇÃO 11: POLÍTICAS RLS PARA AUDIT_LOGS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
    CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid());

    DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
    CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

    DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
    CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

    -- ============================================================
    -- SEÇÃO 12: POLÍTICAS RLS PARA COMMENT_READS
    -- ============================================================

    DROP POLICY IF EXISTS "Users can manage own read status" ON public.comment_reads;
    CREATE POLICY "Users can manage own read status" ON public.comment_reads
    FOR ALL USING (user_id = auth.uid());

    -- ============================================================
    -- SEÇÃO 13: FUNÇÕES E TRIGGERS
    -- ============================================================

    -- 13.1 Trigger para criar profile automaticamente no signup
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

    -- 13.2 Função para atualizar updated_at automaticamente
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Triggers para updated_at
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
    CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
    CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_sprints_updated_at ON public.sprints;
    CREATE TRIGGER update_sprints_updated_at
    BEFORE UPDATE ON public.sprints
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_cards_updated_at ON public.cards;
    CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_meetings_updated_at ON public.meetings;
    CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_comentarios_updated_at ON public.comentarios;
    CREATE TRIGGER update_comentarios_updated_at
    BEFORE UPDATE ON public.comentarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    -- ============================================================
    -- SEÇÃO 14: PERMISSÕES FINAIS
    -- ============================================================

    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO anon;

    GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprints TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.comentarios TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.anexos TO authenticated;
    GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.comment_reads TO authenticated;

    -- ============================================================
    -- SEÇÃO 15: VERIFICAÇÃO FINAL
    -- ============================================================

    -- Execute esta query para verificar se RLS está habilitado:
    SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS ON' ELSE '❌ RLS OFF' END as rls_status
    FROM pg_tables pt
    JOIN pg_class pc ON pt.tablename = pc.relname AND pt.schemaname = pc.relnamespace::regnamespace::text
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'projects', 'sprints', 'cards', 'meetings', 'comentarios', 'anexos', 'audit_logs', 'comment_reads')
    ORDER BY tablename;

    -- ============================================================
    -- ✅ CONFIGURAÇÃO COMPLETA!
    -- ============================================================
    -- Após rodar este script:
    -- 1. Verifique a query acima - todas devem mostrar "✅ RLS ON"
    -- 2. Teste criando um usuário via Auth
    -- 3. Verifique se o profile foi criado automaticamente
    -- ============================================================
