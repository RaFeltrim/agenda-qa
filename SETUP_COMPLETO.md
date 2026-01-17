# 🛠️ SETUP COMPLETO DO SISTEMA - AGENDA KANBAN v3.0

## 📋 VISÃO GERAL

Este documento contém todas as instruções para configurar completamente o sistema de Kanban com autenticação RBAC.

## 🏗️ ARQUITETURA IMPLEMENTADA

### Componentes Principais Criados:

1. **Autenticação**: Login, FirstPasswordChange, ProtectedRoute
2. **Hooks**: useAuth para gerenciamento de estado
3. **Services**: authService para lógica de negócio
4. **Integração**: Supabase Client configurado
5. **RBAC**: Controle de acesso baseado em roles

## 🔧 CONFIGURAÇÃO DO BANCO (SUPABASE)

### Passo 1: Executar Script de Setup

**Arquivo:** `supabase-setup.sql`

Este script realiza:

- ✅ Limpeza de tabelas existentes
- ✅ Criação de todas as tabelas necessárias
- ✅ Configuração de índices para performance
- ✅ Ativação de Row Level Security (RLS)
- ✅ Criação de políticas de acesso
- ✅ Configuração do Realtime

### Passo 2: Criar Usuários de Autenticação

Via Supabase Dashboard:

1. Ir em **Authentication → Users**
2. Criar cada usuário com:
   - **Email:** `{username}@agenda-qa.internal`
   - **Senha temporária:** Seguindo política de força
   - **Desmarcar:** "Send magic link email"

### Passo 3: Inserir Perfis de Usuários

```sql
-- Após criar usuários, inserir perfis
INSERT INTO profiles (id, username, full_name, role, first_login)
VALUES
  -- Obter UUIDs reais do Supabase Dashboard
  ('uuid-do-rafael', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true),
  ('uuid-do-mauricio', 'Board_MCordeiro', 'Mauricio Cordeiro', 'editor', true),
  ('uuid-do-luiz', 'Board_LMuller', 'Luiz Muller', 'editor', true),
  ('uuid-da-fabiana', 'Board_FCustodio', 'Fabiana Custódio', 'viewer', true),
  ('uuid-do-joao', 'Board_JPaulo', 'João Paulo', 'viewer', true),
  ('uuid-do-marco', 'Board_MNeves', 'Marco Aurélio Neves', 'viewer', true);
```

## 🔐 POLÍTICA DE SENHAS

### Requisitos para Todas as Senhas:

