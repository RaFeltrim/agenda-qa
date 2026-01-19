# 🗺️ Agenda Kanban v3.0 - System Element Mapping

## 🏗️ Updated Architecture Overview (Post-Backend Consolidation)

### Backend Layer Structure

```
📁 infrastructure/
├── database/
│   ├── migrations/
│   │   └── backend-consolidation.sql (MAIN SECURITY FILE)
│   ├── functions/
│   │   ├── check_meeting_conflict()
│   │   ├── soft_delete_card()
│   │   ├── enhanced_audit_trigger()
│   │   └── db_health_check()
│   └── views/
│       ├── mv_card_analytics (materialized)
│       └── audit_logs_with_user_info
│
├── edge-functions/
│   ├── send-email-notification/
│   ├── generate-test-data/
│   ├── sync-types-with-database/
│   ├── automated-backup/
│   └── performance-monitoring/
│
└── security/
    ├── Row Level Security (RLS) policies
    ├── Audit logging system
    ├── Soft delete mechanisms
    └── Data integrity constraints
```

## 🏗️ Architecture Overview

### Enhanced Components Structure with Backend Integration

```
App.tsx (Main Orchestrator)
├── State Management (useState, useStorage, useDarkMode)
├── Supabase Integration (Real-time subscriptions)
├── Routing Logic (Protected routes with RBAC)
├── Modal Management (Lazy-loaded modals)
├── Event Handlers (Keyboard shortcuts, drag/drop)
└── Backend Services Integration
    ├── Audit logging service
    ├── Notification system
    ├── Meeting conflict detection
    └── Performance monitoring

Backend Security Layer:
├── Authentication (Supabase Auth + RBAC)
├── Authorization (RLS Policies)
├── Data Protection (Encryption at rest)
├── Audit Trail (Immutable logs)
└── Compliance (GDPR/LGPD ready)

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

| Feature            | Component          | Backend Integration         | Security Controls                 |
| ------------------ | ------------------ | --------------------------- | --------------------------------- |
| Theme Toggle       | Header.tsx         | Local storage only          | User preference persistence       |
| Search Filter      | Header.tsx         | Database query optimization | RLS-protected search results      |
| Statistics Display | Dashboard.tsx      | Materialized views          | Role-based data access            |
| Sprint Management  | Dashboard.tsx      | Transaction-safe operations | Team-based access control         |
| Card Creation      | Multiple locations | Audit-triggered logging     | Editor role required              |
| Card Editing       | CardModal.tsx      | Optimistic locking          | Ownership/RBAC validation         |
| Status Change      | KanbanBoard.tsx    | Database constraints        | Valid state transitions only      |
| Visual Indicators  | Card.tsx           | CSS Classes + Animations    | Real-time status highlighting     |
| Loading States     | KanbanBoard.tsx    | Skeleton components         | Smooth data fetching experience   |
| Unread Comments    | Card.tsx           | Supabase comment_reads table| Yellow pulsing border indicator   |
| Meeting Scheduler  | Dashboard.tsx      | Conflict detection function | Participant availability check    |
| Audit Trail        | Backend service    | Immutable logging           | Full change history tracking      |
| Notifications      | Edge functions     | Scheduled triggers          | Automated alerts and reminders    |

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

| Service              | Purpose                    | Authentication              | Security Level |
| -------------------- | -------------------------- | --------------------------- | -------------- |
| Google Gemini API    | AI processing              | API Key via window.aistudio | 🔐 Encrypted   |
| Supabase Backend     | Database + Auth + Storage  | JWT + RLS                   | 🔒 Enterprise  |
| Edge Functions       | Serverless operations      | Service role key            | 🔐 IAM-based   |
| DiceBear Avatars     | User icons                 | Seed-based generation       | 🟢 Public      |
| Browser APIs         | Audio, File handling       | Native browser support      | 🟢 Client-side |

### 9. **Backend Security Architecture**

```
🛡️ Security Layers:

Layer 1: Network Security
├── HTTPS/TLS encryption
├── IP whitelisting
└── DDoS protection

Layer 2: Authentication
├── Supabase Auth (OAuth 2.0)
├── JWT token validation
└── Session management

Layer 3: Authorization
├── Role-Based Access Control (RBAC)
├── Row Level Security (RLS) policies
└── Function-level permissions

Layer 4: Data Protection
├── Encryption at rest
├── Field-level encryption
└── Audit logging

Layer 5: Compliance
├── GDPR/LGPD compliance
├── Data retention policies
└── Right to deletion
```

### 10. **Database Schema Security Mapping**

| Table        | RLS Policy Owner | Read Access          | Write Access         | Delete Access      |
| ------------ | ---------------- | -------------------- | -------------------- | ------------------ |
| profiles     | User self + Admin| Authenticated users  | Self + Admin         | Admin only         |
| cards        | Creator + Assignee| Team members        | Editors + Assignees  | Creator + Admin    |
| meetings     | Creator + Participants| Participants      | Creator              | Creator + Admin    |
| sprints      | Team members     | Team members         | Team leads + Admin   | Team leads + Admin |
| audit_logs   | System + Admin   | User self + Admin    | System only          | None (immutable)   |

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
