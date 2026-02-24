export type CardStatus = 'todo' | 'in-progress' | 'done' | 'backlog' | 'blocked' | 'a-fazer' | 'em-progresso' | 'bloqueado' | 'concluido';
export type Priority = 'low' | 'medium' | 'high' | 'critical' | 'baixa' | 'media' | 'alta';
export type MeetingLocation = 'Google Meet' | 'Teams' | 'Presencial' | 'Zoom' | 'Slack';

export interface SubTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName?: string;
    text: string;
    createdAt: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: 'link' | 'image' | 'file' | 'pdf' | 'evidence';
    url: string;
    uploadedBy: string;
    uploadedAt: string;
}

export interface HistoryItem {
    id: string;
    action: string;
    userId: string;
    userName?: string;
    timestamp: string;
}

export interface Card {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    status: CardStatus;
    assigneeId?: string;
    assigneeName?: string;
    dueDate?: string;
    tags: string[];
    sprintId?: string | null;
    projectId?: string | null;

    // Detailed fields
    subTasks: SubTask[];
    comments: Comment[];
    attachments: Attachment[];
    history: HistoryItem[];

    // Legacy Portuguese fields (for compatibility)
    titulo?: string;
    descricao?: string;
    responsavel?: string;
    subResponsaveis?: string[];
    prazo?: string;
    tagsOld?: string[];
    dataCriacao?: string;
    dataCriacaoPor?: string;
    comentariosOld?: Comment[];
    anexos?: Attachment[];
    historico?: HistoryItem[];
    urgente?: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface Sprint {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: 'planning' | 'active' | 'completed' | 'archived' | 'planejada' | 'ativa' | 'concluida' | 'arquivada';
    projectId?: string | null;

    // Legacy fields
    nome?: string;
    objetivo?: string;
    dataInicio?: string;
    dataFim?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
    updatedAt?: string;

    // Legacy fields
    nome?: string;
    descricao?: string;
    cor?: string;
    squadLead?: string;
}

export interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    duration?: number;
    status: 'scheduled' | 'confirmed' | 'completed' | 'canceled';
    description?: string;
    attendees?: string[];
    location?: string;
    meetingLink?: string;
    projectId?: string;
    priority?: 'low' | 'medium' | 'high' | 'baixa' | 'media' | 'alta';

    // Legacy fields
    titulo?: string;
    horario?: string;
    pauta?: string;
    participantes?: string[];
    local?: MeetingLocation;
}

export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role: 'admin' | 'user' | 'viewer';
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

export interface FilterState {
    search: string;
    priority: Priority | 'all';
    status: CardStatus | 'all';
    assignee: string | 'all';
    sprintId: string | 'all';
    projectId: string | 'all';
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: string;
    details: Record<string, unknown>;
    timestamp: string;
}
