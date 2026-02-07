/**
 * Cards Service - API Layer for persistent card manipulation
 * Implements PATCH operations with audit logging
 */

import { supabase, validateSession } from './supabase';

// =============================================================================
// DB Schema Types (matches public.cards table exactly)
// =============================================================================

/** Status values as defined in DB constraint */
export type DBCardStatus = 'backlog' | 'em-progresso' | 'bloqueado' | 'concluido';

/** Priority values as defined in DB */
export type DBCardPriority = 'low' | 'medium' | 'high' | 'critical';

/** Interface matching public.cards table schema exactly */
export interface ICard {
    id: string; // uuid
    titulo: string;
    descricao: string | null;
    status: DBCardStatus;
    responsavel_principal: string; // uuid FK to auth.users
    sub_responsaveis: string[]; // uuid[]
    prazo: string | null; // date
    tags: string[];
    urgente: boolean;
    sprint_id: string | null; // uuid FK to sprints
    reuniao_id: string | null; // uuid FK to meetings
    created_by: string; // uuid FK to auth.users
    created_at: string; // timestamptz
    updated_by: string | null; // uuid FK to auth.users
    updated_at: string; // timestamptz
    deleted_at: string | null; // timestamptz (soft delete)
    responsavel: string | null; // text (legacy)
    priority: DBCardPriority;
    sub_tasks: SubTaskDB[];
    comentarios: CommentDB[];
    anexos: AttachmentDB[];
    historico: HistoryItemDB[];
    version: number;
}

/** SubTask as stored in JSONB */
export interface SubTaskDB {
    id: string;
    text: string;
    completed: boolean;
}

/** Comment as stored in JSONB */
export interface CommentDB {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
}

/** Attachment as stored in JSONB */
export interface AttachmentDB {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
}

/** History item as stored in JSONB */
export interface HistoryItemDB {
    id: string;
    action: string;
    userId: string;
    timestamp: string;
}

/** Audit log entry structure (matches public.audit_logs) */
export interface IAuditLog {
    id?: string;
    user_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: Record<string, unknown>;
    created_at?: string;
}

// =============================================================================
// Status Mapping (Frontend <-> DB)
// =============================================================================

export type FrontendCardStatus = 'todo' | 'in-progress' | 'done' | 'backlog' | 'blocked';

const STATUS_TO_DB: Record<FrontendCardStatus, DBCardStatus> = {
    'todo': 'backlog',
    'backlog': 'backlog',
    'in-progress': 'em-progresso',
    'blocked': 'bloqueado',
    'done': 'concluido'
};

const STATUS_FROM_DB: Record<DBCardStatus, FrontendCardStatus> = {
    'backlog': 'todo',
    'em-progresso': 'in-progress',
    'bloqueado': 'blocked',
    'concluido': 'done'
};

export const mapStatusToDb = (status: FrontendCardStatus): DBCardStatus => STATUS_TO_DB[status];
export const mapStatusFromDb = (status: DBCardStatus): FrontendCardStatus => STATUS_FROM_DB[status];

// =============================================================================
// Error Types
// =============================================================================

export class CardsServiceError extends Error {
    statusCode: number;
    originalError?: unknown;

