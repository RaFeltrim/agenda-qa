import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

test.describe('Acessibilidade (Baixa Visão / Low Vision Persona)', () => {
  // Use um login bypass se possivel ou uma pagina publica para verificar. 
  // Ja que playwright precisa de login, podemos usar a mesma estrutura do dash.

  test('Deve ser legível para usuários com baixa visão na tela de Login', async ({ page }) => {
    await page.goto('/login');
    // Espera carregar e renderizar
    await page.waitForLoadState('networkidle');

    // Executa a análise de acessibilidade focada no impacto para baixa visão
    const accessibilityScanResults = await new AxeBuilder({ page })
       // Tags úteis para WCAG contrast e legibilidade
      .withTags(['wcag2aa', 'wcag2a', 'wcag21aa'])
      .analyze();

    // Filtra especificamente erros que impactam severamente visão
    const visionIssues = accessibilityScanResults.violations.filter(
        v => v.id.includes('color-contrast') || 
             v.id.includes('zoom') || 
             v.id.includes('meta-viewport') ||
             v.id.includes('label')
    );
    
    // Anexa resultados ao reporter
    fs.writeFileSync('a11y-report.json', JSON.stringify(visionIssues, null, 2), 'utf-8');

    test.info().attach('accessibility-scan-results', {
      body: JSON.stringify(visionIssues, null, 2),
      contentType: 'application/json'
    });

    // Validar que não temos problemas graves de contraste ou ausência de rótulos (labels)
    expect(visionIssues.length).toBe(0);
  });
});
