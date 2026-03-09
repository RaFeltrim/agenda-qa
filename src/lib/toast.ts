/**
 * Toast Notification Service
 * 
 * Provides a consistent notification interface with support for
 * optimistic update rollback scenarios.
 * 
 * Uses Ant Design's message API internally.
 */

import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

// =============================================================================
// Type Definitions
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
    /** Duration in seconds (0 = persistent until manually closed) */
    duration?: number;
    /** Unique key for the toast (allows updating) */
    key?: string;
    /** Callback when toast is closed */
    onClose?: () => void;
}

export interface OptimisticUpdateContext<T> {
    /** Function to execute the optimistic update (returns previous state) */
    optimisticUpdate: () => T;
    /** Function to revert to previous state if API fails */
    rollback: (previousState: T) => void;
    /** The async API call to execute */
    apiCall: () => Promise<void>;
    /** Success message to show */
    successMessage?: string;
    /** Error message prefix */
    errorMessagePrefix?: string;
}

// =============================================================================
// Toast Service
// =============================================================================

/**
 * Message instance for global access (initialized by Ant Design)
 * In case of SSR or testing, we provide fallbacks
 */
let messageApi: MessageInstance | null = null;

/**
 * Initialize the message API (should be called from App component)
 */
export function initializeToast(api: MessageInstance): void {
    messageApi = api;
}

/**
 * Get the message API, falling back to static message if needed
 */
function getMessageApi() {
    return messageApi || message;
}

// =============================================================================
// Basic Toast Functions
// =============================================================================

/**
 * Shows a success toast
 */
export function toastSuccess(content: string, options?: ToastOptions): void {
    getMessageApi().success({
        content,
        duration: options?.duration ?? 3,
        key: options?.key,
        onClose: options?.onClose
    });
}

/**
 * Shows an error toast
 */
export function toastError(content: string, options?: ToastOptions): void {
    getMessageApi().error({
        content,
        duration: options?.duration ?? 5,
        key: options?.key,
        onClose: options?.onClose
    });
}

/**
 * Shows a warning toast
 */
export function toastWarning(content: string, options?: ToastOptions): void {
    getMessageApi().warning({
        content,
        duration: options?.duration ?? 4,
        key: options?.key,
        onClose: options?.onClose
    });
}

/**
 * Shows an info toast
 */
export function toastInfo(content: string, options?: ToastOptions): void {
    getMessageApi().info({
        content,
        duration: options?.duration ?? 3,
        key: options?.key,
        onClose: options?.onClose
    });
}

/**
 * Shows a loading toast (returns a function to close it)
 */
export function toastLoading(content: string, key?: string): () => void {
    const toastKey = key || `loading-${Date.now()}`;
    getMessageApi().loading({
        content,
        duration: 0,
        key: toastKey
    });
    
    return () => getMessageApi().destroy(toastKey);
}

// =============================================================================
// Optimistic Update with Rollback
// =============================================================================

/**
 * Executes an optimistic update with automatic rollback on failure
 * 
 * @example
 * ```ts
 * await withOptimisticUpdate({
 *   optimisticUpdate: () => {
 *     const prev = [...state.cards];
 *     setState({ cards: [...prev, newCard] });
 *     return prev;
 *   },
 *   rollback: (prev) => setState({ cards: prev }),
 *   apiCall: async () => {
 *     await supabase.from('cards').insert(newCard);
 *   },
 *   successMessage: 'Card criado com sucesso!',
 *   errorMessagePrefix: 'Erro ao criar card'
 * });
 * ```
 */
