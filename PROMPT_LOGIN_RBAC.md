# 🔐 IMPLEMENTAÇÃO DE SISTEMA DE LOGIN - AGENDA KANBAN V3.0

## Prompt para Qoder Agent - Modo LITE

---

## 📋 CONTEXTO DO PROJETO

**Status Atual:** Board Kanban criado e deployado em Netlify  
**URL Produção:** https://agenda-qa.netlify.app/  
**Próxima Feature:** Sistema de Autenticação + RBAC (Role-Based Access Control)  
**Tecnologia:** Supabase Auth + React + TypeScript + Tailwind CSS

---

## 👥 USUÁRIOS & PERMISSÕES

### Grupo 1: QA Engineers (Acesso Total)

1. **Rafael Feltrim** - QA PL
   - Username: `Board_RFeltrim`
   - Permissões: Criar, editar, deletar cards, gerenciar usuários, acessar admin

2. **Mauricio Cordeiro Lyrio Monteiro** - QA SR Especialista
   - Username: `Board_MCordeiro`
   - Permissões: Criar, editar, deletar cards, comentar

3. **Luiz Muller Coromi Velasco** - QAOps SR Especialista
   - Username: `Board_LMuller`
   - Permissões: Criar, editar, deletar cards, comentar

### Grupo 2: Visualizadores (Acesso Limitado)

1. **Fabiana Custódio de Oliveira** - HEAD do Squad QA
   - Username: `Board_FCustodio`
   - Permissões: Visualizar cards, comentar APENAS

2. **João Paulo Voss Duarte** - QA Gestor do Squad
   - Username: `Board_JPaulo`
   - Permissões: Visualizar cards, comentar APENAS

---

## 🔑 FLUXO DE AUTENTICAÇÃO

```
USUÁRIO ACESSA APP
  ↓
[Login.tsx] - Tela de Login (Username + Senha Primária)
  ↓
PRIMEIRO LOGIN?
  ├─ SIM → [FirstPasswordChange.tsx] - Criar nova senha
  │        └─ Supabase atualiza user_metadata (first_login: false)
  │        └─ Redireciona para Kanban
  │
  └─ NÃO → Autentica com nova senha
           └─ Redireciona para Kanban

AUTENTICADO
  ↓
[App.tsx] - Verifica role do usuário
  ├─ "editor" → Renderiza Kanban completo
  └─ "viewer" → Renderiza Kanban + desativa botões de edição
```

---

## 🗄️ SCHEMA SUPABASE NECESSÁRIO

### 1. Estender auth.users com dados customizados

```sql
-- Tabela de profiles com role e status de primeiro login
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('editor', 'viewer')),
  first_login boolean default true,
  password_changed_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Índices para performance
create index idx_profiles_username on profiles(username);
create index idx_profiles_role on profiles(role);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
```

### 2. Inserir usuários (execute no SQL Editor do Supabase)

```sql
-- Inserir usuários via Supabase Auth API
-- Use a interface do Supabase Dashboard para criar os usuários com senhas primárias
-- Ou execute via script Node.js

-- Exemplo: Após criar via Dashboard, inserir profiles
insert into profiles (id, username, full_name, role, first_login)
values
  ('USER_ID_RAFAEL', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true),
  ('USER_ID_MAURICIO', 'Board_MCordeiro', 'Mauricio Cordeiro Lyrio Monteiro', 'editor', true),
  ('USER_ID_LUIZ', 'Board_LMuller', 'Luiz Muller Coromi Velasco', 'editor', true),
  ('USER_ID_FABIANA', 'Board_FCustodio', 'Fabiana Custódio de Oliveira', 'viewer', true),
  ('USER_ID_JOAO', 'Board_JPaulo', 'João Paulo Voss Duarte', 'viewer', true);
```

---

## 📦 COMPONENTES A IMPLEMENTAR

### 1️⃣ Login.tsx (Tela de Login)

**Requisitos:**

