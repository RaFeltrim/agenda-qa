# 📊 Sistema de Auditoria Completo

## Visão Geral

Este sistema implementa um registro completo de auditoria para todas as atividades dos usuários na aplicação Agenda-QA, incluindo:

- ✅ **Edições de cards**
- ✅ **Exclusões de cards** 
- ✅ **Arquivamento de cards e sprints**
- ✅ **Adição, edição e exclusão de comentários**
- ✅ **Downloads de relatórios Kanban**
- ✅ **Operações de login/logout**

## 🏗️ Arquitetura

### Componentes Principais

1. **AuditService** (`services/auditService.ts`)
   - Serviço central para registro de atividades
   - Métodos específicos para cada tipo de ação
   - Query de logs de auditoria
   - Estatísticas e análises

2. **AuditLogViewer** (`components/AuditLogViewer.tsx`)
   - Interface para visualização dos logs
   - Filtros por usuário, data, tipo de ação
   - Estatísticas em tempo real
   - Design responsivo

3. **Database Migration** (`supabase/migrations/003_enhanced_audit_logging.sql`)
   - Tabela `audit_logs` aprimorada
   - Triggers automatizados para tabelas principais
   - Índices otimizados para performance
   - Políticas de segurança RLS

## 🚀 Funcionalidades Implementadas

### Tipos de Ações Monitoradas

```typescript
// Card Operations
logCardEdit(cardId, userId, oldValues, newValues)
logCardDelete(cardId, userId, cardData)
logCardArchive(cardId, userId, oldStatus, newStatus)

// Comment Operations  
logCommentAdd(commentId, cardId, userId, commentText)
logCommentEdit(commentId, userId, oldText, newText)
logCommentDelete(commentId, userId, commentData)

// Sprint Operations
logSprintEdit(sprintId, userId, oldValues, newValues)
logSprintArchive(sprintId, userId, oldStatus, newStatus)

// Download Operations
logKanbanDownload(userId, filters, downloadFormat)

// Authentication Operations
logLogin(userId, ipAddress, userAgent)
logLogout(userId)
```

### Informações Capturadas

Cada log de auditoria contém:
- **Timestamp** preciso (com milissegundos)
- **ID do usuário** que realizou a ação
- **Tipo de ação** (CREATE, UPDATE, DELETE, etc.)
- **Nome da tabela** afetada
- **ID do registro** modificado
- **Valores antigos** (JSON)
- **Valores novos** (JSON)
- **Endereço IP** do usuário
- **User Agent** (navegador/dispositivo)
- **Session ID** para rastreamento
- **Informações adicionais** contextuais

## 🛠️ Instalação e Configuração

### 1. Executar Migration do Banco de Dados

```sql
-- Rodar no Supabase SQL Editor
\ir supabase/migrations/003_enhanced_audit_logging.sql
```

### 2. Integrar com Componentes Existentes

#### Exemplo: Registrar edição de card

```typescript
import { AuditService } from '../services/auditService';

// Na função de edição de card
const handleCardEdit = async (cardId, newData) => {
  const oldData = getCurrentCardData();
  
  // Atualizar card normalmente
  await updateCard(cardId, newData);
  
  // Registrar na auditoria
  await AuditService.logCardEdit(
    cardId,
    currentUser.id,
    oldData,
    newData
  );
};
```

#### Exemplo: Registrar download de Kanban

```typescript
const handleKanbanDownload = async (filters, format) => {
  // Gerar e baixar relatório
  await generateKanbanReport(filters, format);
  
  // Registrar na auditoria
  await AuditService.logKanbanDownload(
    currentUser.id,
    filters,
    format
  );
};
```

## 📊 Interface de Visualização

### Características do AuditLogViewer

- **Filtros Avançados**: Por usuário, data, tipo de ação, entidade
- **Estatísticas em Tempo Real**: Totais, distribuição de ações, atividade diária
- **Design Responsivo**: Funciona em desktop e mobile
- **Performance Otimizada**: Paginação e carregamento sob demanda
- **Dark Mode**: Suporte completo ao tema escuro

### Uso do Componente

```typescript
import AuditLogViewer from '../components/AuditLogViewer';

function MyComponent() {
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowAuditLogs(true)}>
        Ver Logs de Auditoria
      </button>
      
      <AuditLogViewer
        isOpen={showAuditLogs}
        onClose={() => setShowAuditLogs(false)}
        userId={currentUser.id} // opcional - filtrar por usuário
        entityType="cards"      // opcional - filtrar por tipo de entidade
      />
    </>
  );
}
```

## 🔒 Segurança e Compliance

### Recursos de Segurança

- **Imutabilidade**: Logs não podem ser modificados após criação
- **RLS Policies**: Controle de acesso baseado em usuário/perfil
- **Dados Sensíveis**: Informações pessoais são tratadas com cuidado
- **Retenção**: Política de retenção configurável

### Compliance LGPD/GDPR

- Registro completo de todas as operações em dados pessoais
- Capacidade de fornecer histórico de atividades do usuário
- Logs mantidos por período mínimo exigido por lei
- Possibilidade de anonimização de dados antigos

## 📈 Monitoramento e Análise

### Estatísticas Disponíveis

```typescript
const stats = await AuditService.getActivitySummary(
  userId,           // opcional
  startDate,        // opcional  
  endDate          // opcional
);

// Retorna:
{
  totalActions: number,
  actionsByType: { [action: string]: number },
  actionsByTable: { [table: string]: number },
  dailyActivity: { [date: string]: number }
}
```

### Query de Logs Personalizada

```typescript
const logs = await AuditService.getAuditLogs({
  user_id: 'user-uuid',
  table_name: 'cards',
  action: 'UPDATE',
  start_date: '2026-01-01',
  end_date: '2026-01-31',
  limit: 50,
  offset: 0
});
```

## 🧪 Testes

### Testes Automatizados

```typescript
// Teste de registro de auditoria
describe('Audit Logging', () => {
  test('should log card edits', async () => {
    const oldData = { title: 'Old Title' };
    const newData = { title: 'New Title' };
    
    await AuditService.logCardEdit(
      'card-id',
      'user-id', 
      oldData,
      newData
    );
    
    const logs = await AuditService.getEntityAuditTrail('cards', 'card-id');
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('UPDATE');
  });
});
```

## 🚀 Próximos Passos

### Melhorias Planejadas

1. **Exportação de Relatórios**
   - CSV, Excel, PDF dos logs de auditoria
   - Templates personalizáveis

2. **Alertas e Notificações**
   - Detecção de atividades suspeitas
   - Notificações em tempo real para admins

3. **Análise Avançada**
   - Dashboards com métricas de uso
   - Identificação de padrões de comportamento

4. **Integração com SIEM**
   - Envio de logs para sistemas externos
   - Formatos compatíveis (Syslog, JSON)

## 📞 Suporte

Para dúvidas ou problemas com o sistema de auditoria:

1. Verifique os logs do console do navegador
2. Confirme que a migration foi executada corretamente
3. Valide as permissões RLS no Supabase
4. Teste com um usuário admin para verificar acesso

---

*Sistema de Auditoria - Agenda-QA v3.0*