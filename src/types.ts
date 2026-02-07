export type CardStatus = 'todo' | 'in-progress' | 'done' | 'backlog' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface SubTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Comment {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: 'link' | 'image' | 'file';
    url: string;
    uploadedBy: string;
    uploadedAt: string;
}

export interface HistoryItem {
    id: string;
    action: string; // e.g., "moved from todo to in-progress"
    userId: string;
    timestamp: string;
}

export interface Card {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    status: CardStatus;
    assigneeId?: string;
    dueDate?: string;
    tags: string[];
    sprintId?: string | null;
    projectId?: string | null; // Projects support

    // New detailed fields
    subTasks: SubTask[];
    comments: Comment[];
    attachments: Attachment[];
    history: HistoryItem[];

    createdAt: string;
    updatedAt: string;
}

export interface Sprint {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: 'planning' | 'active' | 'completed' | 'archived';
    projectId?: string | null;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    color: string; // Hex color for UI
    createdAt: string;
}

export interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    duration?: number; // in minutes
    status: 'scheduled' | 'confirmed' | 'completed' | 'canceled';
    description?: string;
    attendees?: string[]; // email or userIds
    location?: string; // e.g. "Google Meet"
    meetingLink?: string;
    projectId?: string;
}
