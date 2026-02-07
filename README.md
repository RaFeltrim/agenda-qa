# Agenda QA - Sistema de Gestão de Reuniões

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-0%20errors-brightgreen)

Sistema completo de gestão de reuniões com Kanban, autenticação via Supabase, e integração com IA Gemini.

---

## 📋 Estado de Conclusão (Definition of Done)

### ✅ Critérios de Aceite Validados

| Critério | Status | Detalhes |
|----------|--------|----------|
| **Tipagem** | ✅ Passou | `npm run build` com 0 erros TypeScript |
| **Feedback UI** | ✅ Passou | Toast notifications em todas as operações CRUD |
| **Segurança (RLS)** | ✅ Implementado | Políticas Row Level Security no Supabase |
| **Mobile Friendly** | ✅ Corrigido | KanbanBoard com Tabs em mobile + botões "Mover" |
| **Persistência** | ✅ Passou | Todas as operações salvam no Supabase |

### 🔧 Correções Críticas Realizadas

1. **KanbanBoard Mobile Responsivo**
   - Implementado sistema de **Tabs** para telas < 768px
   - Scroll horizontal com **CSS snap** para desktop
   - Botão **"Mover para..."** em cada card para touch devices
   - Header adaptativo (flex-col em mobile, flex-row em desktop)

2. **Modais Responsivos**
   - `MeetingModal`: width="95%" com maxWidth de 520px
   - `CardDetailModal`: width="95%" com maxWidth de 800px
   - Inputs com min-height de 44px para touch targets

3. **DnD em Touch Devices**
   - Drag-and-drop desabilitado em mobile (`isDragDisabled={isMobile}`)
   - Substituído por dropdown "Mover" com as colunas de destino

4. **Smoke Tests Implementados**
   - Auth Check, Contact Flow, Kanban Flow, Audit Check
   - 13 testes passando via Vitest

---

## 🚀 Como Rodar em Produção

### Pré-requisitos
- Node.js >= 18.x
- NPM >= 9.x
- Conta no Supabase configurada

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
VITE_GEMINI_API_KEY=AIzaSy... (opcional, para sugestões IA)
```

### Build & Deploy

```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Preview local da build
npm run preview

# Rodar testes
npm run test
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
│   ├── dashboard/        # Dashboard principal
│   ├── login/            # Autenticação
│   ├── profile/          # Perfil do usuário
│   └── settings/         # Configurações admin
├── components/           # Componentes reutilizáveis
│   ├── KanbanBoard.tsx   # Kanban responsivo
│   ├── MeetingModal.tsx  # Modal de reuniões
│   └── Modals/           # Outros modais
├── hooks/                # Custom hooks (useAuth, etc)
├── lib/                  # Utilitários (toast, supabase)
├── services/             # Camada de API
├── store/                # Zustand stores
└── tests/                # Smoke tests
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

1. **Adicionar nova coluna no Kanban:**
   - Editar array `columns` em `KanbanBoard.tsx`
   - Adicionar status correspondente em `statusColors`

2. **Modificar RLS policies:**
   - Acessar Supabase Dashboard > SQL Editor
   - Arquivos de referência em `Arquivos_mortos/database/`

3. **Adicionar novos testes:**
   - Criar em `src/tests/`
   - Seguir padrão do `smoke-tests.test.ts`

4. **Build size warning:**
   - Considerar code-splitting com `React.lazy()`
   - Separar Ant Design em chunks manuais

---

## 📊 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript |
| UI | Ant Design + Tailwind CSS |
| State | Zustand |
| Backend | Supabase (Postgres + Auth) |
| Build | Vite |
| Test | Vitest |
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
