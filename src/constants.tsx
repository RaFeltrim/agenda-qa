import { Card, Sprint } from './types';

export const MOCK_SPRINTS: Sprint[] = [
  {
    id: 'sprint-1',
    nome: 'Sprint 01 - MVP Setup',
    objetivo: 'Configurar base do projeto e extração inicial via IA.',
    dataInicio: '2026-01-01',
    dataFim: '2026-01-14',
    status: 'concluida',
  },
  {
    id: 'sprint-2',
    nome: 'Sprint 02 - Kanban Core',
    objetivo: 'Implementar board interativo e persistência local.',
    dataInicio: '2026-01-15',
    dataFim: '2026-01-28',
    status: 'ativa',
  },
  {
    id: 'sprint-3',
    nome: 'Sprint 03 - Advanced Features',
    objetivo: 'Gestão de anexos, comentários e exportação Markdown.',
    dataInicio: '2026-01-29',
    dataFim: '2026-02-11',
    status: 'planejada',
  },
];

export const MOCK_CARDS: Card[] = [
  {
    id: '1',
    titulo: 'Levantamento de Produtos',
    descricao:
      'Levantar todos os produtos (novos e legados) do BAU-Orquestrador para o time de QA.',
    responsavel: 'Danyla Andrade',
    prazo: '2026-01-22',
    status: 'backlog',
    tags: ['CNPJ', 'Automação'],
    dataCriacao: '2026-01-15',
    dataCriacaoPor: 'Rafael Feltrim',
    comentarios: [
      {
        id: 'c1',
        autor: 'Wagner',
        texto: 'Iniciando levantamento via planilha legada.',
        timestamp: '2026-01-15T15:00:00Z',
      },
    ],
    anexos: [],
    historico: [{ acao: 'created', por: 'Rafael Feltrim', em: '2026-01-15T14:00:00Z' }],
    sprintId: 'sprint-2',
    subTasks: [
      { id: 'st1', texto: 'Listar produtos legados', concluida: true },
      { id: 'st2', texto: 'Validar com time de Negócios', concluida: false },
    ],
  },
  {
    id: '2',
    titulo: 'Configuração de Ambientes',
    descricao: 'Ajustar variáveis de ambiente para o cluster de staging da Equifax.',
    responsavel: 'Wagner Silva',
    prazo: '2026-01-18',
    status: 'concluido',
    tags: ['DevOps', 'Staging'],
    dataCriacao: '2026-01-14',
    dataCriacaoPor: 'Rafael Feltrim',
    comentarios: [],
    anexos: [],
    historico: [{ acao: 'created', por: 'Rafael Feltrim', em: '2026-01-14T10:00:00Z' }],
    sprintId: 'sprint-1',
    subTasks: [],
  },
  {
    id: '3',
    titulo: 'Revisão de Código Orquestrador',
    descricao: 'Revisar PR #452 relativo à integração com o banco de dados.',
    responsavel: 'Rafael Feltrim',
    prazo: '2026-01-16',
    status: 'bloqueado',
    tags: ['PR', 'Code Review'],
    dataCriacao: '2026-01-13',
    dataCriacaoPor: 'Danyla Andrade',
    comentarios: [
      {
        id: 'c2',
        autor: 'Danyla',
        texto: 'Aguardando correção de lint no commit anterior.',
        timestamp: '2026-01-16T09:00:00Z',
      },
    ],
    anexos: [],
    historico: [{ acao: 'created', por: 'Danyla Andrade', em: '2026-01-13T11:00:00Z' }],
    sprintId: 'sprint-2',
    subTasks: [
      { id: 'st3', texto: 'Validar migrations', concluida: false },
      { id: 'st4', texto: 'Testar rollback', concluida: false },
    ],
  },
  {
    id: '4',
    titulo: 'Setup CI/CD Pipeline',
    descricao: 'Configurar pipeline automatizado para deploy contínuo.',
    responsavel: 'Wagner Silva',
    prazo: '2026-01-17',
    status: 'em-progresso',
    urgente: true,
    tags: ['DevOps', 'CI/CD'],
    dataCriacao: '2026-01-14',
    dataCriacaoPor: 'Rafael Feltrim',
    comentarios: [
      {
        id: 'c3',
        autor: 'Wagner',
        texto: 'Pipeline quase pronto, faltam testes finais.',
        timestamp: '2026-01-17T14:00:00Z',
      },
    ],
    anexos: [],
    historico: [{ acao: 'created', por: 'Rafael Feltrim', em: '2026-01-14T09:00:00Z' }],
    sprintId: 'sprint-2',
    subTasks: [
      { id: 'st5', texto: 'Configurar stages', concluida: true },
      { id: 'st6', texto: 'Integrar com SonarQube', concluida: false },
    ],
  },
];

export const STATUS_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-200' },
  { id: 'em-progresso', title: 'Em Progresso', color: 'bg-blue-100' },
  { id: 'bloqueado', title: 'Bloqueado', color: 'bg-red-100' },
  { id: 'concluido', title: 'Concluído', color: 'bg-green-100' },
] as const;
