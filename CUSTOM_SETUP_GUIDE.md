# 🎯 GUIA DE CONFIGURAÇÃO PERSONALIZADA

## 🔧 SETUP PERSONALIZADO DE USUÁRIOS

### Estrutura de Usuários Criada

**ADMINISTRADOR (Você):**

- **Username:** `Board_RFeltrim`
- **Email:** `Board_RFeltrim@agenda-qa.internal`
- **Senha inicial:** `Senhainicial1`
- **Role:** editor (com privilégios administrativos especiais)
- **Permissões:** Total (adicionar, editar, deletar, gerenciar usuários)

> **Nota:** Devido ao schema existente do banco, o administrador usa a role `editor` mas é identificado como admin pelo username `Board_RFeltrim`.

**EDITORES:**

1. **Mauricio Cordeiro**
   - Username: `Board_MCordeiro`
   - Email: `Board_MCordeiro@agenda-qa.internal`
   - Senha: `Senhainicial2`

2. **Luiz Muller**
   - Username: `Board_LMuller`
   - Email: `Board_LMuller@agenda-qa.internal`
   - Senha: `Senhainicial3`

**VISUALIZADORES:**

1. **Fabiana Custódio**
   - Username: `Board_FCustodio`
   - Email: `Board_FCustodio@agenda-qa.internal`
   - Senha: `Senhainicial4`

2. **João Paulo**
   - Username: `Board_JPaulo`
   - Email: `Board_JPaulo@agenda-qa.internal`
   - Senha: `Senhainicial5`

3. **Marco Aurélio**
   - Username: `Board_MNeves`
   - Email: `Board_MNeves@agenda-qa.internal`
   - Senha: `Senhainicial6`

---

## 🚀 PASSO A PASSO PARA IMPLEMENTAÇÃO

### 1. Criar Usuários no Supabase

**Acesse:** Supabase Dashboard → Authentication → Users → Invite User

**Para cada usuário, preencha:**

- **Email:** Use o email da lista acima
- **Password:** Use a senha correspondente
- **User Metadata:** Nome completo do usuário
- **Auto confirm email:** TRUE
- **Send magic link:** FALSE

### 2. Executar Script SQL

Use o arquivo `custom-user-setup.sql`:

1. Copie o conteúdo do arquivo
2. Cole no **SQL Editor** do Supabase
3. **Substitua os UUIDs fictícios** pelos reais:
   - Vá em Authentication → Users
   - Clique em cada usuário criado
   - Copie o ID (UUID) de cada um
   - Substitua no script SQL

### 3. Verificar Configuração

Execute a query de verificação:

```sql
SELECT username, full_name, role, is_admin FROM public.profiles ORDER BY role, username;
```

Deve mostrar todos os 6 usuários com suas respectivas roles.

---

## 👑 FUNCIONALIDADES DO PERFIL ADMIN

### Permissões Especiais

Como administrador (`Board_RFeltrim`), você tem acesso a:

✅ **Gestão Completa de Cards**

- Criar, editar e deletar qualquer card
- Alterar status de qualquer card
- Atribuir/desatribuir responsáveis

✅ **Gestão de Usuários**

- Resetar senhas de outros usuários
- Alterar roles dos usuários
- Visualizar todos os perfis

✅ **Recuperação de Senha**

- Sistema "Esqueci minha senha" integrado
- Criação automática de cards urgentes
- Notificações em tempo real

✅ **Auditoria Completa**

- Logs de todas as ações
- Histórico de alterações
- Relatórios de atividade

---

## 🔐 SISTEMA DE RECUPERAÇÃO DE SENHA

### Como Funciona

1. **Usuário clica em "Esqueci minha senha"**
2. **Informa seu email de acesso**
3. **Sistema verifica existência do usuário**
4. **Envia email com link de redefinição**
5. **Cria card URGENTE automaticamente para o admin**
6. **Gera notificação para o administrador**

### Para o Administrador

Quando alguém solicitar recuperação de senha:

- ✅ Receberá notificação imediata
- ✅ Card urgente será criado com os dados da solicitação
- ✅ Poderá entrar em contato diretamente com o usuário
- ✅ Poderá auxiliar na redefinição manual se necessário

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Setup Inicial:

- [ ] Usuários criados no Supabase com emails corretos
- [ ] Senhas configuradas conforme especificado
- [ ] Script SQL executado com UUIDs reais
- [ ] Tabela `profiles` populada corretamente

### Funcionalidades:

- [ ] Login funciona com credenciais fornecidas
- [ ] Admin tem acesso total ao sistema
- [ ] Editors podem criar/editar/deletar cards
- [ ] Viewers apenas visualizam e comentam
- [ ] Opção "Esqueci minha senha" disponível
- [ ] Sistema cria cards urgentes automaticamente

### Testes Específicos:

- [ ] Testar login como admin (`Board_RFeltrim`)
- [ ] Testar funcionalidade de recuperação de senha
- [ ] Verificar criação de card urgente
- [ ] Confirmar notificações estão funcionando

---

## 🆘 SUPORTE E TROUBLESHOOTING

### Problemas Comuns:

**Não consigo logar:**

1. Verifique se o usuário foi criado no Supabase
2. Confirme que a senha está correta
3. Verifique se o profile foi inserido no banco

**Card urgente não é criado:**

1. Verifique console do navegador (F12)
2. Confirme integração com sistema de cards
3. Valide permissões do admin

**Erros de UUID:**

1. Use sempre os UUIDs reais do Supabase
2. Não use os placeholders do script
3. Verifique se usuários existem antes de inserir profiles

---

## 📁 ARQUIVOS CRIADOS

1. **`custom-user-setup.sql`** - Script principal de setup
2. **`ForgotPasswordModal.tsx`** - Componente de recuperação de senha
3. **`Login.tsx`** (atualizado) - Com opção de recuperação de senha
4. **`CUSTOM_SETUP_GUIDE.md`** - Esta documentação

---

## 🎉 RESULTADO ESPERADO

Após seguir todos os passos:

- ✅ Sistema com 6 usuários funcionais
- ✅ Você como admin com acesso privilegiado
- ✅ Sistema de recuperação de senha operacional
- ✅ Cards urgentes criados automaticamente
- ✅ Notificações para administração

**Status:** ✅ Pronto para implementação
