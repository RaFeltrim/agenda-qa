export type CardStatus = 'backlog' | 'em-progresso' | 'bloqueado' | 'concluido';

export interface SubTask {
  id: string;
  texto: string;
  concluida: boolean;
}

export interface Comentario {
  id: string;
  autor: string;
  texto: string;
  timestamp: string;
}

export interface Anexo {
  id: string;
  nome: string;
  tipo: 'link' | 'imagem' | 'pdf' | 'evidencia';
  url: string;
  uploadadoPor: string;
  dataUpload: string;
}

export interface HistoricoItem {
  acao: string;
  por: string;
  em: string;
}

export interface Card {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  subResponsaveis?: string[];
  prazo: string;
  status: CardStatus;
  tags: string[];
  dataCriacao: string;
  dataCriacaoPor: string;
  comentarios: Comentario[];
  anexos: Anexo[];
  historico: HistoricoItem[];
  sprintId?: string;
  subTasks: SubTask[];
  urgente?: boolean;
}

export interface Meeting {
  id: string;
  titulo: string;
  horario: string;
  pauta: string;
  participantes: string[];
  local: 'Google Meet' | 'Presencial' | 'Teams';
  prioridade: 'baixa' | 'media' | 'alta';
  linkReuniao?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  squadLead?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Sprint {
  id: string;
  nome: string;
  objetivo: string;
  dataInicio: string;
  dataFim: string;
  status: 'planejada' | 'ativa' | 'concluida' | 'arquivada';
  projectId?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface FilterState {
  type: 'todas' | 'minhas' | 'vencidas' | 'em-progresso';
  search: string;
}

export interface ExtractedTasks {
  dataMeeting: string;
  participantes: string[];
  tasks: Array<{
    titulo: string;
    descricao: string;
    responsavel: string;
    subResponsaveis: string[];
    prazo: string | null;
    tags: string[];
    urgente?: boolean;
  }>;
}