    constructor(
        message: string,
        statusCode: number,
        originalError?: unknown
    ) {
        super(message);
        this.name = 'CardsServiceError';
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

export class ValidationError extends CardsServiceError {
    constructor(message: string, originalError?: unknown) {
        super(message, 400, originalError);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends CardsServiceError {
    constructor(message: string, originalError?: unknown) {
        super(message, 500, originalError);
        this.name = 'DatabaseError';
    }
}

export class NotFoundError extends CardsServiceError {
    constructor(message: string) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

// =============================================================================
// Validation Functions
// =============================================================================

const VALID_DB_STATUSES: DBCardStatus[] = ['backlog', 'em-progresso', 'bloqueado', 'concluido'];
const VALID_PRIORITIES: DBCardPriority[] = ['low', 'medium', 'high', 'critical'];

function validateUUID(value: string, fieldName: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
        throw new ValidationError(`Invalid UUID format for ${fieldName}: ${value}`);
    }
}

function validateStatus(status: string): DBCardStatus {
    if (!VALID_DB_STATUSES.includes(status as DBCardStatus)) {
        throw new ValidationError(`Invalid status: ${status}. Must be one of: ${VALID_DB_STATUSES.join(', ')}`);
    }
    return status as DBCardStatus;
}

function validatePriority(priority: string): DBCardPriority {
    if (!VALID_PRIORITIES.includes(priority as DBCardPriority)) {
        throw new ValidationError(`Invalid priority: ${priority}. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
    return priority as DBCardPriority;
}

// =============================================================================
// Audit Log Service
// =============================================================================

async function insertAuditLog(auditEntry: IAuditLog): Promise<void> {
    try {
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: auditEntry.user_id,
                action: auditEntry.action,
                entity_type: auditEntry.entity_type,
                entity_id: auditEntry.entity_id,
                details: auditEntry.details,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('[AuditLog] Failed to insert audit log:', error);
            // Don't throw - audit failure shouldn't break main operation
        }
    } catch (err) {
        console.error('[AuditLog] Unexpected error:', err);
    }
}

// =============================================================================
// Cards Service
// =============================================================================

export interface PatchCardPayload {
    status?: FrontendCardStatus;
    priority?: DBCardPriority;
    titulo?: string;
    descricao?: string | null;
    tags?: string[];
    prazo?: string | null;
    urgente?: boolean;
    sprint_id?: string | null;
    /** Version for optimistic concurrency control (race condition prevention) */
    expectedVersion?: number;
}

/** Error thrown when version conflict detected (race condition) */
export class VersionConflictError extends CardsServiceError {
    constructor(cardId: string, expectedVersion: number, actualVersion: number) {
        super(
            `Version conflict for card ${cardId}: expected ${expectedVersion}, found ${actualVersion}. Please refresh and try again.`,
            409
        );
        this.name = 'VersionConflictError';
    }
}

export interface CardServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: number;
    };
}

/** Columns to select from cards table (avoid data leakage) */
const CARD_SELECT_COLUMNS = `
    id,
    titulo,
    descricao,
    status,
    responsavel_principal,
    sub_responsaveis,
    prazo,
    tags,
    urgente,
    sprint_id,
    reuniao_id,
    created_by,
    created_at,
    updated_by,
    updated_at,
    priority,
    sub_tasks,
    comentarios,
    anexos,
    historico,
    version
`.replace(/\s+/g, '');

/**
 * Fetch all cards from database
 */
export async function fetchCardsFromDb(): Promise<CardServiceResponse<ICard[]>> {
    try {
        // Validate session before fetching
        const session = await validateSession();
        if (!session.isValid) {
            return {
                success: false,
                error: { message: session.error || 'Authentication required', code: 401 }
            };
        }

        const { data, error } = await supabase
            .from('cards')
            .select(CARD_SELECT_COLUMNS)
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

        if (error) {
            throw new DatabaseError('Failed to fetch cards', error);
        }

        return {
            success: true,
            data: (data || []) as unknown as ICard[]
        };
    } catch (err) {
        if (err instanceof CardsServiceError) {
            return {
                success: false,
                error: { message: err.message, code: err.statusCode }
            };
        }
        return {
            success: false,
            error: { message: 'Unknown error fetching cards', code: 500 }
        };
    }
}

/**
 * Get a single card by ID
 */
export async function getCardById(cardId: string): Promise<CardServiceResponse<ICard>> {
    try {
        validateUUID(cardId, 'cardId');

        // Validate session
        const session = await validateSession();
        if (!session.isValid) {
            return {
                success: false,
                error: { message: session.error || 'Authentication required', code: 401 }
            };
        }

        const { data, error } = await supabase
            .from('cards')
            .select(CARD_SELECT_COLUMNS)
            .eq('id', cardId)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundError(`Card not found: ${cardId}`);
            }
            throw new DatabaseError('Failed to fetch card', error);
        }

        return {
            success: true,
            data: data as unknown as ICard
        };
    } catch (err) {
        if (err instanceof CardsServiceError) {
            return {
                success: false,
                error: { message: err.message, code: err.statusCode }
            };
        }
        return {
            success: false,
            error: { message: 'Unknown error fetching card', code: 500 }
        };
    }
}

/**
 * PATCH a card - Update status and/or priority with audit logging
 * Implements optimistic concurrency control to prevent race conditions
 */
export async function patchCard(
    cardId: string,
    updates: PatchCardPayload,
    userId: string | null
): Promise<CardServiceResponse<ICard>> {
    try {
        // Validate card ID
        validateUUID(cardId, 'cardId');

        // Validate session
        const session = await validateSession();
        if (!session.isValid) {
            return {
                success: false,
                error: { message: session.error || 'Authentication required', code: 401 }
            };
        }

        // Fetch current card for audit comparison
        const currentResult = await getCardById(cardId);
        if (!currentResult.success || !currentResult.data) {
            throw new NotFoundError(`Card not found: ${cardId}`);
        }
        const currentCard = currentResult.data;

        // Optimistic concurrency control - check version if provided
        if (updates.expectedVersion !== undefined) {
            const actualVersion = currentCard.version ?? 1;
            if (updates.expectedVersion !== actualVersion) {
                throw new VersionConflictError(cardId, updates.expectedVersion, actualVersion);
            }
        }

        // Build update payload with validation - increment version
        const newVersion = (currentCard.version ?? 1) + 1;
        const dbUpdates: Partial<ICard> & { updated_at: string; updated_by: string | null; version: number } = {
            updated_at: new Date().toISOString(),
            updated_by: userId,
            version: newVersion
        };

        // Track changes for audit
        const changes: Record<string, { old: unknown; new: unknown }> = {};

        // Validate and apply status update
        if (updates.status !== undefined) {
            const dbStatus = mapStatusToDb(updates.status);
            validateStatus(dbStatus);
            
            if (currentCard.status !== dbStatus) {
                changes['status'] = { old: currentCard.status, new: dbStatus };
                dbUpdates.status = dbStatus;
            }
        }

        // Validate and apply priority update
        if (updates.priority !== undefined) {
            const validPriority = validatePriority(updates.priority);
            
            if (currentCard.priority !== validPriority) {
                changes['priority'] = { old: currentCard.priority, new: validPriority };
                dbUpdates.priority = validPriority;
            }
        }

        // Apply other field updates
        if (updates.titulo !== undefined) {
            if (!updates.titulo.trim()) {
                throw new ValidationError('Title cannot be empty');
            }
            if (currentCard.titulo !== updates.titulo) {
                changes['titulo'] = { old: currentCard.titulo, new: updates.titulo };
                dbUpdates.titulo = updates.titulo;
            }
        }

        if (updates.descricao !== undefined && currentCard.descricao !== updates.descricao) {
            changes['descricao'] = { old: currentCard.descricao, new: updates.descricao };
            dbUpdates.descricao = updates.descricao;
        }

        if (updates.tags !== undefined) {
            const tagsChanged = JSON.stringify(currentCard.tags) !== JSON.stringify(updates.tags);
            if (tagsChanged) {
                changes['tags'] = { old: currentCard.tags, new: updates.tags };
                dbUpdates.tags = updates.tags;
            }
        }

        if (updates.prazo !== undefined && currentCard.prazo !== updates.prazo) {
            changes['prazo'] = { old: currentCard.prazo, new: updates.prazo };
            dbUpdates.prazo = updates.prazo;
        }

        if (updates.urgente !== undefined && currentCard.urgente !== updates.urgente) {
            changes['urgente'] = { old: currentCard.urgente, new: updates.urgente };
            dbUpdates.urgente = updates.urgente;
        }

        if (updates.sprint_id !== undefined && currentCard.sprint_id !== updates.sprint_id) {
            if (updates.sprint_id !== null) {
                validateUUID(updates.sprint_id, 'sprint_id');
            }
            changes['sprint_id'] = { old: currentCard.sprint_id, new: updates.sprint_id };
            dbUpdates.sprint_id = updates.sprint_id;
        }

        // If no changes, return current card
        if (Object.keys(changes).length === 0) {
            return {
                success: true,
                data: currentCard
            };
        }

        // Execute update with version check for race condition protection
        const currentVersion = currentCard.version ?? 1;
        const { data, error } = await supabase
            .from('cards')
            .update(dbUpdates)
            .eq('id', cardId)
            .eq('version', currentVersion) // Optimistic locking
            .select()
            .single();

        if (error) {
            // If no rows updated, likely a version conflict (race condition)
            if (error.code === 'PGRST116') {
                throw new VersionConflictError(cardId, currentVersion, currentVersion + 1);
            }
            throw new DatabaseError('Failed to update card', error);
        }

        if (!data) {
            throw new VersionConflictError(cardId, currentVersion, currentVersion + 1);
        }

        // Insert audit log for status changes
        if (changes['status']) {
            await insertAuditLog({
                user_id: userId,
                action: 'CARD_STATUS_CHANGE',
                entity_type: 'cards',
                entity_id: cardId,
                details: {
                    old_status: changes['status'].old,
                    new_status: changes['status'].new,
                    card_title: currentCard.titulo,
                    version: newVersion
                }
            });
        }

        // Insert audit log for priority changes
        if (changes['priority']) {
            await insertAuditLog({
                user_id: userId,
                action: 'CARD_PRIORITY_CHANGE',
                entity_type: 'cards',
                entity_id: cardId,
                details: {
                    old_priority: changes['priority'].old,
                    new_priority: changes['priority'].new,
                    card_title: currentCard.titulo,
                    version: newVersion
                }
            });
        }

        // Insert general audit log for other changes
        const otherChanges = { ...changes };
        delete otherChanges['status'];
        delete otherChanges['priority'];
        
        if (Object.keys(otherChanges).length > 0) {
            await insertAuditLog({
                user_id: userId,
                action: 'CARD_UPDATE',
                entity_type: 'cards',
                entity_id: cardId,
                details: {
                    changes: otherChanges,
                    card_title: currentCard.titulo
                }
            });
        }

        return {
            success: true,
            data: data as ICard
        };
    } catch (err) {
        if (err instanceof CardsServiceError) {
            return {
                success: false,
                error: { message: err.message, code: err.statusCode }
            };
        }
        console.error('[CardsService] Unexpected error in patchCard:', err);
        return {
            success: false,
            error: { message: 'Unknown error updating card', code: 500 }
        };
    }
}

/**
 * Move card to new status (convenience wrapper for drag-and-drop)
 */
export async function moveCardStatus(
    cardId: string,
    newStatus: FrontendCardStatus,
    userId: string | null
): Promise<CardServiceResponse<ICard>> {
    return patchCard(cardId, { status: newStatus }, userId);
}

/**
 * Update card priority
 */
export async function updateCardPriority(
    cardId: string,
    newPriority: DBCardPriority,
    userId: string | null
): Promise<CardServiceResponse<ICard>> {
    return patchCard(cardId, { priority: newPriority }, userId);
}

/**
 * Create a new card
 */
export async function createCard(
    cardData: {
        titulo: string;
        descricao?: string;
        status?: FrontendCardStatus;
        priority?: DBCardPriority;
        tags?: string[];
        prazo?: string;
        urgente?: boolean;
        sprint_id?: string;
    },
    userId: string
): Promise<CardServiceResponse<ICard>> {
    try {
        // Validate required fields
        if (!cardData.titulo?.trim()) {
            throw new ValidationError('Title is required');
        }
        validateUUID(userId, 'userId');

        const dbStatus = cardData.status ? mapStatusToDb(cardData.status) : 'backlog';
        const priority = cardData.priority || 'medium';

        validateStatus(dbStatus);
        validatePriority(priority);

        const newCard = {
            titulo: cardData.titulo,
            descricao: cardData.descricao || null,
            status: dbStatus,
            responsavel_principal: userId,
            sub_responsaveis: [],
            prazo: cardData.prazo || null,
            tags: cardData.tags || [],
            urgente: cardData.urgente || false,
            sprint_id: cardData.sprint_id || null,
            reuniao_id: null,
            created_by: userId,
            updated_by: userId,
            priority,
            sub_tasks: [],
            comentarios: [],
            anexos: [],
            historico: [],
            version: 1
        };

        const { data, error } = await supabase
            .from('cards')
            .insert(newCard)
            .select()
            .single();

        if (error) {
            throw new DatabaseError('Failed to create card', error);
        }

        // Audit log for card creation
        await insertAuditLog({
            user_id: userId,
            action: 'CARD_CREATED',
            entity_type: 'cards',
            entity_id: data.id,
            details: {
                card_title: cardData.titulo,
                initial_status: dbStatus,
                initial_priority: priority
            }
        });

        return {
            success: true,
            data: data as ICard
        };
    } catch (err) {
        if (err instanceof CardsServiceError) {
            return {
                success: false,
                error: { message: err.message, code: err.statusCode }
            };
        }
        console.error('[CardsService] Unexpected error in createCard:', err);
        return {
            success: false,
            error: { message: 'Unknown error creating card', code: 500 }
        };
    }
}

/**
 * Soft delete a card
 */
export async function deleteCard(
    cardId: string,
    userId: string | null
): Promise<CardServiceResponse<void>> {
    try {
        validateUUID(cardId, 'cardId');

        // Fetch card for audit
        const currentResult = await getCardById(cardId);
        if (!currentResult.success || !currentResult.data) {
            throw new NotFoundError(`Card not found: ${cardId}`);
        }

        const { error } = await supabase
            .from('cards')
            .update({
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                updated_by: userId
            })
            .eq('id', cardId);

        if (error) {
            throw new DatabaseError('Failed to delete card', error);
        }

        // Audit log for deletion
        await insertAuditLog({
            user_id: userId,
            action: 'CARD_DELETED',
            entity_type: 'cards',
            entity_id: cardId,
            details: {
                card_title: currentResult.data.titulo,
                deleted_status: currentResult.data.status
            }
        });

        return { success: true };
    } catch (err) {
        if (err instanceof CardsServiceError) {
            return {
                success: false,
                error: { message: err.message, code: err.statusCode }
            };
        }
        return {
            success: false,
            error: { message: 'Unknown error deleting card', code: 500 }
        };
    }
}

export const cardsService = {
    fetchCards: fetchCardsFromDb,
    getById: getCardById,
    patch: patchCard,
    moveStatus: moveCardStatus,
    updatePriority: updateCardPriority,
    create: createCard,
    delete: deleteCard
};
