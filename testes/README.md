# 🧪 Quality Assurance & SDET Hub - Agenda QA

Bem-vindo ao diretório central de Qualidade (`/testes`) do Agenda QA. Este repositório concentra nossa avaliação de pós-MVP, estratégia de automação futura e cultura "Shift-Left" aplicada ao software.

## 🗂️ Estrutura da Avaliação

| Arquivo Analítico | Descrição da Documentação QA SR SDET |
| :--- | :--- |
| [`01_QA_ASSESSMENT_MVP.md`](./01_QA_ASSESSMENT_MVP.md) | Uma profunda avaliação da qualidade entregada no MVP. Acertos vitais de arquitetura Playwright e lacunas nas métricas locais. |
| [`02_ESTRATEGIA_SHIFT_LEFT.md`](./02_ESTRATEGIA_SHIFT_LEFT.md) | O pilar "Shift-Left": Movimentando os testes para perto do código (Unit, Hooks, CI/CD e pre-commits). O dev se torna responsável pelo Behavior. |
| [`03_TEST_ARCHITECTURE_AND_TOOLING.md`](./03_TEST_ARCHITECTURE_AND_TOOLING.md) | Consolidando bibliotecas: depreciação de redundâncias (ex: Cypress) e adoção de estrito rigor tipológico (Pipelines + Vitest). |
| [`exemplo_ci.yaml`](./exemplo_ci.yaml) | (_Modelo_) Um contrato fundamental do Github Actions para blindar a base _main_ e assegurar fusões limpas na integração Pós-MVP. |

## 🚀 Próximos Passos (Ação do Dev-Team)
Para concretizar o **Shift-Left**, siga os seguintes preceitos recomendados pelo SDET na V2:
1. **Adote o ESLint E TypeScript Strict** ativamente no VSCode (Obrigatoriedade no Pre-Commit).
2. **Ao Criar Novas Features:** Antes de solicitar um E2E, garanta `>= 70%` de cobertura e `spec.ts` focado na lógica atômica.
3. Seus componentes visuais sempre precisarão de `data-testid="meu-componente-xxx"`. Eles agilizam os robôs de renderização visual.
4. **Acione a Integração CI/CD:** Utilize o Action recomendado `.github/workflows` garantindo que nenhuma refatoração sem supervisão da máquina será integrada.
5. **Automação é Libertação:** O Playwright é sua principal malha _smoke/regression_. Caso rompa em local, repare ou corrija os pseudo-elementos antes do Commit.

---
_A qualidade é um esforço conjunto da engenharia e produto — e de todo código em sua origem._