export async function withOptimisticUpdate<T>(
    context: OptimisticUpdateContext<T>
): Promise<boolean> {
    const {
        optimisticUpdate,
        rollback,
        apiCall,
        successMessage,
        errorMessagePrefix = 'Operação falhou'
    } = context;

    // Execute optimistic update and store previous state
    const previousState = optimisticUpdate();

    try {
        // Execute the API call
        await apiCall();

        // Show success message if provided
        if (successMessage) {
            toastSuccess(successMessage);
        }

        return true;
    } catch (error) {
        // Rollback to previous state
        rollback(previousState);

        // Show error message
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        toastError(`${errorMessagePrefix}: ${errorMsg}`);

        // Log for debugging
        console.error('[OptimisticUpdate] Rollback triggered:', error);

        return false;
    }
}

/**
 * Simplified version for store mutations that handles common patterns
 */
export function createOptimisticMutation<TState, TPayload>(config: {
    /** Name of the operation for error messages */
    operationName: string;
    /** Get current state */
    getState: () => TState;
    /** Set new state (optimistic) */
    setState: (state: Partial<TState>) => void;
    /** Create optimistic state from payload */
    createOptimisticState: (current: TState, payload: TPayload) => Partial<TState>;
    /** API call to persist the change */
    apiCall: (payload: TPayload) => Promise<void>;
    /** Optional: refetch data on error instead of using stored previous state */
    refetchOnError?: () => Promise<void>;
}) {
    return async (payload: TPayload): Promise<boolean> => {
        const previousState = config.getState();

        // Apply optimistic update
        const optimisticState = config.createOptimisticState(previousState, payload);
        config.setState(optimisticState);

        try {
            await config.apiCall(payload);
            return true;
        } catch (error) {
            // Rollback
            if (config.refetchOnError) {
                await config.refetchOnError();
            } else {
                config.setState(previousState as Partial<TState>);
            }

            const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
            toastError(`${config.operationName} falhou: ${errorMsg}`);
            console.error(`[${config.operationName}]`, error);

            return false;
        }
    };
}

// =============================================================================
// API Error Handling
// =============================================================================

/**
 * Standard error messages for common scenarios
 */
export const ErrorMessages = {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
    SERVER_ERROR: 'Erro no servidor. Tente novamente em alguns instantes.',
    AUTH_ERROR: 'Sessão expirada. Por favor, faça login novamente.',
    VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
    NOT_FOUND: 'Item não encontrado.',
    PERMISSION_DENIED: 'Você não tem permissão para realizar esta ação.',
    CONFLICT: 'Conflito de dados. Atualize a página e tente novamente.',
    UNKNOWN: 'Ocorreu um erro inesperado.'
};

/**
 * Converts API errors to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        if (msg.includes('network') || msg.includes('fetch')) {
            return ErrorMessages.NETWORK_ERROR;
        }
        if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('authentication')) {
            return ErrorMessages.AUTH_ERROR;
        }
        if (msg.includes('403') || msg.includes('forbidden') || msg.includes('permission')) {
            return ErrorMessages.PERMISSION_DENIED;
        }
        if (msg.includes('404') || msg.includes('not found')) {
            return ErrorMessages.NOT_FOUND;
        }
        if (msg.includes('409') || msg.includes('conflict') || msg.includes('version')) {
            return ErrorMessages.CONFLICT;
        }
        if (msg.includes('400') || msg.includes('validation') || msg.includes('invalid')) {
            return ErrorMessages.VALIDATION_ERROR;
        }
        if (msg.includes('500') || msg.includes('server')) {
            return ErrorMessages.SERVER_ERROR;
        }

        return error.message;
    }

    return ErrorMessages.UNKNOWN;
}

/**
 * Shows an appropriate toast for an API error
 */
export function toastApiError(error: unknown, prefix?: string): void {
    const message = getErrorMessage(error);
    toastError(prefix ? `${prefix}: ${message}` : message);
}

// =============================================================================
// Export
// =============================================================================

export const toast = {
    success: toastSuccess,
    error: toastError,
    warning: toastWarning,
    info: toastInfo,
    loading: toastLoading,
    apiError: toastApiError,
    withOptimisticUpdate,
    getErrorMessage,
    ErrorMessages,
    initialize: initializeToast
};

export default toast;
