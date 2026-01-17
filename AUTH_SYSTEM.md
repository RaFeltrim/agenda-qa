# 🔐 Sistema de Autenticação & RBAC - Agenda QA

## 📋 Visão Geral

Sistema de autenticação seguro com controle de acesso baseado em roles (RBAC) para o Kanban Board da equipe QA.

## 👥 Usuários & Permissões

### Grupo 1: Editors (Acesso Completo)

- **Permissões**: Criar, editar, deletar cards, gerenciar usuários, acesso admin
- **Usuários**:
  - Rafael Feltrim (`Board_RFeltrim`) - QA PL
  - Mauricio Cordeiro Lyrio Monteiro (`Board_MCordeiro`) - QA SR Especialista
  - Luiz Muller Coromi Velasco (`Board_LMuller`) - QAOps SR Especialista

### Grupo 2: Viewers (Acesso Limitado)

- **Permissões**: Visualizar cards, comentar apenas
- **Usuários**:
  - Fabiana Custódio de Oliveira (`Board_FCustodio`) - HEAD do Squad QA
  - João Paulo Voss Duarte (`Board_JPaulo`) - QA Gestor do Squad

## 🔑 Fluxo de Autenticação

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
```

## 🛠️ Componentes Implementados

### 1. Login.tsx

- Tela de login com validação de campos
- Mascaramento de senha com toggle de visibilidade
- Feedback visual de loading
- Tratamento de erros de autenticação

### 2. FirstPasswordChange.tsx

- Modal de alteração de senha obrigatória no primeiro login
- Validação de força de senha em tempo real
- Feedback visual com barra de progresso
- Requisitos: 12+ caracteres, maiúscula, minúscula, número, especial

### 3. useAuth.ts (Hook)

- Gerenciamento de estado de autenticação
- Funções: login, logout, changePassword
- Persistência de sessão
- Detecção automática de role do usuário

### 4. authService.ts (Service)

- Validação de força de senha
- Integração com Supabase Auth
- Gerenciamento de perfis de usuário
- Lógica de primeiro login

### 5. ProtectedRoute.tsx

- Componente wrapper para rotas protegidas
- Redirecionamento automático para login quando não autenticado
- Validação de roles para acesso restrito

### 6. Supabase Integration

- Autenticação via email/password
- Row Level Security (RLS) nas tabelas
- Perfis de usuário com roles
- Sessões persistentes

## 🔒 Requisitos de Segurança

### Senhas

- **Comprimento mínimo**: 12 caracteres
- **Complexidade**: Maiúscula, minúscula, número, caractere especial
- **Armazenamento**: Hash bcrypt via Supabase
- **Validação**: Frontend + Backend

### Autenticação

- **JWT Tokens**: Com expiração configurável
- **Refresh automático**: Gerenciado pelo Supabase
- **HTTPS obrigatório**: Em produção
- **Rate limiting**: Configurável no Supabase

### Autorização (RBAC)

- **Row Level Security**: Políticas restritivas no banco
- **Controle por role**: Editors vs Viewers
- **Interface adaptativa**: Elementos escondidos/desabilitados

## 🗄️ Schema do Banco (Supabase)

```sql
-- Tabela de perfis de usuário
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

-- Row Level Security
alter table profiles enable row level security;

-- Políticas
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
```

## 🚀 Deployment

### 1. Configuração do Supabase

1. Criar projeto no Supabase
2. Executar schema SQL acima
3. Configurar RLS policies
4. Criar usuários via Dashboard
5. Definir variáveis de ambiente

### 2. Variáveis de Ambiente (.env)

```env
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Deploy Netlify

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente no Netlify
3. Build automático via CI/CD
4. HTTPS ativado automaticamente

## 🧪 Testes

### Testes Automatizados (Playwright)

- Login com credenciais inválidas
- Validação de força de senha
- Fluxo de primeiro login
- Controle de acesso por role
- Funcionalidades RBAC

### Testes Manuais

- [ ] Login com usuários editors
- [ ] Login com usuários viewers
- [ ] Alteração de senha no primeiro acesso
- [ ] Criação de cards (apenas editors)
- [ ] Edição de cards (apenas editors)
- [ ] Deleção de cards (apenas editors)
- [ ] Visualização de cards (todos)
- [ ] Comentários (todos)

## 📊 Métricas de Segurança

- ✅ **Autenticação**: 100% dos acessos requerem login
- ✅ **Autorização**: Controle granular por role
- ✅ **Senhas**: Política de força obrigatória
- ✅ **Sessões**: Expiração automática
- ✅ **Auditoria**: Logs de acesso e modificações
- ✅ **Transporte**: HTTPS obrigatório em produção

## 🆘 Troubleshooting

### Problemas Comuns

**"Usuário ou senha inválidos"**

- Verificar se usuário existe no Supabase
- Confirmar que senha foi alterada após primeiro login

**"Acesso negado" para funcionalidades**

- Verificar role do usuário no perfil
- Confirmar RLS policies estão configuradas

**Sessão expirando muito rápido**

- Ajustar `sessionRefreshInterval` no cliente Supabase
- Verificar configuração de expiração de tokens

## 📞 Suporte

Para issues relacionadas à autenticação:

1. Verificar logs do console do navegador
2. Consultar Network tab para erros de API
3. Validar configuração do Supabase
4. Confirmar variáveis de ambiente

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2026  
**Status**: ✅ Produção Ready
