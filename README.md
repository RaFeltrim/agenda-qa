# 🚀 Agenda Kanban v3.0 - AI Workspace

[![Netlify Status](https://api.netlify.com/api/v1/badges/2b859ec8-eca0-4306-a9a9-d42bca4a9f97/deploy-status)](https://app.netlify.com/projects/agenda-qa/deploys)
![Version](https://img.shields.io/badge/version-3.0.0-indigo)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Tailwind%20%7C%20Gemini%202.0-blueviolet)
![Status](https://img.shields.io/badge/status-Production%20Ready-emerald)

Um sistema de gerenciamento de tarefas de alto desempenho projetado para times de **QA e Desenvolvimento**, com integração profunda de **Inteligência Artificial (Google Gemini 2.0)** para orquestração de tarefas, planejamento de sprints e automação de rotinas.

---

## ✨ Funcionalidades Principais

### 🧠 Inteligência Artificial (Gemini Pro & Flash)

- **Importação Inteligente de ATA**: Arraste um PDF ou texto de uma reunião e a IA extrai automaticamente as tarefas, responsáveis, prazos e tags, criando cards no Kanban.
- **Text-to-Speech (TTS)**: O sistema "lê" o conteúdo dos cards para você (Contexto, Descrição e Status) usando vozes neurais realistas.
- **Geração de Massa de Dados**: Criação automática de JSON/SQL/CSV para testes de QA baseados na descrição da tarefa.
- **Pesquisa Web (Grounding)**: O card pode gerar um relatório técnico consultando o Google Search em tempo real para buscar referências sobre a tarefa.

### 📊 Gestão de Ciclos (Sprints)

- **Sprint Planning**: Criação e definição de metas de ciclos de 14 dias.
- **Analytics em Tempo Real**: Burndown Chart automático e Health Score da Sprint baseado na velocidade de entrega.
- **Encerramento de Ciclo**: Assistente para mover tarefas concluídas e realizar _carryover_ (transferência) de tarefas pendentes para a próxima sprint ou backlog.

### ⚡ Produtividade & UX

- **Drag & Drop Fluido**: Movimentação suave de cards entre colunas (Backlog, Em Progresso, Bloqueado, Concluído).
- **Agenda Integrada**: Widget para gestão rápida de reuniões (Daily, Planning, Review).
- **Relatórios em Markdown**: Exportação completa do board para documentação em `.md`.
- **Modo Escuro (Dark Mode)**: Interface totalmente adaptada para ambientes com pouca luz.
- **Audit Log**: Rastreabilidade total de quem criou, editou ou moveu cada card.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, TypeScript
- **Estilização**: Tailwind CSS (com Glassmorphism e Animações nativas)
- **IA Engine**: Google GenAI SDK (`@google/genai`) - Modelos `gemini-3-pro`, `gemini-2.5-flash`.
- **Ícones**: Lucide React
- **Persistência**: LocalStorage (Custom Hooks)

---

## 🚀 Como Usar

### 1. Configuração da API Key

Para utilizar os recursos de IA (Importação, TTS, Pesquisa), é necessário uma chave de API do Google Gemini válida.

1. Ao iniciar o app, clique em **"Selecionar Chave de API"**.
2. O sistema utilizará a integração segura do Google AI Studio.
3. **Nota**: Para usar modelos Pro e Pesquisa Web, o projeto no Google Cloud deve ter uma conta de faturamento vinculada (embora haja um tier gratuito generoso).

### 2. Fluxo de Trabalho

1.  **Crie uma Sprint**: Abra o menu "Ciclo Atual" e crie uma nova Sprint.
2.  **Adicione Tarefas**:
    - _Manual_: Pressione `N` ou clique no botão `+`.
    - _Via IA_: Clique no botão de importação no cabeçalho e suba um arquivo de texto/PDF.
3.  **Gerencie**: Arraste os cards conforme o progresso.
4.  **Detalhamento**: Clique em um card para ver detalhes, adicionar subtarefas, ouvir o conteúdo ou pedir ajuda à IA.

### 3. Atalhos de Teclado

- `Ctrl + K` / `Cmd + K`: Focar na barra de busca.
- `N`: Criar novo card rapidamente.

---

## 📂 Estrutura do Projeto

```bash
/
├── components/          # Componentes React Modulares
│   ├── Kanban/          # Board, Colunas e Cards
│   ├── Modals/          # Todos os modais (Sprint, Card, IA, etc.)
│   ├── Header.tsx       # Navegação e Ações Globais
│   └── Dashboard.tsx    # Widgets e Métricas
├── services/
│   └── geminiService.ts # Integração com Google Gemini API
├── hooks/               # Custom Hooks (Storage, DarkMode)
├── types.ts             # Definições de Tipos TypeScript
└── App.tsx              # Ponto de entrada e Orquestração de Estado
```

---

## 🔌 Offline Capabilities (No API Required)

These features depend only on browser localStorage and React logic. They work perfectly without internet or API key:

### Core Functionality

- **Kanban Management**: Create, edit, delete, and move cards between columns (Drag & Drop)
- **Sprint Management**: Create cycles, start/end sprints, and track progress
- **Dashboard & Metrics**: All charts (Burndown, counters, Health Score) calculated mathematically with local data
- **Meeting Scheduler**: Create and remove meetings in calendar widget
- **Audit Log**: Change history saved locally
- **Dark/Light Mode**: Preference saved in browser
- **Markdown Export**: .md file generation done purely with frontend JavaScript
- **Search & Filters**: Card filtering by text, assignee, or status

## 🧠 AI-Powered Features (Google Gemini Required)

These features call `services/geminiService.ts` and will fail without a configured key in `.env` (local) or selected via Google IDX:

- **Document Import**: "Import Document" button sends text/PDF to Gemini to extract tasks
- **Text-to-Speech**: Speaker button 🔈 in card modal uses AI to generate audio
- **AI Help → Generate Test Data**: "Generate Test Data" button asks Gemini to create JSON/SQL
- **AI Help → Strategic Report**: Web search button uses Google Search (via Gemini Pro) to find links and references

---

## 🎨 Design System

O projeto utiliza uma paleta de cores moderna focada em **Indigo/Violet** para a identidade principal, com cores semânticas para status:

- 🟢 **Emerald**: Conclusão, Sucesso.
- 🔵 **Blue**: Em Progresso, Ativo.
- 🔴 **Rose**: Bloqueio, Erro, Urgente.
- 🟠 **Amber**: Atenção, Pendente.

---

## 🤝 Contribuição

1.  Os dados são salvos localmente no navegador (`localStorage`). Limpar o cache do navegador apagará os dados.
2.  Para exportar seus dados, utilize o botão de Download no cabeçalho (Gera um Markdown).

---

Developed for **High Performance Teams**.
