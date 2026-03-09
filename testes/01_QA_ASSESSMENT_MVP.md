# 1. QA Assessment - Fim do MVP (Agenda QA)

**Data de Emissão:** Fevereiro de 2026
**Autor:** QA Senior SDET (Antigravity)
**Status do MVP:** `CONCLUÍDO COM SUCESSO`

## 🗂️ Visão Geral da Qualidade Atual
Chegamos ao final do ciclo do MVP do Agenda QA (v2.0) com uma base substancial de testes estabilizada e configurada. Esta estabilidade é rara para MVPs que costumam sacrificar testes por velocidade. O projeto demonstrou um compromisso precoce com a qualidade.

### 🟢 Pontos Positivos (O que já temos)
1. **Suíte E2E Estável:** O Playwright é a ferramenta principal. Atualmente executamos mais de **34 casos de testes** reais focados no comportamento dos usuários simulados. Os testes abrangem Login, Rotas Privadas e o KanbanBoard (arrastar, soltar, criar e validar status).
2. **Configuração para Testes de Unidade:** O `vitest` e `@testing-library/react` já estão configurados, permitindo que a equipe já crie asserções atômicas focadas em componentes e lógicas exclusivas.
3. **Métricas de Acessibilidade (A11y):** Inclusão de Axe-core através da suíte Playwright. Houve um trabalho de observação em contrastes e estrutura para pessoas de baixa-visão no Login.
4. **Resiliência a Refatorações:** Mesmo com adoções drásticas (Troca profunda de Layout Pro e migração da lib dnd), os locators injetados (`data-testid`) protegeram os fluxos dos testes end-to-end. O projeto não dependeu apenas de classes mutáveis `.css`.

### 🔴 Gaps da Qualidade (Onde vamos aplicar Shift-Left no Pós-MVP)
1. **Falta de Pipiline de CI/CD Rigorosa:** Verificamos a ausência da pasta `.github/workflows`. Atualmente, a execução se baseia que um desenvolvedor/QA ative manuamente os testes locais (`npm run test:pw`). Um código quebrado **ainda pode ser "commitado e mesclado"**.
2. **Métricas Estáticas (Esquecidas):** O `eslint` e o checador de tipos do `tsc` não bloqueiam _commits_ ruins (Husky / Lint-staged estão ausentes).
3. **Duplicidade E2E Innecessária:** Existe a dependência do Playwright e Cypress coexistentes no `package.json`. Embora benéfico para POC (Proof of Concept), do ponto de vista Senior SDET, isto eleva a manutenção e tempo de execução na nuvem. Devemos adotar o Playwright exclusivamente no próximo ciclo.

## 🎯 Conclusão da Avaliação SR
A arquitetura do MVP entrega excelente estabilidade para E2E e boa instrumentação de ferramentas, mas peca na automação e prevenção temprana, características necessárias em ciclos onde testamos "tarde demais" (shift-right). Ao entrar no ciclo de expansão (V2/V3), aplicaremos o conceito rigoroso do **Shift-Left** listado na nossa estratégia.
