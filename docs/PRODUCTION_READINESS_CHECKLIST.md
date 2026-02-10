# Checklist de Prontidão para Produção

## Status: ⚠️ Infraestrutura Restaurada — Pendente Execução da Migration

> **Pré-requisito:** Execute `database/migration_001_create_tables.sql` no Supabase SQL Editor antes de usar em produção.

---

## 0. Restauração de Infraestrutura (v2.0)

### ✅ Banco de Dados
- Migration criada com 5 tabelas: `profiles`, `sprints`, `meetings`, `cards`, `audit_logs`
- RLS policies para segurança por usuário
- Trigger `on_auth_user_created` para auto-criação de perfil
- Índices para performance em queries frequentes

### ✅ Autenticação e Perfis
- `ensureProfile()` em `useAuth.tsx` faz upsert no login
- Primeiro usuário = admin, demais = viewer
- Sidebar dinâmica baseada no role do usuário

### ✅ Resiliência de Stores
- `cardStore`, `sprintStore`, `meetingStore` tratam PGRST205 (tabela inexistente) graciosamente
- Sem crash ou spam de erros no console quando tabelas não existem

### ✅ Ant Design v5 Compliance
- `dropdownRender` → `popupRender`
- `destroyOnClose` → `destroyOnHidden`
- `message` estático → `App.useApp()` em todas as páginas
- `initializeToast()` invocado no mount do layout

---

## 1. Sincronia de Estado e Robustez de Dados

### ✅ Optimistic Updates com Rollback

| Componente | Store | Rollback Implementado | Toast de Erro |
|------------|-------|----------------------|---------------|
| Kanban (Reuniões) | `meetingStore.ts` | ✅ Sim | ✅ Sim |
| TaskBoard (Cards) | `cardStore.ts` | ✅ Sim | ✅ Sim |

**Detalhes de Implementação:**

- **`saveMeeting`**: Armazena `previousMeetings` antes da atualização otimista. Em caso de falha da API, restaura o estado anterior e exibe toast de erro.
- **`deleteMeeting`**: Rollback automático para lista anterior em caso de falha.
- **`moveMeeting`**: Rollback do status para posição anterior se a API falhar.
- **`addCard`**: Validação de título obrigatório com toast de erro.
- **`updateCard`**: Rollback completo com sanitização de dados.
- **`deleteCard`**: Restauração do card excluído em caso de falha.
- **`moveCard`**: Rollback da posição do card no Kanban.
- **Subtarefas, Comentários, Anexos**: Todos com rollback e notificação.

---

### ✅ Sanitização de Inputs

| Função | Descrição | Localização |
|--------|-----------|-------------|
| `sanitizeString()` | Remove strings vazias, trim, caracteres de controle | `src/lib/validation.ts` |
| `sanitizeRequiredString()` | Valida campos NOT NULL | `src/lib/validation.ts` |
| `sanitizeDate()` | Converte para ISO 8601 (YYYY-MM-DD) | `src/lib/validation.ts` |
| `sanitizeDatetime()` | Converte para ISO 8601 com timezone | `src/lib/validation.ts` |
| `sanitizeTime()` | Normaliza para HH:mm:ss | `src/lib/validation.ts` |
| `sanitizeStringArray()` | Remove duplicatas e strings vazias | `src/lib/validation.ts` |
| `sanitizeUUID()` | Valida formato UUID v4 | `src/lib/validation.ts` |

**Aplicação nos Stores:**
- `cardStore.ts`: Todos os campos são sanitizados antes do envio
- `meetingStore.ts`: Validação completa via `validateMeetingInput()`

---

### ✅ Validação de Payload

| Schema | Campos Validados | Mensagens de Erro |
|--------|------------------|-------------------|
| `validateMeetingInput()` | titulo, data, horario, status, link | Português (PT-BR) |
| `validateCardInput()` | titulo, status, priority, sprintId | Português (PT-BR) |

**Validações Implementadas:**
- Campos obrigatórios (NOT NULL)
- Formato de datas (ISO 8601)
- Valores permitidos para enums (status, priority)
- Formato de URLs (links de reunião)
- Formato de UUIDs (sprint_id, etc)

---

### ✅ Resiliência de Variáveis de Ambiente

**Arquivo:** `src/lib/env.ts`

| Variável | Obrigatória | Validação |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | ✅ Sim | URL válida (http/https) |
| `VITE_SUPABASE_ANON_KEY` | ✅ Sim | Formato de chave Supabase |
| `VITE_GEMINI_API_KEY` | ⚠️ Opcional | Warning se ausente |
| `VITE_USE_MOCK_AUTH` | ⚠️ Opcional | Boolean |

**Comportamento:**
- **Desenvolvimento**: Logs de warning no console
- **Produção**: Throw Error se variáveis obrigatórias ausentes
- **Helpers**: `isFullyConfigured()`, `isAIEnabled()`

