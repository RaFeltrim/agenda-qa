# Changelog — Agenda QA

Todas as mudanças notáveis do projeto serão documentadas neste arquivo.

---

## [2.1.0] — 2026-02-27 — Avaliação QA MVP & Estratégia Shift-Left

### Qualidade Analisada (SR SDET)
- **Avaliação do MVP**: Realizada auditoria completa de testes E2E e configurações, documentada na nova pasta `testes/`.
- **Estratégia Shift-Left**: Definido plano para mitigar bugs na origem através de Unit Tests rigorosos, checagem estática Typescript no `pre-commit`, e integração CI/CD autônoma.
- **Arquitetura de Testes**: Sugerida depreciação do `Cypress` para centralizar a regressão nativa de Interface apenas via `Playwright`, além de adoção de `Vitest` com obrigatoriedade progressiva para `Stores` e `Hooks`.
- **Artefatos Criados**: Inclusão de templates de _Pipeline Github Actions_ (`exemplo_ci.yaml`), Assessment do MVP local (`01_QA_ASSESSMENT_MVP.md`) e Estratégia Shift-Left (`02_ESTRATEGIA_SHIFT_LEFT.md`).

---

## [2.0.0] — 2026-02-10 — Restauração de Infraestrutura

### Adicionado
- **Migration SQL** (`database/migration_001_create_tables.sql`):
  - Tabela `profiles` com trigger `on_auth_user_created` (auto-criação de perfil)
  - Tabela `sprints` com status enum e datas
  - Tabela `meetings` com colunas para agenda, link e participantes
  - Tabela `cards` com prioridade, subtarefas, comentários e anexos (JSONB)
  - Tabela `audit_logs` para rastreamento de ações
  - RLS policies para todas as tabelas
  - Índices de performance
  - Seed: primeiro usuário = role `admin`
- **Testes Human-like** (`e2e/playwright/human-test.spec.ts`):
  - 8 testes cobrindo login, dashboard, kanban, taskboard, perfil, settings, admin, sidebar
- **Relatório de falhas** (`RELATORIO_FALHAS_COMPLETO.md`):
  - 39 defeitos identificados, 12 corrigidos nesta iteração

### Corrigido
- **Auth** (`useAuth.tsx`): `fetchUserRole()` → `ensureProfile()` com upsert automático
  - Primeiro usuário a logar recebe role `admin`
  - Demais recebem `viewer`
  - Corrige BUG-004, BUG-006, BUG-007
- **Sidebar** (`layout.tsx`): Expandida de 1 item para 4+ itens dinâmicos
  - Dashboard, Meu Perfil, Configurações, Gestão de Usuários (admin only)
  - Wrapped com `<App>` para contexto Ant Design v5
  - `initializeToast()` invocado no mount (corrige BUG-026)
- **Profile** (`profile/page.tsx`): `App.useApp()`, Skeleton loader, Tag para role
- **Settings** (`settings/page.tsx`): `message` estático → `App.useApp()`
- **Login** (`login/page.tsx`): Wrapped com `<App>` para contexto de mensagens
- **Stores resilientes**:
  - `cardStore.ts`: PGRST205 tratado com `console.warn` em vez de crash
  - `sprintStore.ts`: PGRST205 tratado graciosamente
  - `meetingStore.ts`: PGRST205 tratado graciosamente
- **KanbanBoard** (`KanbanBoard.tsx`): `fetchMeetings()` agora chamado no mount (corrige BUG-016)
- **Status mapping** (`cardsService.ts`): `todo` → `a-fazer` no DB (corrige BUG-008)
  - `STATUS_TO_DB['todo'] = 'a-fazer'`
  - `STATUS_FROM_DB['a-fazer'] = 'todo'`
  - `VALID_DB_STATUSES` atualizado
- **Ant Design v5 deprecations**:
  - `TaskBoard.tsx`: `dropdownRender` → `popupRender`
  - `SprintModal.tsx`: `destroyOnClose` → `destroyOnHidden`

### Validação
- TypeScript: 0 erros (`npx tsc --noEmit`)
- Playwright: 30 passed, 2 skipped, 0 failed
- Cypress: 21 passed, 0 failed

---

## [1.1.0] — 2026-02-09 — QA Completo + Cypress Fix

### Adicionado
- Suite completa de testes Playwright (22 specs)
- Suite completa de testes Cypress (21 specs)
- Bypass Cypress em `useAuth.tsx` para contornar bloqueio do Supabase SDK em headless
- Relatório de falhas com 39 defeitos identificados

### Corrigido
- 16 bugs identificados e corrigidos na fase de QA anterior
- Cypress hanging resolvido via leitura direta do localStorage

---

## [1.0.0] — 2026-02-06 — Release Inicial

### Adicionado
- Dashboard com KanbanBoard (reuniões) e TaskBoard (tarefas)
- Autenticação via Supabase (login, signup, forgot password)
- Perfil de usuário com edição
- Configurações da aplicação (localStorage)
- Página de administração (gestão de usuários)
- Integração com Google Gemini para sugestões de IA
- Drag-and-drop com react-beautiful-dnd
- Responsividade mobile (Tabs + botão "Mover")
- Sistema de toast notifications
- Sanitização e validação de inputs
- RLS (Row Level Security) no Supabase