- Input para username (com autofoco)
- Input para senha (máscara com toggle de visibilidade)
- Botão "Entrar"
- Logo/Branding da empresa
- Validação de campos (obrigatórios)
- Mensagens de erro claras
- Loading state durante autenticação
- Responsivo mobile
- Dark mode support
- Autenticação via Supabase (email + password)
  - Username → converter para email (ex: `Board_RFeltrim@agenda-qa.internal`)
  - Validar credenciais contra Supabase
  - Se falhar: mostrar erro "Usuário ou senha inválidos"

### 2️⃣ FirstPasswordChange.tsx (Alterar Senha Inicial)

**Requisitos:**

- Modal/página de alterar senha após primeiro login
- Campos:
  - Senha atual (pré-preenchida automaticamente)
  - Nova senha (com validação de força)
  - Confirmar nova senha
- Validação de força de senha:
  - Mínimo 12 caracteres
  - Pelo menos 1 maiúscula
  - Pelo menos 1 minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial (!@#$%^&\*)
- Mostrar feedback visual de força (barra de progresso)
- Botão "Atualizar Senha"
- Loading state
- Confirmação de sucesso
- Redirect para Kanban após sucesso

### 3️⃣ useAuth.ts (Hook de Autenticação)

**Requisitos:**

- Estado: user, loading, error, role
- Funções:
  - `login(username, password)` → autenticar
  - `changePassword(newPassword)` → alterar senha
  - `logout()` → deslogar
  - `getSession()` → recuperar sessão
  - `updateFirstLoginFlag()` → marcar primeiro login como feito
- Persistência de sessão via localStorage
- Auto-refresh de token
- Captura de role do usuário

### 4️⃣ authService.ts (Serviço de Autenticação)

**Requisitos:**

- Função `signIn(username, password)`
  - Converter username para email
  - Chamar `supabase.auth.signInWithPassword()`
  - Buscar perfil do usuário
  - Retornar { user, profile, role }
- Função `changePassword(newPassword)`
  - Validar força de senha
  - Chamar `supabase.auth.updateUser()`
  - Atualizar `password_changed_at` em profiles
- Função `logout()`
  - Chamar `supabase.auth.signOut()`
- Função `getCurrentUser()`
  - Buscar usuário autenticado
  - Buscar perfil (role, first_login)
- Função `validatePassword(password)`
  - Validar força de senha
  - Retornar { valid, errors[] }

### 5️⃣ ProtectedRoute.tsx (Componente de Rota Protegida)

**Requisitos:**

- Wrapper que valida autenticação
- Se não autenticado → redireciona para Login
- Se autenticado → renderiza componente
- Se role = "viewer" e tentando acessar rota de editor → redireciona

### 6️⃣ Integração em App.tsx

**Requisitos:**

- Carregar sessão ao iniciar (useEffect)
- Se não autenticado → mostrar `<Login />`
- Se autenticado + primeiro login → mostrar `<FirstPasswordChange />`
- Se autenticado + não é primeiro login → mostrar Kanban
- Passar `role` para componentes filhos
- Renderização condicional de botões baseado em role

### 7️⃣ Integração em KanbanBoard.tsx

**Requisitos:**

- Receber `role` via prop ou context
- Se role = "editor":
  - Mostrar: "+ Novo Card", botão editar, botão deletar
  - Permitir: drag-drop, criar, editar, deletar
- Se role = "viewer":
  - ESCONDER: "+ Novo Card", botão editar, botão deletar
  - DESABILITAR: drag-drop, criar, editar, deletar
  - PERMITIR: visualizar, comentar apenas

### 8️⃣ Header.tsx (Atualizar com Menu de Usuário)

**Requisitos:**

- Mostrar nome do usuário autenticado
- Avatar com inicial do nome
- Menu dropdown:
  - "Meu Perfil"
  - "Alterar Senha"
  - "Logout"
- Indicador visual de role (badge "Editor" ou "Viewer")

---

## 🔒 REQUISITOS DE SEGURANÇA

### Para Supabase

```
✅ Row Level Security (RLS) ativado em todas as tabelas
✅ Políticas RLS restritivas (usuários veem só seus dados)
✅ JWT tokens com expiração (3600 segundos)
✅ Refresh tokens armazenados seguramente
✅ HTTPS obrigatório
✅ CORS configurado apenas para https://agenda-qa.netlify.app/
```

### Para Senhas

```
✅ Senhas armazenadas com hash bcrypt (Supabase faz isso)
✅ Senhas nunca transmitidas em log
✅ Validação de força de senha no frontend + backend
✅ Primeira senha primária deve ser alterada no primeiro login
✅ Histórico de mudanças de senha
```

### Para Frontend

```
✅ Tokens NUNCA em localStorage inseguro (Supabase gerencia)
✅ CSRF protection
✅ Input validation + sanitization
✅ Error messages genéricas ("Usuário ou senha inválidos")
✅ Rate limiting de tentativas de login (implementar no Supabase)
✅ Logout automático após 30 minutos de inatividade (opcional)
```

### Para Netlify

```
✅ Environment variables seguros (.env.local):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
✅ Secrets não expostos no código
✅ Deploy com HTTPS obrigatório (Netlify já faz)
✅ Logs de acesso monitorados
✅ Backup automático
```

---

## 📝 IMPLEMENTAÇÃO PASSO-A-PASSO

### Fase 1: Preparar Supabase (20 min)

1. Executar SQL de criação de profiles
2. Criar usuários via Supabase Dashboard
   - Email: `Board_RFeltrim@agenda-qa.internal` (ou usar domain real)
   - Senha temporária: gerar senha forte
   - Marcar: "Auto send invite email" = FALSE (já estão na organização)
3. Inserir dados em profiles (via SQL)
4. Testar RLS policies
5. Gerar JWT keys se necessário

### Fase 2: Criar Componentes de Login (60 min)

1. `src/components/Login.tsx`
   - Form com validação
   - Conexão com authService
   - Redirecionar se já autenticado
2. `src/components/FirstPasswordChange.tsx`
   - Form de alterar senha
   - Validação de força
   - Feedback visual
3. `src/services/authService.ts`
   - Funções de sign in, change password, logout
   - Validação de força de senha
4. `src/hooks/useAuth.ts`
   - Hook com estado e funções
   - Persistência de sessão
5. `src/components/ProtectedRoute.tsx`
   - Wrapper de rota protegida

### Fase 3: Integrar no App (45 min)

1. Atualizar `src/App.tsx`
   - Usar useAuth()
   - Renderização condicional
   - Passar role para componentes
2. Atualizar `src/components/KanbanBoard.tsx`
   - Desabilitar funcionalidades para viewers
   - Mostrar/esconder botões baseado em role
3. Atualizar `src/components/Card.tsx`
   - Desabilitar edição para viewers
4. Atualizar `src/components/Header.tsx`
   - Menu de usuário
   - Badge de role
   - Logout

### Fase 4: Segurança & Testes (45 min)

1. Validar CORS no Supabase
2. Testar RLS policies
3. Testar fluxo completo:
   - Login com credentials errados → erro
   - Primeiro login → solicita alteração de senha
   - Alterar senha com força fraca → erro
   - Alterar senha com força ok → sucesso
   - Logout funciona
   - Viewer não consegue deletar card
   - Editor consegue tudo
4. Testes de segurança:
   - Não conseguir acessar rota sem autenticação
   - Session persiste ao refresh
   - Token expira corretamente
5. Rodar smoke tests

### Fase 5: Deploy (20 min)

1. Atualizar .env.local com URLs
2. Verificar CORS em Supabase
3. Fazer commit: `git add . && git commit -m "feat: auth system with RBAC"`
4. Push para main
5. Deploy em Netlify
6. Testar em produção

---

## 🧪 TESTES AUTOMATIZADOS (Playwright)

### Teste 1: Login Inválido

```typescript
test('Login com credenciais inválidas mostra erro', async ({ page }) => {
  await page.goto('https://agenda-qa.netlify.app/');
  await page.fill('input[name="username"]', 'invalid_user');
  await page.fill('input[name="password"]', 'invalid_password');
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Usuário ou senha inválidos')).toBeVisible();
});
```

### Teste 2: Primeiro Login

```typescript
test('Primeiro login redireciona para alterar senha', async ({ page }) => {
  await page.goto('https://agenda-qa.netlify.app/');
  await page.fill('input[name="username"]', 'Board_RFeltrim');
  await page.fill('input[name="password"]', 'PRIMARY_PASSWORD');
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Alterar Senha')).toBeVisible();
});
```

### Teste 3: Alterar Senha

```typescript
test('Alterar senha e fazer login com nova senha', async ({ page }) => {
  // Login com senha primária
  // Alterar para nova senha
  // Logout
  // Login com nova senha → sucesso
});
```

### Teste 4: RBAC - Viewer

```typescript
test('Viewer não consegue deletar card', async ({ page }) => {
  // Login como viewer
  // Abrir card
  // Verificar que botão "Deletar" não existe
  // Tentar via fetch direto → 403 Forbidden (RLS)
});
```

### Teste 5: RBAC - Editor

```typescript
test('Editor consegue deletar card', async ({ page }) => {
  // Login como editor
  // Abrir card
  // Clicar botão "Deletar"
  // Card desaparece
});
```

---

## 🎨 DESIGN DO LOGIN

Seguir o design system do projeto:

- **Cores:** Blue-600 para CTA, Slate-50 para background
- **Tipografia:** Font-bold para "Entrada", Body regular para inputs
- **Espaçamento:** Padding 6-8, Gap 4
- **Componentes:** Input com border-slate-300, Button com bg-blue-600
- **Dark Mode:** Suportado com `dark:bg-slate-900` etc
- **Animações:** Fade-in suave quando carrega login

---

## 📋 CHECKLIST DE ENTREGA

```
✅ SUPABASE
  □ Tabela profiles criada
  □ 5 usuários criados
  □ RLS policies funcionando
  □ CORS configurado

✅ COMPONENTES
  □ Login.tsx renderiza
  □ FirstPasswordChange.tsx renderiza
  □ authService.ts pronto
  □ useAuth.ts pronto
  □ ProtectedRoute.tsx pronto

✅ FLUXO
  □ Login com credenciais corretas funciona
  □ Login com credenciais erradas mostra erro
  □ Primeiro login redireciona para alterar senha
  □ Alterar senha com força fraca falha
  □ Alterar senha com força ok sucede
  □ Logout funciona

✅ RBAC
  □ Viewer não consegue criar card
  □ Viewer não consegue deletar card
  □ Viewer consegue comentar
  □ Editor consegue tudo
  □ RLS bloqueia acesso indevido

✅ SEGURANÇA
  □ npm run typecheck → SEM ERROS
  □ npm run lint → SEM ERROS
  □ npm run dev → ABRE
  □ Senhas nunca em logs
  □ CORS restritivo
  □ RLS em todas as tabelas

✅ TESTES
  □ Todos os 5 testes Playwright passam
  □ npm run test:smoke → PASSED
  □ Teste manual em produção OK

RESULTADO: ✅ SEGURO E PRONTO PARA PRODUÇÃO
```

---

## 📞 DÚVIDAS? PERGUNTAS?

Se algo não está claro durante a implementação:

1. **Sobre usuários:** "Devo criar os usuários via Supabase Dashboard ou API?"
2. **Sobre senhas:** "Qual deve ser a senha primária para os usuários?"
3. **Sobre emails:** "Vamos usar emails reais ou `@agenda-qa.internal`?"
4. **Sobre 2FA:** "Ativar autenticação de dois fatores?"
5. **Sobre tokens:** "Quanto tempo os tokens devem expirar? (recomendo 1 hora)"

---

**Prompt Versão:** v1.0 - Login & RBAC  
**Data:** 16 de janeiro de 2026  
**Status:** ✅ Pronto para o Qoder Agent Implementar  
**Tempo Estimado:** 3-4 horas  
**Deploy:** Netlify com HTTPS  
**Segurança:** Enterprise-grade com RLS
