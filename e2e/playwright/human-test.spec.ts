/**
 * TESTE HUMANO AUTOMATIZADO — Simula navegação real de usuário
 * Captura TODOS os erros de console, network failures, e problemas de UI
 */
import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_USER_EMAIL || 'test.admin@example.com';
const PASSWORD = process.env.TEST_USER_PASSWORD || 'CHANGE_ME_password';

// Collector de erros
const consoleErrors: string[] = [];
const networkErrors: string[] = [];
const pageErrors: string[] = [];

test.describe('TESTE HUMANO — Navegação Completa @regression', () => {

  test.beforeEach(async ({ page }) => {
    // Capturar TODOS os logs de console
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        consoleErrors.push(`[CONSOLE ERROR] ${text}`);
        console.log(`🔴 CONSOLE ERROR: ${text}`);
      } else if (type === 'warning' && !text.includes('DevTools') && !text.includes('Download the React DevTools')) {
        console.log(`🟡 CONSOLE WARN: ${text.substring(0, 200)}`);
      }
    });

    // Capturar erros de rede
    page.on('requestfailed', request => {
      const msg = `[NETWORK FAIL] ${request.method()} ${request.url()} — ${request.failure()?.errorText}`;
      networkErrors.push(msg);
      console.log(`🔴 ${msg}`);
    });

    // Capturar erros de página (uncaught exceptions)
    page.on('pageerror', error => {
      const msg = `[PAGE ERROR] ${error.message}`;
      pageErrors.push(msg);
      console.log(`🔴 ${msg}`);
    });
  });

  test('1️⃣ LOGIN — Realizar login e verificar dashboard', async ({ page }) => {
    console.log('\n========== 1️⃣ TESTE: LOGIN ==========');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    console.log('📍 Página de login carregada');

    // Preencher credenciais
    await page.getByTestId('login-email-input').fill(EMAIL);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    console.log('✏️ Credenciais preenchidas');

    // Clicar login
    await page.getByTestId('login-submit-button').click();
    console.log('🖱️ Botão LOGIN clicado');

    // Aguardar redirecionamento
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 15000 });
    const url = page.url();
    console.log(`📍 URL após login: ${url}`);

    if (url.includes('/dashboard')) {
      console.log('✅ Login bem-sucedido — redirecionado para dashboard');
    } else {
      console.log('❌ Login FALHOU — ainda na página de login');
    }

    // Esperar conteúdo carregar
    await page.waitForLoadState('networkidle');

    // Verificar o que está visível
    const bodyText = await page.locator('body').innerText();
    console.log(`📄 Texto visível (primeiros 300 chars): ${bodyText.replace(/\s+/g, ' ').substring(0, 300)}`);

    // Checar se ProLayout renderizou
    const hasProLayout = await page.locator('.ant-pro-layout').count();
    console.log(`🏗️ ProLayout renderizado: ${hasProLayout > 0 ? '✅ SIM' : '❌ NÃO'}`);
  });

  test('2️⃣ DASHBOARD — Inspecionar KanbanBoard', async ({ page }) => {
    console.log('\n========== 2️⃣ TESTE: DASHBOARD / KANBAN ==========');
    
    // Login rápido
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(EMAIL);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Verificar título
    const title = await page.locator('h1, h2, h3, h4').first().innerText().catch(() => 'NÃO ENCONTRADO');
    console.log(`📌 Título da página: "${title}"`);

    // Verificar colunas do Kanban
    const kanban = page.getByTestId('kanban-board');
    const kanbanVisible = await kanban.isVisible().catch(() => false);
    console.log(`📋 KanbanBoard visível: ${kanbanVisible ? '✅ SIM' : '❌ NÃO'}`);

    if (kanbanVisible) {
      for (const col of ['A Agendar', 'Confirmada', 'Realizada']) {
        const found = await page.locator(`text="${col}"`).count();
        console.log(`   Coluna "${col}": ${found > 0 ? '✅' : '❌'}`);
      }
    }

    // Verificar botão Nova Reunião
    const newMeetingBtn = page.getByTestId('new-meeting-btn');
    const btnVisible = await newMeetingBtn.isVisible().catch(() => false);
    console.log(`🆕 Botão "Nova Reunião" visível: ${btnVisible ? '✅ SIM' : '⚠️ NÃO (role=viewer)'}`);

    // Se visível, clicar para abrir modal
    if (btnVisible) {
      await newMeetingBtn.click();
      console.log('🖱️ Clicado em "Nova Reunião"');
      

      const modalVisible = await page.locator('.ant-modal').isVisible().catch(() => false);
      console.log(`📦 Modal abriu: ${modalVisible ? '✅ SIM' : '❌ NÃO'}`);

      if (modalVisible) {
        const modalText = await page.locator('.ant-modal').innerText();
        console.log(`📄 Conteúdo do modal: ${modalText.replace(/\s+/g, ' ').substring(0, 200)}`);
        
        // Fechar modal
        await page.locator('.ant-modal .ant-modal-close').click().catch(() => {});
        
      }
    }

    // Verificar se há reuniões carregadas ou estado vazio
    const emptyState = await page.locator('.ant-empty').count();
    console.log(`📭 Estado vazio (sem reuniões): ${emptyState > 0 ? '⚠️ SIM — tabela meetings não existe' : 'Não detectado'}`);

    // Capturar screenshot
    await page.screenshot({ path: 'test-results/human-test-dashboard.png', fullPage: true });
    console.log('📸 Screenshot salvo: test-results/human-test-dashboard.png');
  });

  test('3️⃣ TASKBOARD — Toggle e colunas de tarefas', async ({ page }) => {
    console.log('\n========== 3️⃣ TESTE: TASKBOARD ==========');
    
    // Login
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(EMAIL);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Encontrar e clicar o toggle
    const toggle = page.getByTestId('view-toggle-switch');
    const toggleVisible = await toggle.isVisible().catch(() => false);
    console.log(`🔀 Toggle visível: ${toggleVisible ? '✅ SIM' : '❌ NÃO'}`);

    if (toggleVisible) {
      await toggle.click();
      console.log('🖱️ Toggle clicado — mudando para TaskBoard');
      await page.waitForLoadState('networkidle');

      // Verificar TaskBoard
      const taskBoard = page.getByTestId('task-board');
      const tbVisible = await taskBoard.isVisible().catch(() => false);
      console.log(`📋 TaskBoard visível: ${tbVisible ? '✅ SIM' : '❌ NÃO'}`);

      // Checar "Backlog Geral"
      const backlogGeral = await page.locator('text="Backlog Geral"').count();
      console.log(`📌 "Backlog Geral" visível: ${backlogGeral > 0 ? '✅ SIM' : '❌ NÃO'}`);

      // Checar "Selecione uma Sprint"
      const sprintSelector = await page.locator('text="Selecione uma Sprint"').count();
      console.log(`🏃 "Selecione uma Sprint": ${sprintSelector > 0 ? '✅ SIM' : '⚠️ NÃO'}`);

      // Verificar se colunas estão visíveis (só aparecem se houver cards)
      const bodyText = await page.locator('body').innerText();
      for (const col of ['Backlog', 'A Fazer', 'Em Progresso', 'Bloqueado', 'Concluído']) {
        const found = bodyText.includes(col);
        console.log(`   Coluna "${col}": ${found ? '✅' : '⚠️ (empty state)'}`);
      }

      // Verificar botão Nova Tarefa
      const newTaskBtn = await page.locator('button:has-text("Nova Tarefa")');
      const ntVisible = await newTaskBtn.isVisible().catch(() => false);
      console.log(`🆕 Botão "Nova Tarefa" visível: ${ntVisible ? '✅ SIM' : '⚠️ NÃO'}`);

      // Screenshot
      await page.screenshot({ path: 'test-results/human-test-taskboard.png', fullPage: true });
      console.log('📸 Screenshot salvo: test-results/human-test-taskboard.png');
    }
  });

  test('4️⃣ PROFILE — Página de perfil', async ({ page }) => {
    console.log('\n========== 4️⃣ TESTE: PROFILE ==========');
    
    // Login
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(EMAIL);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    

    // Navegar para profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    console.log(`📍 URL: ${page.url()}`);

    const bodyText = await page.locator('body').innerText();
    console.log(`📄 Conteúdo (primeiros 400 chars): ${bodyText.replace(/\s+/g, ' ').substring(0, 400)}`);

    // Verificar se email do usuário aparece
    const hasEmail = bodyText.includes(EMAIL) || bodyText.includes(EMAIL.split('@')[0]);
    console.log(`📧 Email do usuário visível: ${hasEmail ? '✅ SIM' : '❌ NÃO'}`);

    // Verificar se há erros visíveis
    const hasError = bodyText.toLowerCase().includes('erro') || bodyText.toLowerCase().includes('error');
    console.log(`⚠️ Erros visíveis na página: ${hasError ? '🔴 SIM' : '✅ NÃO'}`);

    // Verificar formulário de edição
    const inputs = await page.locator('input').count();
    console.log(`📝 Campos de input encontrados: ${inputs}`);

    // Tentar editar o nome (se campo existir)
    const nameInput = page.locator('input[placeholder*="nome"], input[id*="name"], input[id*="nome"]').first();
    const nameExists = await nameInput.isVisible().catch(() => false);
    if (nameExists) {
      const currentValue = await nameInput.inputValue();
      console.log(`👤 Campo nome atual: "${currentValue}"`);
    }

    await page.screenshot({ path: 'test-results/human-test-profile.png', fullPage: true });
    console.log('📸 Screenshot salvo: test-results/human-test-profile.png');
  });

  test('5️⃣ SETTINGS — Página de configurações', async ({ page }) => {
    console.log('\n========== 5️⃣ TESTE: SETTINGS ==========');
    
    // Login
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(EMAIL);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    

    // Navegar para settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    console.log(`📍 URL: ${page.url()}`);

    const bodyText = await page.locator('body').innerText();
    console.log(`📄 Conteúdo (primeiros 400 chars): ${bodyText.replace(/\s+/g, ' ').substring(0, 400)}`);

    await page.screenshot({ path: 'test-results/human-test-settings.png', fullPage: true });
    console.log('📸 Screenshot salvo: test-results/human-test-settings.png');
  });

  test('6️⃣ ADMIN — Página de gestão de usuários', async ({ page }) => {
    console.log('\n========== 6️⃣ TESTE: ADMIN ==========');
    
    // Login
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(EMAIL);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    

    // Navegar para admin
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    console.log(`📍 URL: ${page.url()}`);

    const bodyText = await page.locator('body').innerText();
    console.log(`📄 Conteúdo (primeiros 400 chars): ${bodyText.replace(/\s+/g, ' ').substring(0, 400)}`);

    // Verificar acesso negado
    const denied = bodyText.includes('Acesso Negado') || bodyText.includes('negado') || bodyText.includes('permissão');
    console.log(`🚫 Acesso negado detectado: ${denied ? '⚠️ SIM (esperado — role=viewer)' : '✅ NÃO'}`);

    await page.screenshot({ path: 'test-results/human-test-admin.png', fullPage: true });
    console.log('📸 Screenshot salvo: test-results/human-test-admin.png');
  });

  test('7️⃣ SIDEBAR — Navegação pelo menu lateral', async ({ page }) => {
    console.log('\n========== 7️⃣ TESTE: SIDEBAR / NAVEGAÇÃO ==========');
    
    // Login
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(EMAIL);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Verificar sidebar
    const sidebar = page.locator('.ant-pro-sider, .ant-layout-sider');
    const sidebarVisible = await sidebar.first().isVisible().catch(() => false);
    console.log(`📐 Sidebar visível: ${sidebarVisible ? '✅ SIM' : '❌ NÃO'}`);

    // Listar items do menu
    const menuItems = page.locator('.ant-menu-item');
    const count = await menuItems.count();
    console.log(`📋 Items no menu: ${count}`);
    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).innerText().catch(() => '');
      console.log(`   Menu[${i}]: "${text.trim()}"`);
    }

    // Clicar em cada item do menu e observar
    for (let i = 0; i < count; i++) {
      const text = (await menuItems.nth(i).innerText().catch(() => '')).trim();
      if (text) {
        await menuItems.nth(i).click().catch(() => {});
        await expect(page.locator('.ant-menu-item-selected')).toBeVisible({ timeout: 3000 });
        console.log(`🖱️ Clicou em "${text}" → URL: ${page.url()}`);
      }
    }

    // Testar o menu do avatar/dropdown no canto superior direito
    const avatarDropdown = page.locator('.ant-pro-global-header .ant-dropdown-trigger, .ant-avatar').first();
    const avatarVisible = await avatarDropdown.isVisible().catch(() => false);
    console.log(`\n👤 Avatar/dropdown visível: ${avatarVisible ? '✅ SIM' : '❌ NÃO'}`);

    if (avatarVisible) {
      await avatarDropdown.click();
      
      
      const dropdownMenu = page.locator('.ant-dropdown-menu, .ant-popover');
      const dropVisible = await dropdownMenu.isVisible().catch(() => false);
      console.log(`📋 Dropdown menu abriu: ${dropVisible ? '✅ SIM' : '❌ NÃO'}`);

      if (dropVisible) {
        const dropText = await dropdownMenu.innerText().catch(() => '');
        console.log(`📄 Opções do dropdown: ${dropText.replace(/\s+/g, ' ').substring(0, 200)}`);
      }
    }

    await page.screenshot({ path: 'test-results/human-test-sidebar.png', fullPage: true });
    console.log('📸 Screenshot salvo: test-results/human-test-sidebar.png');
  });

  test('8️⃣ RESUMO — Coletar todos os erros acumulados', async ({ page }) => {
    console.log('\n========== 📊 RESUMO DE ERROS ==========');
    console.log(`\n🔴 Console Errors: ${consoleErrors.length}`);
    consoleErrors.forEach(e => console.log(`   ${e}`));
    console.log(`\n🔴 Network Errors: ${networkErrors.length}`);
    networkErrors.forEach(e => console.log(`   ${e}`));
    console.log(`\n🔴 Page Errors: ${pageErrors.length}`);
    pageErrors.forEach(e => console.log(`   ${e}`));
    console.log('\n========================================\n');
  });
});