- **Mínimo:** 12 caracteres
- **Letras maiúsculas:** Pelo menos 1
- **Letras minúsculas:** Pelo menos 1
- **Números:** Pelo menos 1
- **Caracteres especiais:** Pelo menos 1 (!@#$%^&\*)

### Sugestões de Senhas Temporárias:

```
Editor 1: Rafael2026!@#Temp
Editor 2: Mauricio2026$%&QA
Editor 3: Luiz2026*()Ops
Viewer 1: Fabiana2026View!
Viewer 2: Joao2026View@
Viewer 3: Marco2026View#
```

## 🚀 CONFIGURAÇÃO AMBIENTE LOCAL

### Variáveis de Ambiente (.env)

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Key (já configurada)
GEMINI_API_KEY=your_gemini_api_key
```

### Verificação de Setup

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env com as variáveis acima

# 3. Iniciar servidor de desenvolvimento
npm run dev

# 4. Build para produção (opcional)
npm run build
```

## 🧪 DIAGNÓSTICO DE PROBLEMAS

### Problema: "Criar cards só some ao clicar"

**Possíveis causas identificadas:**

1. **Estado de autenticação não carregado**
   - Verificar se usuário está autenticado
   - Checar console do navegador por erros

2. **Permissões de role**
   - Apenas **editors** podem criar cards
   - **Viewers** não têm acesso ao botão FAB

3. **Erros de JavaScript**
   - Componente pode estar crashando silenciosamente
   - Verificar Network tab no DevTools

### Debug Steps:

1. **Console do Navegador:**

   ```
   F12 → Console tab
   Procure por erros em vermelho
   ```

2. **Network Tab:**

   ```
   F12 → Network tab
   Filtrar por "XHR" ou "Fetch"
   Verificar chamadas com status 401/403
   ```

3. **Verificar Role do Usuário:**
   - Login como editor
   - Verificar se botão FAB aparece no canto inferior direito
   - Viewers NÃO verão este botão

## 📊 ESTRUTURA DO BANCO DE DADOS

### Tabelas Criadas:

1. **profiles** - Perfis de usuários (autenticação)
2. **cards** - Cards principais do Kanban
3. **comentarios** - Comentários nos cards
4. **anexos** - Arquivos anexados
5. **reunioes** - Reuniões agendadas
6. **historico** - Auditoria de mudanças

### Relacionamentos:

```
auth.users (Supabase) ← profiles (1:1)
profiles → cards (1:N)
cards → comentarios (1:N)
cards → anexos (1:N)
cards → historico (1:N)
auth.users → reunioes (1:N)
```

## 🔒 SEGURANÇA IMPLEMENTADA

### Row Level Security (RLS):

- ✅ Cada usuário só vê seus próprios dados
- ✅ Políticas restritivas por tabela
- ✅ Validação de ownership em todas as operações

### Autenticação:

- ✅ JWT tokens com expiração
- ✅ Refresh automático de sessão
- ✅ Proteção contra CSRF
- ✅ Rate limiting implícito do Supabase

## 🎯 FLUXO DE USO

### Para Editors:

1. Login com credenciais
2. Botão FAB (+) visível no canto inferior direito
3. Clicar para abrir formulário de criação
4. Preencher dados e salvar
5. Card aparece no board

### Para Viewers:

1. Login com credenciais
2. **SEM** botão FAB
3. Apenas visualização de cards existentes
4. Pode comentar nos cards

## 📈 PERFORMANCE OTIMIZADA

### Code Splitting:

- ✅ Componentes modais carregados sob demanda
- ✅ Lazy loading para telas pesadas
- ✅ Bundle otimizado com Vite

### Cache Strategy:

- ✅ Dados persistidos em localStorage
- ✅ Sincronização com Supabase em background
- ✅ Atualização em tempo real via WebSockets

## 🆘 TROUBLESHOOTING

### Erros Comuns:

**"Failed to run sql query: invalid input syntax for type uuid"**

```
Solução: Usar UUIDs válidos ou gen_random_uuid()
```

**"Usuário ou senha inválidos"**

```
Solução: Verificar se usuário existe no Supabase
         Confirmar que senha foi alterada após primeiro login
```

**"Acesso negado para funcionalidades"**

```
Solução: Verificar role do usuário
         Confirmar políticas RLS estão configuradas
```

**Botão "Criar" desaparece**

```
Solução: Confirmar que usuário é "editor"
         Verificar console do navegador por erros
         Testar login/logout
```

## ✅ CHECKLIST DE VALIDAÇÃO

### Setup do Banco:

- [ ] Tabelas criadas com sucesso
- [ ] Índices configurados
- [ ] RLS policies ativas
- [ ] Realtime configurado

### Usuários:

- [ ] 3 usuários editors criados
- [ ] 3 usuários viewers criados
- [ ] Perfis inseridos corretamente
- [ ] Senhas temporárias definidas

### Aplicação:

- [ ] Servidor local rodando
- [ ] Variáveis de ambiente configuradas
- [ ] Build sem erros
- [ ] Preview funcionando

### Funcionalidades:

- [ ] Login funciona para todos usuários
- [ ] First login força mudança de senha
- [ ] Editors podem criar cards
- [ ] Viewers só podem visualizar
- [ ] RBAC funcionando corretamente

---

**Status:** ✅ Pronto para produção  
**Última atualização:** Janeiro 2026  
**Ambiente recomendado:** Netlify + Supabase + HTTPS
