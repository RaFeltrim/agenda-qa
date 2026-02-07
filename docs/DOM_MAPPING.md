# 🗺️ Mapeamento de Elementos DOM (Page Objects)

Este documento lista os seletores mapeados para automação de testes E2E/User.
Todos os seletores utilizam o atributo `data-testid` para maior robustez.

As constantes de seletores estão disponíveis no código em: `src/constants/selectors.ts`.

## 1. Login Page (`/login`)

| Elemento | Seletor (`data-testid`) | Descrição |
| :--- | :--- | :--- |
| **Email Input** | `login-email-input` | Campo de texto para email |
| **Password Input** | `login-password-input` | Campo de senha |
| **Submit Button** | `login-submit-button` | Botão "Entrar" |

## 2. Dashboard (`/dashboard`)

| Elemento | Seletor (`data-testid`) | Descrição |
| :--- | :--- | :--- |
| **View Toggle** | `view-toggle-switch` | Switch "Reuniões / Tarefas" |
| **Kanban Board** | `kanban-board` | Container principal do quadro |
| **New Meeting Btn** | `new-meeting-btn` | Botão "+ Nova Reunião" |

## 3. App Shell (Layout)

| Elemento | Seletor (`data-testid`) | Descrição |
| :--- | :--- | :--- |
| **Logout Button** | `logout-btn` | Link de logout no cabeçalho |

---

### Exemplo de Uso (Playwright/Jest)

```typescript
import { SELECTORS } from '@/constants/selectors';

// Login
await page.getByTestId(SELECTORS.LOGIN.EMAIL_INPUT.selector).fill('user@example.com');
await page.getByTestId(SELECTORS.LOGIN.submit_BUTTON.selector).click();
```
