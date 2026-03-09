# 2. Estratégia Shift-Left (Pós-MVP)

A prática do **Shift-Left Testing** significa mover os testes "para a esquerda" no ciclo de desenvolvimento, ou seja, testar o mais cedo e frequente possível. Como SR SDET (Software Development Engineer in Test), a recomendação para o Agenda QA (Pós-MVP) não é escrever E2E após a entrega de uma Feature nova, e sim **prevenir o defeito** desde o terminal do desenvolvedor.

## 🏃 Etapas do "Shift-Left" do Processo do Agenda QA

### Fase 1: Análise Estática Punitiva e Hooks Locais (Imediatamente)
A prioridade máxima é evitar que "código ruim, erros lógicos e testes quebrados" subam para o repositório (`origin/dev.v3`).
- **Implementar Husky e lint-staged**: Qualquer tentativa de `git commit` deve varrer localmente através de lint-staged (Aviso rápido de falhas base).
- **TypeScript Strict Checking**: Erros como *'hasEmpty' is not defined* não podem ser flagrados a olho nu de relance; a checagem sintática rigorosa localmente é mandatória e barata ($0) em esforço de cloud.

### Fase 2: Atribuição de Funções Unitárias à Equipe (TDD Base)
O papel do QA SDET não deve ser centralizar testes de baixo nível, deve ser **governá-los**. 
- Todo novo gancho (`hook`) Supabase ou função lógica em `store` e `utils` **exigirá** um arquivo parceiro (ex: `useMeetingStore.spec.ts`). O desenvolvedor o cria.
- O vitest roda via `--coverage` e deve abortar fusões na Pull Request com taxa abaixo de um limite aceitável (Recomendado 70-80% do MVP maduro).
- Retornos complexos de chamadas isoladas não esperam que o Playwright abra o navegador para falhar. O Vitest falha antes em milissegundos. 

### Fase 3: E2E Reduzido e Especializado (A Pirâmide Mágica de Testes)
A pirâmide ideal preconiza: base pesada (unidade, baratos), meio razoável (integração, API - testes do Postman/K6 ou Supertest), topo esparso e afiado (E2E).
No Agenda QA MVP, o modelo está quase invertido ou em "sorvete de casquinha" (foco extremo no Playwright E2E guiando refatorações).
- **Abordagem BDD (Behavior-Driven Development):** Comportamento alinhado junto ao negócio e PMs (ex: *"Dado que estou usando drag-and-drop"*). Os scripts Playwright continuam, focando 100% no *happy path* real, validando permissões, fluxos críticos na página e visuais vitais de regressão da aplicação.

### Fase 4: Integração Contínua Autônoma (CI/CD)
O principal gargalo é o acionamento humano. O *Github Actions* (Ou Gitlab/Bitbucket) agora deve assumir as rédeas exclusivas:
1. Toda a PR (`Pull Request`) engatilha: Code Build -> ESLint -> TypeScript -> Vitest Unit -> Playwright Smoke (Headless).
2. O botão de **Merge Pull Request** só se torna verde (`enabled`) se as Actions passarem e rodarem num Preview de Build confiável.

### Conclusão e Meta da Qualidade SR
Com a estratégia implantada, transferiremos o esforço humano da "caça aos bugs tardia" da QA para a automação e instrumentação antecipada do desenvolvedor, tornando a taxa de fuga de defeitos (Defect Leakage) muito próxima a 0% para a versão `main` em produção do Sistema Portal de Governança.
