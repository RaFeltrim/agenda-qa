-- 🚀 SETUP RÁPIDO DE USUÁRIOS - MÉTODO PRÁTICO

-- Etapa 1: Certifique-se que a tabela existe
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

-- Etapa 2: CRIE OS USUÁRIOS MANUALMENTE NO SUPABASE DASHBOARD
/*
ACESSE: Authentication → Users → Invite User

CRIE EXATAMENTE ESTES USUÁRIOS:

EDITOR 1:
Email: editor1@agenda-qa.test
Senha: Teste123!@#Editor
Nome: Editor Teste 1

EDITOR 2:
Email: editor2@agenda-qa.test
Senha: Teste456$%&Editor
Nome: Editor Teste 2

EDITOR 3:
Email: editor3@agenda-qa.test
Senha: Teste789*()Editor
Nome: Editor Teste 3

VIEWER 1:
Email: viewer1@agenda-qa.test
Senha: Teste123!@#Viewer
Nome: Viewer Teste 1

VIEWER 2:
Email: viewer2@agenda-qa.test
Senha: Teste456$%&Viewer
Nome: Viewer Teste 2

VIEWER 3:
Email: viewer3@agenda-qa.test
Senha: Teste789*()Viewer
Nome: Viewer Teste 3
*/

-- Etapa 3: APÓS CRIAR OS USUÁRIOS, SUBSTITUA OS UUIDs ABAIXO
-- Vá em Authentication → Users → Clique em cada usuário → Copie o ID

-- SUBSTITUA todos os 'UUID-AQUI' pelos IDs reais:
INSERT INTO public.profiles (id, username, full_name, role, first_login) VALUES
  ('UUID-AQUI-EDITOR1', 'editor1', 'Editor Teste 1', 'editor', true),
  ('UUID-AQUI-EDITOR2', 'editor2', 'Editor Teste 2', 'editor', true),
  ('UUID-AQUI-EDITOR3', 'editor3', 'Editor Teste 3', 'editor', true),
  ('UUID-AQUI-VIEWER1', 'viewer1', 'Viewer Teste 1', 'viewer', true),
  ('UUID-AQUI-VIEWER2', 'viewer2', 'Viewer Teste 2', 'viewer', true),
  ('UUID-AQUI-VIEWER3', 'viewer3', 'Viewer Teste 3', 'viewer', true)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  first_login = EXCLUDED.first_login;

-- Etapa 4: Verificação
SELECT '✅ Usuários configurados!' as resultado;
SELECT role, COUNT(*) as total FROM public.profiles GROUP BY role;