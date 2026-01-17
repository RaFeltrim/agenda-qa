-- 🔧 SCRIPT DE SETUP COMPLETO - AGENDA KANBAN v3.0
-- Execute em partes ou completo no Supabase SQL Editor

-- ================================================
-- ⚠️ FASE 1: LIMPEZA DAS TABELAS EXISTENTES
-- ================================================

-- Remover RLS policies existentes
DROP POLICY IF EXISTS "Users can see own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can update own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can see comentarios from their cards" ON public.comentarios;
DROP POLICY IF EXISTS "Users can add comentarios to their cards" ON public.comentarios;
DROP POLICY IF EXISTS "Users can see anexos from their cards" ON public.anexos;
DROP POLICY IF EXISTS "Users can see their reunioes" ON public.reunioes;
DROP POLICY IF EXISTS "Users can see historico from their cards" ON public.historico;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Desabilitar RLS temporariamente
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover tabelas existentes (se existirem)
DROP TABLE IF EXISTS public.historico CASCADE;
DROP TABLE IF EXISTS public.reunioes CASCADE;
DROP TABLE IF EXISTS public.anexos CASCADE;
DROP TABLE IF EXISTS public.comentarios CASCADE;
DROP TABLE IF EXISTS public.cards CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ================================================
-- 🏗️ FASE 2: CRIAÇÃO DAS TABELAS
-- ================================================

-- Tabela 1: profiles (perfis de usuário - AUTENTICAÇÃO)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  first_login BOOLEAN DEFAULT TRUE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela 2: cards (principal do Kanban)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel TEXT,
  sub_responsaveis TEXT[] DEFAULT '{}',
  prazo DATE,
  status TEXT NOT NULL CHECK (status IN ('backlog', 'em-progresso', 'bloqueado', 'concluido')),
  tags TEXT[] DEFAULT '{}',
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_criacao_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reuniao_id UUID,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User relationship (para RLS)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela 3: comentarios (comentários nos cards)
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  autor_nome TEXT,
  texto TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabela 4: anexos (arquivos anexados)
CREATE TABLE IF NOT EXISTS public.anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT,
  size_bytes INTEGER,
  url TEXT NOT NULL,
  storage_path TEXT,
  uploadado_por UUID REFERENCES auth.users(id),
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabela 5: reunioes (reuniões agendadas)
CREATE TABLE IF NOT EXISTS public.reunioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  horario_inicio TIME,
  horario_fim TIME,
  participantes TEXT[] DEFAULT '{}',
  local TEXT,
  descricao TEXT,
  criado_por UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela 6: historico (auditoria de mudanças)
CREATE TABLE IF NOT EXISTS public.historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  descricao TEXT,
  por UUID NOT NULL REFERENCES auth.users(id),
  em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dados_antigos JSONB,
  dados_novos JSONB
);

-- ================================================
-- 📈 FASE 3: CRIAÇÃO DE ÍNDICES
-- ================================================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_reuniao_id ON public.cards(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at ON public.cards(deleted_at);

CREATE INDEX IF NOT EXISTS idx_comentarios_card_id ON public.comentarios(card_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_autor_id ON public.comentarios(autor_id);

CREATE INDEX IF NOT EXISTS idx_anexos_card_id ON public.anexos(card_id);

CREATE INDEX IF NOT EXISTS idx_reunioes_data ON public.reunioes(data);
CREATE INDEX IF NOT EXISTS idx_reunioes_user_id ON public.reunioes(user_id);

CREATE INDEX IF NOT EXISTS idx_historico_card_id ON public.historico(card_id);

-- ================================================
-- 🔒 FASE 4: CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY)
-- ================================================

-- Reabilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para cards
CREATE POLICY "Users can see own cards" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.cards
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para comentarios
CREATE POLICY "Users can see comentarios from their cards" ON public.comentarios
  FOR SELECT USING (
    card_id IN (SELECT id FROM public.cards WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can add comentarios to their cards" ON public.comentarios
  FOR INSERT WITH CHECK (
    card_id IN (SELECT id FROM public.cards WHERE user_id = auth.uid())
  );

-- Políticas para anexos
CREATE POLICY "Users can see anexos from their cards" ON public.anexos
  FOR SELECT USING (
    card_id IN (SELECT id FROM public.cards WHERE user_id = auth.uid())
  );

-- Políticas para reunioes
CREATE POLICY "Users can see their reunioes" ON public.reunioes
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para historico
CREATE POLICY "Users can see historico from their cards" ON public.historico
  FOR SELECT USING (
    card_id IN (SELECT id FROM public.cards WHERE user_id = auth.uid())
  );

-- ================================================
-- 🔄 FASE 5: CONFIGURAÇÃO REALTIME
-- ================================================

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.cards, public.comentarios, public.anexos, public.reunioes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards, public.comentarios, public.anexos, public.reunioes;

-- ================================================
-- 📋 FASE 6: INSERÇÃO DE DADOS INICIAIS (OPCIONAL)
-- ================================================

-- Inserir usuários de exemplo (substituir UUIDs pelos reais do Supabase)
/*
INSERT INTO public.profiles (id, username, full_name, role, first_login)
VALUES
  ('uuid-real-1', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true),
  ('uuid-real-2', 'Board_MCordeiro', 'Mauricio Cordeiro', 'editor', true),
  ('uuid-real-3', 'Board_LMuller', 'Luiz Muller', 'editor', true),
  ('uuid-real-4', 'Board_FCustodio', 'Fabiana Custodio', 'viewer', true),
  ('uuid-real-5', 'Board_JPaulo', 'João Paulo', 'viewer', true),
  ('uuid-real-6', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true);
*/

-- ================================================
-- ✅ SETUP COMPLETO!
-- ================================================

-- Verificação final
SELECT '✅ Setup completo!' as status;
SELECT COUNT(*) as tabelas_criadas FROM information_schema.tables WHERE table_schema = 'public';