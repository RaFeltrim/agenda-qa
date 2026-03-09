# Agenda QA - Sistema de Gestão de Reuniões

> **Template Foursys** — Modelo de referência para projetos internos de QA.

![Status](https://img.shields.io/badge/status-template-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-0%20errors-brightgreen)
![Playwright](https://img.shields.io/badge/playwright-E2E-brightgreen)
![Cypress](https://img.shields.io/badge/cypress-E2E-brightgreen)

Sistema completo de gestão de reuniões com Kanban, autenticação via Supabase, e integração com IA Gemini.

---

## 📋 Estado Atual do Projeto

### Resumo

O projeto passou por uma restauração completa de infraestrutura em fevereiro de 2026. Foram identificados **39 defeitos** durante a fase de QA, dos quais **12 foram corrigidos** nesta iteração (incluindo todos os 8 críticos de infraestrutura). Os testes E2E foram expandidos para cobrir mais cenários.

### ✅ Resultados de Testes

| Suite | Resultado | Detalhes |
|-------|-----------|----------|
| **Playwright** | 30 passed, 2 skipped | Auth, Dashboard, Navigation, Human tests |
| **Cypress** | 21 passed, 0 failed | Auth, Dashboard, Navigation |
| **TypeScript** | 0 erros | `npx tsc --noEmit` limpo |

### ✅ Critérios de Aceite Validados

| Critério | Status | Detalhes |
|----------|--------|----------|
| **Tipagem** | ✅ Passou | Projeto validado no Typescript |
| **Feedback UI** | ✅ Passou | Toast notifications via `App.useApp()` |
| **Segurança (RLS)** | ✅ Implementado | Políticas Row Level Security no Supabase |
| **Temas (UI)** | ✅ Corrigido | Dark Mode e Light Mode 100% integrados sem perdas de contraste e utilizando o padrão Ant Design ConfigProvider |
| **Persistência** | ✅ Passou | Todas as operações salvam no Supabase via API |
| **Dashboard e Kanban** | ✅ Passou | Fluxo de salvar card no BD 100% e sincronia de métricas de tarefas em Backlog/Progress/Done |
| **Sidebar dinâmica** | ✅ Corrigido | Links dinâmicos no Header (`Gestão de Usuários` para admins habilitada) |
| **Admin Route Protection**| ✅ Corrigido | Loop de renderização no ProTable na listagem de usuários (/admin/users) resolvido |

### 🔧 Correções de UI e QA Validation (v2.1)

1. **Dark Mode & Acessibilidade Visual:**
   - Override agressivo removido do `index.css` que aplicava textos invisíveis em inputs de light mode, delegando o controle para o `ConfigProvider` nativo.
   - Contrastes de Cards e Scrollbars universalmente resolvidos.

2. **Loop de Renderização (Admin Users):**
   - Corrigido `Maximum update depth exceeded` no `ProTable` (/admin/users), substituindo `useState` por `useRef` para inicializar a propriedade `actionRef`.
   - Remoção de Race Condition de redirect verificando explicitamente `loading`. Acesso de `Admin` restabelecido.

3. **Validação de Payload de Cards (PGRST204):**
   - Criação de novos tickets no Kanban corrigida com remoção dos campos computados localmente (`attachments`, `subTasks`, etc.) antes do POST pro Supabase.

4. **Time Picker da Reunião:**
   - Modificado para registrar apenas Horas e Minutos (saltos de 5 minutos), desabilitando a contagem randômica de segundos.

5. **Navegação (Router):**
   - Rota `/admin/users` restaurada e configurada globalmente no `App.tsx` para não causar fallback de página 404 (redirecionamento do wildcard).

6. **Acessibilidade e WCAG (Baixa Visão):**
   - Integração do teste automatizado `@axe-core/playwright` (`e2e/playwright/a11y.spec.ts`).
   - Resolução de contraste do card de Login. Cores de acento e textos semânticos ajustados para superar o contraste mínimo de `4.5:1` do WCAG 2 AA.

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js >= 18.x
- NPM >= 9.x
- Conta no Supabase configurada

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here  # opcional, para sugestões IA
```

### Configuração do Banco de Dados

**IMPORTANTE:** Execute a migration SQL no Supabase antes de usar a aplicação:

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Cole o conteúdo de `database/migration_001_create_tables.sql`
3. Execute o script

O script cria automaticamente:
- **5 tabelas**: `profiles`, `sprints`, `meetings`, `cards`, `audit_logs`
- **RLS policies** para segurança por usuário
- **Trigger** `on_auth_user_created` para auto-criação de perfil
- **Índices** para performance
- **Seed data** (primeiro usuário = admin)

### Build & Deploy

```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Preview local da build
npm run preview

# Rodar testes unitários
npm run test
```

### Testes E2E

```bash
# Playwright (30 testes)
npx playwright test

# Cypress (21 testes)
npx cypress run

# Playwright com UI
npx playwright test --ui
```

### Deploy Recomendado (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🏗️ Arquitetura

```
src/
├── app/                  # Rotas/Páginas (React Router)
│   ├── admin/users/      # Gestão de usuários (admin only)
│   ├── dashboard/        # Dashboard principal (Kanban + TaskBoard)
│   ├── login/            # Autenticação (login + signup)
│   ├── profile/          # Perfil do usuário
│   └── settings/         # Configurações da aplicação
├── components/           # Componentes reutilizáveis
│   ├── KanbanBoard.tsx   # Kanban de reuniões (3 colunas)
│   ├── TaskBoard.tsx     # Board de tarefas (5 colunas por sprint)
│   ├── MeetingModal.tsx  # Modal de reuniões
│   └── Modals/           # SprintModal, CardDetailModal
├── hooks/                # Custom hooks
│   └── useAuth.tsx       # Auth context com auto-criação de perfil
├── lib/                  # Utilitários (toast, supabase, validation)
├── services/             # Camada de API (cardsService, gemini)
├── store/                # Zustand stores (card, meeting, sprint)
└── tests/                # Testes unitários

database/
├── migration_001_create_tables.sql  # Migration principal (5 tabelas)
└── SUPABASE_SETUP_COMPLETE.sql      # Backup de setup

e2e/
├── playwright/           # Testes Playwright (30 specs)
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   ├── navigation.spec.ts
│   └── human-test.spec.ts  # Testes interativos human-like
└── cypress/              # Testes Cypress (21 specs)
```

---

## 🔐 Segurança

### RLS (Row Level Security) Ativo

- `profiles`: Usuário só lê/escreve próprio perfil
- `cards`: Filtrado por `user_id = auth.uid()`
- `meetings`: Filtrado por `user_id`
- `audit_logs`: Somente leitura dos próprios registros

### Roles

| Role | Permissões |
|------|-----------|
| `admin` | CRUD completo + gestão de usuários |
| `user` | CRUD próprios items |
| `viewer` | Somente leitura |

---

## 📱 Responsividade

### Breakpoints (Tailwind)

| Prefixo | Screen | Uso |
|---------|--------|-----|
| (base) | < 640px | Mobile |
| `sm:` | ≥ 640px | Mobile landscape |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Desktop |

### Comportamento Kanban

- **Mobile (< 768px):** Tabs para navegar entre colunas
- **Desktop (≥ 768px):** Colunas lado a lado com drag-and-drop

---

## 🧪 Testes

### Suites Disponíveis

| Suite | Testes | Comando |
|-------|--------|---------|
| **Playwright** | 30 passed, 2 skipped | `npx playwright test` |
| **Cypress** | 21 passed | `npx cypress run` |
| **Vitest** | Smoke tests | `npm run test` |

### Playwright (E2E)

```bash
# Rodar todos
npx playwright test

# Com interface gráfica
npx playwright test --ui

# Spec específico
npx playwright test e2e/playwright/human-test.spec.ts

# Último resultado
npx playwright show-report
```

### Cypress (E2E)

```bash
# Headless
npx cypress run

# Com interface gráfica
npx cypress open
```

### Vitest (Unit)

```bash
# Rodar todos os testes
npm run test

# Modo watch
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

---

## 📝 Manutenção Futura

### Para Desenvolvedores

1. **Configuração do banco:**
   - Execute `database/migration_001_create_tables.sql` no Supabase SQL Editor
   - O trigger `on_auth_user_created` cria perfis automaticamente
   - Primeiro usuário a logar = admin

2. **Adicionar nova coluna no Kanban:**
   - Editar array `columns` em `KanbanBoard.tsx`
   - Adicionar status correspondente em `statusColors`

3. **Modificar RLS policies:**
   - Acessar Supabase Dashboard > SQL Editor
   - Referência em `database/migration_001_create_tables.sql`

4. **Adicionar novos testes:**
   - Playwright: `e2e/playwright/`
   - Cypress: `e2e/cypress/e2e/`
   - Unit: `src/tests/`

5. **Build size warning:**
   - Considerar code-splitting com `React.lazy()`
   - Separar Ant Design em chunks manuais

### Bugs Conhecidos (Não Corrigidos)

Consulte [RELATORIO_FALHAS_COMPLETO.md](RELATORIO_FALHAS_COMPLETO.md) para a lista completa.
Principais pendências:
- BUG-009: Bypass Cypress sem proteção `import.meta.env.DEV`
- BUG-012: `CardDetailModal` usa ID de usuário hardcoded
- BUG-013: Update a cada keystroke sem debounce
- BUG-014: Upload de arquivos é mock
- BUG-024: `handleCreateTask()` usa `prompt()`

---

## 📊 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript 5.6 |
| UI | Ant Design 5 + @ant-design/pro-components + Tailwind CSS |
| State | Zustand |
| Backend | Supabase (Postgres + Auth + RLS) |
| Build | Vite 5.4 |
| Test Unit | Vitest |
| Test E2E | Playwright 1.58 + Cypress 15.10 |
| DnD | react-beautiful-dnd |
| IA | Google Gemini API |

---

## 📄 Licença

Projeto interno - Todos os direitos reservados.

---

## Original Vite Template Docs

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
