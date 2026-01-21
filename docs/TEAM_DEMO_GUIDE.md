# 🎯 AGENDA KANBAN - TEAM DEMO GUIDE

## 📋 Visão Geral

Este guia contém todas as informações necessárias para sua equipe utilizar o sistema Agenda Kanban com dados de demonstração pré-configurados.

## 👥 USUÁRIOS PARA DEMONSTRAÇÃO

### Credenciais de Primeiro Acesso (Temporárias)

| Nome | E-mail | Senha Temporária | Role |
|------|--------|------------------|------|
| **Rafael Feltrim** (Você) | `rafael.feltrim@agenda-qa.internal` | `DemoPass123` | Editor (Admin) |
| Luiz Muller (Squad Lead) | `board_lmuller@agenda-qa.internal` | `Suasenha2` | Editor |
| Mauricio Cordeiro | `board_mcordeiro@agenda-qa.internal` | `Suasenha3` | Editor |
| Fabiana Custódio | `board_fcustodio@agenda-qa.internal` | `Suasenha4` | Viewer |
| João Paulo | `board_jpaulo@agenda-qa.internal` | `Suasenha5` | Viewer |

## 🎯 FUNCIONALIDADES BÁSICAS

### 1. **LOGIN E AUTENTICAÇÃO**
- Acesse: `http://localhost:3000`
- Utilize as credenciais acima
- Após login, você será redirecionado para o dashboard

### 2. **VISUALIZAÇÃO DO BOARD**
- 4 colunas: Backlog, Em Progresso, Bloqueado, Concluído
- Cards organizados por status
- Filtros disponíveis no cabeçalho

### 3. **CRIAÇÃO DE CARDS**
**Para usuários Editor:**
- Clique no botão **"+"** no cabeçalho das colunas
- Ou use o botão flutuante verde no canto inferior direito
- Preencha: título, descrição, responsável, prazo, tags

### 4. **MOVIMENTAÇÃO DE CARDS**
- Arraste e solte cards entre colunas
- Funciona para todos os usuários

### 5. **DETALHES DOS CARDS**
- Clique em qualquer card para abrir detalhes
- Adicione comentários
- Marque como bloqueado
- Visualize histórico e anexos

### 6. **FILTROS E BUSCA**
- Campo de busca no cabeçalho
- Filtros: Todas, Minhas, Vencidas, Em Progresso
- Filtragem por sprint ativa

## 📊 DADOS DE DEMONSTRAÇÃO INCLUSOS

### 🎫 CARDS DE EXEMPLO

**1. Levantamento de Produtos**
- Responsável: Danyla Andrade
- Status: Backlog
- Tags: CNPJ, Automação
- Deadline: 22/01/2026
- Checklist incluso

**2. Configuração de Ambientes**
- Responsável: Wagner Silva
- Status: Concluído
- Tags: DevOps, Staging
- Deadline: 18/01/2026

**3. Revisão de Código Orquestrador**
- Responsável: Rafael Feltrim
- Status: Bloqueado
- Tags: PR, Code Review
- Urgente: Sim
- Com comentários de bloqueio

**4. Setup CI/CD Pipeline**
- Responsável: Wagner Silva
- Status: Em Progresso
- Tags: DevOps, CI/CD
- Urgente: Sim
- Checklist parcialmente concluído

### 🏃‍♂️ SPRINTS DEMONSTRATIVOS

**Sprint 01 - MVP Setup** (Concluída)
- Período: 01/01/2026 - 14/01/2026
- Objetivo: Configurar base do projeto

**Sprint 02 - Kanban Core** (Ativa)
- Período: 15/01/2026 - 28/01/2026
- Objetivo: Implementar board interativo

**Sprint 03 - Advanced Features** (Planejada)
- Período: 29/01/2026 - 11/02/2026
- Objetivo: Gestão de anexos e comentários

## 🔧 FUNCIONALIDADES AVANÇADAS

### Para Usuários Editor/Admin:

1. **Gerenciamento de Sprints**
   - Criar novas sprints
   - Editar sprints existentes
   - Arquivar sprints concluídas

2. **Exportação de Dados**
   - Exportar relatório em Markdown
   - Download automático do arquivo

3. **Auditoria**
   - Histórico de alterações
   - Log de atividades
   - Rastreamento de responsabilidades

4. **Gestão de Reuniões**
   - Agendamento de reuniões
   - Integração com Google Meet/Teams
   - Priorização de eventos

### Para Todos os Usuários:

1. **Dashboard Analítico**
   - Métricas de produtividade
   - Rankings de performance
   - Gráficos de burndown

2. **Notificações**
   - Alertas de deadlines
   - Notificações de tarefas críticas
   - Updates em tempo real

3. **Modo Escuro/Claro**
   - Alternância automática
   - Preferência salva localmente

## ⌨️ ATALHOS ÚTEIS

- **Ctrl/Cmd + K**: Foco no campo de busca
- **N**: Criar novo card (somente fora de inputs)
- **ESC**: Fechar modais
- **Enter**: Submeter formulários

## 📱 RESPONSIVIDADE

O sistema funciona em:
- Desktop (recomendado)
- Tablets
- Mobile (funcionalidade básica)

## 🛠 SOLUÇÃO DE PROBLEMAS

### Problemas Comuns:

1. **Login não funciona**
   - Verifique se o servidor está rodando (`npm run dev`)
   - Confirme as credenciais
   - Limpe cache do navegador

2. **Dados não aparecem**
   - Recarregue a página (F5)
   - Verifique conexão com localStorage
   - Confirme permissões de usuário

3. **Movimentação de cards falha**
   - Apenas usuários Editor podem mover
   - Verifique status do card
   - Recarregue a página

## 📈 PRÓXIMOS PASSOS

1. **Para sua equipe:**
   - Cada membro faça login com suas credenciais
   - Explore as diferentes permissões
   - Teste criação e movimentação de cards

2. **Para desenvolvimento futuro:**
   - Integração com Supabase (real backend)
   - Sistema de notificações push
   - Relatórios personalizados
   - Integração com ferramentas externas

## 🆘 SUPORTE

Para dúvidas ou problemas:
- Verifique o console do navegador (F12)
- Consulte os logs de erro
- Revise esta documentação

---

**Versão:** 1.0  
**Última atualização:** Janeiro 2026  
**Ambiente:** Desenvolvimento Local