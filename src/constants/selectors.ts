export const SELECTORS = {
    LOGIN: {
        EMAIL_INPUT: {
            selector: 'login-email-input',
            type: 'data-testid',
            description: 'Campo de email na tela de login'
        },
        PASSWORD_INPUT: {
            selector: 'login-password-input',
            type: 'data-testid',
            description: 'Campo de senha na tela de login'
        },
        SUBMIT_BUTTON: {
            selector: 'login-submit-button',
            type: 'data-testid',
            description: 'Botão de enviar login'
        }
    },
    APPSHELL: {
        LOGOUT_BUTTON: {
            selector: 'logout-btn',
            type: 'data-testid',
            description: 'Botão de sair no header'
        }
    },
    DASHBOARD: {
        VIEW_TOGGLE: {
            selector: 'view-toggle-switch',
            type: 'data-testid',
            description: 'Switch para alternar entre Reuniões e Tarefas'
        },
        KANBAN: {
            CONTAINER: {
                selector: 'kanban-board',
                type: 'data-testid',
                description: 'Container principal do board'
            },
            NEW_MEETING_BTN: {
                selector: 'new-meeting-btn',
                type: 'data-testid',
                description: 'Botão para criar nova reunião'
            }
        }
    }
} as const;