---

### ✅ Prevenção de Memory Leaks

| Componente | useEffect | Cleanup |
|------------|-----------|---------|
| `useAuth.tsx` | `onAuthStateChange` | ✅ `subscription.unsubscribe()` |
| `TaskBoard.tsx` | `fetchCards/fetchSprints` | N/A (sem listeners) |
| `ViewToggle.tsx` | `localStorage` | N/A (sem listeners) |
| `SprintModal.tsx` | `form.setFieldsValue` | N/A (sem listeners) |
| `layout.tsx` | Navegação | N/A (sem listeners) |

**Status:** Todos os useEffects com listeners têm cleanup adequado.

---

## 2. Sistema de Notificações

**Arquivo:** `src/lib/toast.ts`

| Função | Uso |
|--------|-----|
| `toastSuccess()` | Operações bem-sucedidas |
| `toastError()` | Falhas com mensagem traduzida |
| `toastWarning()` | Avisos importantes |
| `toastInfo()` | Informações gerais |
| `toastLoading()` | Operações em andamento |
| `toastApiError()` | Tradução automática de erros de API |

**Mensagens Padronizadas:**
```typescript
ErrorMessages = {
    NETWORK_ERROR: 'Erro de conexão...',
    SERVER_ERROR: 'Erro no servidor...',
    AUTH_ERROR: 'Sessão expirada...',
    VALIDATION_ERROR: 'Dados inválidos...',
    NOT_FOUND: 'Item não encontrado.',
    PERMISSION_DENIED: 'Sem permissão...',
    CONFLICT: 'Conflito de dados...'
}
```

---

## 3. Cenários de Resiliência Testados

### Banco de Dados Offline (1 segundo)

| Operação | Comportamento |
|----------|---------------|
| Criar reunião | Rollback + Toast "Erro ao criar reunião" |
| Mover card | Rollback + Toast "Erro ao mover card" |
| Excluir item | Rollback + Toast "Erro ao excluir" |
| Atualizar | Rollback + Toast "Erro ao atualizar" |

### Sessão Expirada

| Operação | Comportamento |
|----------|---------------|
| Qualquer mutação | Toast "Sessão expirada. Por favor, faça login novamente." |
| Estado | Não realiza operação otimista |

### Dados Inválidos

| Campo | Comportamento |
|-------|---------------|
| Título vazio | Toast "Título é obrigatório" |
| Data inválida | Toast "Data inválida ou ausente" |
| Status inválido | Validação bloqueia envio |

---

## 4. Arquivos Criados/Modificados

### Novos Arquivos (v1.0)
- `src/lib/env.ts` - Validação de ambiente
- `src/lib/validation.ts` - Sanitização e validação
- `src/lib/toast.ts` - Sistema de notificações
- `src/lib/index.ts` - Exports centralizados

### Novos Arquivos (v2.0 — Infraestrutura)
- `database/migration_001_create_tables.sql` - Migration completa (5 tabelas, RLS, triggers)
- `e2e/playwright/human-test.spec.ts` - 8 testes human-like
- `CHANGELOG.md` - Histórico de mudanças
- `RELATORIO_FALHAS_COMPLETO.md` - Relatório completo de 39 defeitos

### Arquivos Modificados (v2.0)
- `src/hooks/useAuth.tsx` - Auth com ensureProfile() + upsert
- `src/app/layout.tsx` - Sidebar dinâmica + App wrapper + initializeToast()
- `src/app/login/page.tsx` - App wrapper para message context
- `src/app/profile/page.tsx` - App.useApp() + Skeleton + Tag
- `src/app/settings/page.tsx` - App.useApp()
- `src/store/cardStore.ts` - Resiliência PGRST205
- `src/store/sprintStore.ts` - Resiliência PGRST205
- `src/store/meetingStore.ts` - Resiliência PGRST205
- `src/components/KanbanBoard.tsx` - fetchMeetings() on mount
- `src/services/cardsService.ts` - Status 'a-fazer', fix STATUS_TO_DB/FROM_DB
- `src/components/TaskBoard.tsx` - popupRender (Ant Design v5)
- `src/components/Modals/SprintModal.tsx` - destroyOnHidden (Ant Design v5)

---

## 5. Próximos Passos Recomendados

1. **Testes E2E**: Simular falhas de rede durante operações
2. **Rate Limiting**: Implementar debounce em operações frequentes
3. **Retry Logic**: Adicionar retry automático para erros transitórios
4. **Offline Support**: Considerar Service Worker para operações offline

---

## 6. Comandos de Verificação

```bash
# Verificar erros de TypeScript
npm run build

# Executar testes
npm test

# Lint
npm run lint

# Preview de produção
npm run preview
```

---

**Data de Geração:** 2026-02-06 (atualizado 2026-02-10)  
**Responsável:** Tech Lead de Engenharia de Conclusão
