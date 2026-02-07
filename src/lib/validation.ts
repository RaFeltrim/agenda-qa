/**
 * Validation and Sanitization Utilities
 * 
 * Provides robust input validation and sanitization for forms
 * to prevent invalid data from being sent to the PostgreSQL database.
 */

// =============================================================================
// Type Definitions
// =============================================================================

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult<T> {
    isValid: boolean;
    data: T | null;
    errors: ValidationError[];
}

// =============================================================================
// String Sanitization
// =============================================================================

/**
 * Sanitizes a string for database storage
 * - Trims whitespace
 * - Returns null for empty/whitespace-only strings (NOT NULL safe)
 * - Removes potentially harmful characters
 */
export function sanitizeString(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    
    const str = String(value).trim();
    
    // Return null for empty strings (prevents NOT NULL violations)
    if (str.length === 0) {
        return null;
    }
    
    // Remove null bytes and other control characters (except newlines/tabs)
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/**
 * Sanitizes a string and ensures it's not empty (for NOT NULL fields)
 * Throws if the result would be null/empty
 */
export function sanitizeRequiredString(value: unknown, fieldName: string): string {
    const sanitized = sanitizeString(value);
    
    if (sanitized === null || sanitized.length === 0) {
        throw new Error(`${fieldName} is required and cannot be empty`);
    }
    
    return sanitized;
}

/**
 * Sanitizes a string with maximum length enforcement
 */
export function sanitizeStringWithLength(value: unknown, maxLength: number): string | null {
    const sanitized = sanitizeString(value);
    
    if (sanitized === null) {
        return null;
    }
    
    return sanitized.substring(0, maxLength);
}

// =============================================================================
// Date Sanitization
// =============================================================================

/**
 * Converts various date formats to ISO 8601 format (PostgreSQL compatible)
 * Returns null for invalid dates
 */
export function sanitizeDate(value: unknown): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    let date: Date;

    if (value instanceof Date) {
        date = value;
    } else if (typeof value === 'string') {
        // Handle common Brazilian date formats
        const brazilianMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (brazilianMatch) {
            const [, day, month, year] = brazilianMatch;
            date = new Date(`${year}-${month}-${day}`);
        } else {
            date = new Date(value);
        }
    } else if (typeof value === 'number') {
        date = new Date(value);
    } else {
        return null;
    }

    // Validate the date is valid
    if (isNaN(date.getTime())) {
        return null;
    }

    // Return ISO 8601 date string (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
}

/**
 * Converts to ISO 8601 datetime format with timezone (PostgreSQL timestamptz compatible)
 */
export function sanitizeDatetime(value: unknown): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    let date: Date;

    if (value instanceof Date) {
        date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
        date = new Date(value);
    } else {
        return null;
    }

    if (isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

/**
 * Sanitizes time in HH:mm:ss format
 */
export function sanitizeTime(value: unknown): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const str = String(value).trim();
    
    // Already in correct format
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) {
        return str;
    }
    
    // HH:mm format - add seconds
    if (/^\d{2}:\d{2}$/.test(str)) {
        return `${str}:00`;
    }
    
    // Try parsing as Date object (for dayjs/moment objects)
    try {
        const date = new Date(str);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[1].split('.')[0];
        }
    } catch {
        // Continue to return null
    }

    return null;
}

// =============================================================================
// Array Sanitization
// =============================================================================

/**
 * Sanitizes an array of strings (for tags, etc.)
 * - Removes empty strings
 * - Trims whitespace
 * - Removes duplicates
 */
export function sanitizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const sanitized = value
        .map(item => sanitizeString(item))
        .filter((item): item is string => item !== null && item.length > 0);

    // Remove duplicates
    return [...new Set(sanitized)];
}

// =============================================================================
// UUID Validation
// =============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4
 */
export function isValidUUID(value: unknown): value is string {
    if (typeof value !== 'string') {
        return false;
    }
    return UUID_REGEX.test(value);
}

/**
 * Sanitizes and validates a UUID, returning null if invalid
 */
export function sanitizeUUID(value: unknown): string | null {
    if (!isValidUUID(value)) {
        return null;
    }
    return value.toLowerCase();
}

// =============================================================================
// Meeting Validation
// =============================================================================

export interface MeetingInput {
    title?: unknown;
    date?: unknown;
    time?: unknown;
    description?: unknown;
    status?: unknown;
    meetingLink?: unknown;
}

