# 🗺️ Agenda Kanban v3.0 - System Element Mapping

## 🏗️ Architecture Overview

### Core Components Structure

```
App.tsx (Main Orchestrator)
├── State Management (useState, useStorage, useDarkMode)
├── Routing Logic (Conditional Rendering)
├── Modal Management (Lazy-loaded modals)
└── Event Handlers (Keyboard shortcuts, drag/drop)

Component Tree:
├── Header.tsx
│   ├── Search functionality
│   ├── Theme toggle (Dark/Light)
│   ├── Export/Import actions
│   └── Profile menu
│
├── Dashboard.tsx
│   ├── Statistics widgets
│   ├── Sprint selector
│   ├── Performance analytics
│   ├── Meeting scheduler
│   └── Filter controls
│
├── KanbanBoard.tsx
│   ├── Drag & Drop functionality
│   ├── Column rendering (4 statuses)
│   └── Card containers
│   └── Card.tsx (individual card component)
│
├── Modals/ (Lazy-loaded)
│   ├── CardModal.tsx (Detailed card view)
│   ├── CreateCardModal.tsx
│   ├── ImportATA.tsx (AI-powered import)
│   ├── SprintListModal.tsx
│   ├── CreateSprintModal.tsx
│   ├── FinishSprintModal.tsx
│   ├── PerformanceModal.tsx
│   ├── AuditLogDrawer.tsx
│   └── ScheduleMeetingModal.tsx
│
├── Services/
│   └── geminiService.ts (AI Integration)
│
├── Hooks/
│   ├── useStorage.ts (LocalStorage persistence)
│   └── useDarkMode.ts (Theme management)
│
└── Utilities/
    └── dateUtils.ts (Date formatting helpers)
```

## 🎯 Functional Elements Map

### 1. **Core Features**

| Feature            | Component          | State Dependencies          | Actions                           |
| ------------------ | ------------------ | --------------------------- | --------------------------------- |
| Theme Toggle       | Header.tsx         | `isDark`                    | Toggle dark/light mode            |
| Search Filter      | Header.tsx         | `searchTerm`                | Filter cards by title/description |
| Statistics Display | Dashboard.tsx      | `cards`, `sprints`          | Show metrics counters             |
| Sprint Management  | Dashboard.tsx      | `sprints`, `activeSprintId` | Select/switch sprints             |
| Card Creation      | Multiple locations | `cards`                     | Add new task cards                |
| Card Editing       | CardModal.tsx      | Individual card state       | Modify card properties            |
| Status Change      | KanbanBoard.tsx    | `card.status`               | Drag-drop between columns         |
| Meeting Scheduler  | Dashboard.tsx      | `meetings`                  | Add/remove scheduled meetings     |

### 2. **AI-Powered Features**

| Feature              | Service Method               | Models Used                  | Purpose               |
| -------------------- | ---------------------------- | ---------------------------- | --------------------- |
| Document Processing  | `extractTasksFromDocument()` | gemini-3-pro-preview         | Parse meeting minutes |
| Text-to-Speech       | `speakText()`                | gemini-2.5-flash-preview-tts | Audio narration       |
| Test Data Generation | `generateTestData()`         | gemini-3-flash-preview       | Create test datasets  |
| Research Reports     | `generateAIReport()`         | gemini-3-pro-image-preview   | Technical research    |

### 3. **Data Structures**

```typescript
Card {
  id: string
  titulo: string
  descricao: string
  responsavel: string
  prazo: string (ISO date)
  status: 'backlog'|'em-progresso'|'bloqueado'|'concluido'
  tags: string[]
  subTasks: SubTask[]
  comentarios: Comentario[]
  anexos: Anexo[]
  historico: HistoricoItem[]
  urgente?: boolean
}

Sprint {
  id: string
  nome: string
  objetivo: string
  dataInicio: string
  dataFim: string
  status: 'planejada'|'ativa'|'concluida'
}

Meeting {
  id: string
  titulo: string
  horario: string
  pauta: string
  participantes: string[]
  local: 'Google Meet'|'Presencial'|'Teams'
}
```

