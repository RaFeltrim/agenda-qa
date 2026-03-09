# 3. Arquitetura de Testes e Estratégia de Ferramentas - Plano Futuro

Como SDET, as decisões de ferramentas são essenciais para evitar duplicação ou gargalos. O Agenda QA deve seguir um plano de modernização de sua pilha de QA: 

## 📦 A Stack Consolidada: (Sugestão de Depreciação / Adoção)

### ❌ O que remover (Testamento de Dívida Técnica):
1. **Cypress:** Identificamos que `cypress` constava nos dependentes e possuía `cypress.config.ts`. Retirar e apagar esta ferramenta em favor do Playwright para centralização da automação. Duas super-ferramentas concorrentes atrasam builds e confundem novos engenheiros.

###  ✅ O que fortalecer (O Padrão Ouro para Agenda QA):
1. **Vitest + RTL:** Excelente escolha atual para a suíte de Unidade. Super rápido (graças ao Vite) e nativo de ecossistemas ESM e TypeScript. Deve ser mantido e expandido.
2. **Playwright E2E:** O trunfo de regressão. Com suporte fácil a Webkit, Firefox e Chromium em modo Paralelo. Foi consertado para atuar com base em Locators mais robustos (`data-testid`);

### 🔧 O que adotar (Para a Cobertura Total via Shift-Left):
1. **Ferramenta de API Direta (`supertest` ou K6):** Como o projeto escala e depende vigorosamente do Supabase (REST API), deve-se possuir pequenos robôs que efetuam CRUD validando *StatusCodes* (200, 401, etc) sem carregar o Peso Renderizado da Interface visual Web. 
2. **Husky e lint-staged (Git Hooks):** Responsáveis pela varredura local. Ferramenta mandatória a ser engatilhada nas dependências assim que o próximo "Sprint" de desenvolvimento começar. Irá engatilhar: `npm run lint` e `vitest --run`.
3. **Plano de Observability e Tracing (Sentry ou Datadog):** Observabilidade (Log, Trace) provê o shift-right balanceado post-produção, fundamental para a equipe SDET detectar _crash_ antecipado no uso real de `admin` num console browser, para a criação de um teste imediato.

---
**Conclusão Estratégica:**
Todo teste deve agregar valor contínuo e ser determinístico. Testes que demoram e falham ocasionalmente ("Flaky Tests" baseados em DOM ou rede inconstante) quebram a velocidade da CI e frustram os Desenvolvedores. A responsabilidade é **da fundação de engenharia**, assegurada por Locators firmes de `data-testid` que devem integrar o padrão `eslint` no Repositório.