export interface SanitizedMeeting {
    titulo: string;
    data: string;
    horario_inicio: string;
    descricao: string | null;
    status: string;
    link_reuniao: string | null;
}

const VALID_MEETING_STATUSES = ['a-agendar', 'confirmada', 'realizada'];

/**
 * Validates and sanitizes meeting form data
 */
export function validateMeetingInput(input: MeetingInput): ValidationResult<SanitizedMeeting> {
    const errors: ValidationError[] = [];
    
    // Validate title (required)
    const titulo = sanitizeString(input.title);
    if (!titulo) {
        errors.push({ field: 'title', message: 'Título é obrigatório' });
    }

    // Validate date (required)
    const data = sanitizeDate(input.date);
    if (!data) {
        errors.push({ field: 'date', message: 'Data inválida ou ausente' });
    }

    // Validate time (required)
    const horario_inicio = sanitizeTime(input.time);
    if (!horario_inicio) {
        errors.push({ field: 'time', message: 'Horário inválido ou ausente' });
    }

    // Validate status
    const statusStr = sanitizeString(input.status) || 'a-agendar';
    if (!VALID_MEETING_STATUSES.includes(statusStr)) {
        errors.push({ field: 'status', message: `Status inválido: ${statusStr}` });
    }

    // Validate meeting link (optional but must be valid URL if provided)
    const link_reuniao = sanitizeString(input.meetingLink);
    if (link_reuniao && !isValidUrl(link_reuniao)) {
        errors.push({ field: 'meetingLink', message: 'Link da reunião inválido' });
    }

    if (errors.length > 0) {
        return { isValid: false, data: null, errors };
    }

    return {
        isValid: true,
        data: {
            titulo: titulo!,
            data: data!,
            horario_inicio: horario_inicio!,
            descricao: sanitizeString(input.description),
            status: statusStr,
            link_reuniao: link_reuniao
        },
        errors: []
    };
}

// =============================================================================
// Card Validation
// =============================================================================

export interface CardInput {
    title?: unknown;
    description?: unknown;
    status?: unknown;
    priority?: unknown;
    tags?: unknown;
    dueDate?: unknown;
    sprintId?: unknown;
}

export interface SanitizedCard {
    titulo: string;
    descricao: string | null;
    status: string;
    priority: string;
    tags: string[];
    prazo: string | null;
    sprint_id: string | null;
}

const VALID_CARD_STATUSES = ['todo', 'in-progress', 'done', 'backlog', 'blocked'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

/**
 * Validates and sanitizes card form data
 */
export function validateCardInput(input: CardInput): ValidationResult<SanitizedCard> {
    const errors: ValidationError[] = [];
    
    // Validate title (required)
    const titulo = sanitizeString(input.title);
    if (!titulo) {
        errors.push({ field: 'title', message: 'Título é obrigatório' });
    }

    // Validate status
    const statusStr = sanitizeString(input.status) || 'todo';
    if (!VALID_CARD_STATUSES.includes(statusStr)) {
        errors.push({ field: 'status', message: `Status inválido: ${statusStr}` });
    }

    // Validate priority
    const priorityStr = sanitizeString(input.priority) || 'medium';
    if (!VALID_PRIORITIES.includes(priorityStr)) {
        errors.push({ field: 'priority', message: `Prioridade inválida: ${priorityStr}` });
    }

    // Validate sprintId if provided
    const sprintId = sanitizeString(input.sprintId);
    if (sprintId && !isValidUUID(sprintId)) {
        errors.push({ field: 'sprintId', message: 'Sprint ID inválido' });
    }

    if (errors.length > 0) {
        return { isValid: false, data: null, errors };
    }

    return {
        isValid: true,
        data: {
            titulo: titulo!,
            descricao: sanitizeString(input.description),
            status: statusStr,
            priority: priorityStr,
            tags: sanitizeStringArray(input.tags),
            prazo: sanitizeDate(input.dueDate),
            sprint_id: sprintId
        },
        errors: []
    };
}

// =============================================================================
// URL Validation
// =============================================================================

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(urlString: string | null): boolean {
    if (!urlString) return false;
    
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

// =============================================================================
// Export all utilities
// =============================================================================

export const validation = {
    sanitizeString,
    sanitizeRequiredString,
    sanitizeStringWithLength,
    sanitizeDate,
    sanitizeDatetime,
    sanitizeTime,
    sanitizeStringArray,
    sanitizeUUID,
    isValidUUID,
    isValidUrl,
    validateMeetingInput,
    validateCardInput
};

export default validation;