### 4. **State Management Flow**

```
App.tsx (Global State)
├── cards (useStorage) ← localStorage sync
├── sprints (useStorage) ← localStorage sync
├── meetings (useStorage) ← localStorage sync
├── activeSprintId (useStorage) ← localStorage sync
├── isDark (useDarkMode) ← localStorage + system preference
├── UI States (modals, notifications, filters)
│
└── Prop Drilling Pattern:
    Header ← searchTerm, setSearchTerm
    Dashboard ← filter callbacks, sprint actions
    KanbanBoard ← card data, click handlers
    Modals ← specific data slices
```

### 5. **User Interaction Points**

| Element          | Type        | Triggers           | Effects                     |
| ---------------- | ----------- | ------------------ | --------------------------- |
| Search Input     | Text Field  | onChange           | Filters card list           |
| Dark Mode Button | Toggle      | onClick            | Theme change + localStorage |
| Create Card (+)  | Button      | onClick            | Opens modal                 |
| Card Click       | Interactive | onClick            | Opens CardModal             |
| Drag Card        | Drag/Drop   | onDragStart/onDrop | Status change               |
| Filter Buttons   | Radio Group | onClick            | Updates filterType          |
| Sprint Selector  | Dropdown    | onClick            | Changes active sprint       |
| Export Button    | Action      | onClick            | Generates Markdown file     |

### 6. **Keyboard Shortcuts**

| Shortcut | Action          | Component        |
| -------- | --------------- | ---------------- |
| Ctrl+K   | Focus search    | Global           |
| N        | Create new card | Global           |
| Esc      | Close modals    | Modal components |
| Enter    | Submit forms    | Modal forms      |

### 7. **Storage Persistence**

| Key                | Data Type | Storage Location | Sync Frequency |
| ------------------ | --------- | ---------------- | -------------- |
| kanban_cards_v3    | Card[]    | localStorage     | Real-time      |
| kanban_sprints_v3  | Sprint[]  | localStorage     | Real-time      |
| kanban_meetings_v3 | Meeting[] | localStorage     | Real-time      |
| active_sprint_v3   | string    | localStorage     | On change      |
| theme-preference   | boolean   | localStorage     | On toggle      |

### 8. **External Integrations**

| Service           | Purpose              | Authentication              |
| ----------------- | -------------------- | --------------------------- |
| Google Gemini API | AI processing        | API Key via window.aistudio |
| DiceBear Avatars  | User icons           | Seed-based generation       |
| Browser APIs      | Audio, File handling | Native browser support      |

## 🧪 Testing Targets Identification

### High Priority Elements (Critical Path)

1. **State Persistence** - localStorage hooks
2. **Drag & Drop** - KanbanBoard functionality
3. **Modal Management** - Lazy loading and state
4. **Search Filtering** - Real-time filtering logic
5. **AI Service Calls** - API integration reliability

### Medium Priority Elements

1. **UI Interactions** - Click handlers, form submissions
2. **Theme Switching** - CSS class application
3. **Date Handling** - Utility functions
4. **Component Rendering** - Conditional displays

### Low Priority Elements

1. **Animations** - Visual effects
2. **Accessibility** - Screen reader support
3. **Edge Cases** - Invalid inputs, error states

## 📊 Coverage Matrix

| Test Type         | Coverage Target            | Tools Needed                 |
| ----------------- | -------------------------- | ---------------------------- |
| Unit Tests        | 80% of components          | Jest + React Testing Library |
| Integration Tests | All component interactions | Cypress                      |
| E2E Tests         | Main user workflows        | Playwright                   |
| API Tests         | Gemini service calls       | Jest + Mock Service Worker   |
| Accessibility     | WCAG compliance            | axe-core                     |
| Performance       | Load times, responsiveness | Lighthouse                   |
| Security          | Input validation, XSS      | OWASP ZAP                    |

This mapping provides the foundation for comprehensive testing of all system elements.
