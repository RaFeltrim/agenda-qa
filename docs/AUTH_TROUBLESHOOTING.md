# 🔧 TROUBLESHOOTING DE AUTENTICAÇÃO

## 🚨 ERRO 400 NA AUTENTICAÇÃO

### Sintomas:

```
xwpdvgtcocgscwcjluqw.supabase.co/auth/v1/token?grant_type=password:1
Failed to load resource: the server responded with a status of 400 ()
```

### Possíveis Causas e Soluções:

## 1. 🔍 DIAGNÓSTICO INICIAL

### Execute o script de diagnóstico:

```sql
-- Use o arquivo auth-debug.sql
```

### Verifique manualmente:

**A. Usuário existe no Auth?**

```sql
SELECT * FROM auth.users
WHERE email = 'Board_RFeltrim@agenda-qa.internal';
```

**B. Profile existe?**

```sql
SELECT * FROM public.profiles
WHERE username = 'Board_RFeltrim';
```

**C. UUIDs correspondem?**

```sql
SELECT
  a.id as auth_id,
  a.email,
  p.id as profile_id,
  p.username
FROM auth.users a
JOIN public.profiles p ON a.id = p.id
WHERE p.username = 'Board_RFeltrim';
```

## 2. ✅ SOLUÇÕES PASSO A PASSO

### Problema: Usuário não existe no Auth

**Solução:**

1. Acesse Supabase Dashboard → Authentication → Users → Invite User
2. Crie o usuário com email e senha corretos
3. **Importante:** Marque "Auto confirm email" = TRUE

### Problema: Profile não existe

**Solução:**

1. Execute `complete-setup-fix.sql`
2. Substitua UUIDs fictícios pelos reais do Supabase
3. Verifique que INSERT foi executado com sucesso

### Problema: Email não confirmado

**Solução:**

```sql
-- Confirmar email manualmente (apenas para desenvolvimento)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'Board_RFeltrim@agenda-qa.internal';
```

### Problema: UUIDs não correspondem

**Solução:**

1. Delete o profile problemático:

```sql
DELETE FROM public.profiles
WHERE username = 'Board_RFeltrim';
```

2. Recrie com UUID correto:

```sql
INSERT INTO public.profiles (id, username, full_name, role, first_login)
VALUES ('UUID-CORRETO', 'Board_RFeltrim', 'Rafael Feltrim', 'editor', true);
```

## 3. 🔄 FLUXO DE VERIFICAÇÃO COMPLETO

### Etapa 1: Verificar ambiente

```bash
# Confirme variáveis de ambiente
cat .env
```

Deve conter:

```
VITE_SUPABASE_URL=https://xwpdvgtcocgscwcjluqw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_62lFRFlgO7KpdRvzSBEwTQ_n7BIGOfm
```

### Etapa 2: Reiniciar servidor de desenvolvimento

```bash
# Pare o servidor atual (Ctrl+C)
# Inicie novamente
npm run dev
```

### Etapa 3: Teste de login

1. Acesse http://localhost:5173
2. Tente login com:
   - **Username:** Board_RFeltrim
   - **Senha:** Senhainicial1

### Etapa 4: Verificar console do navegador

- Abra DevTools (F12)
- Vá em Console
- Veja mensagens de erro específicas

## 4. 🛠️ SCRIPTS ÚTEIS

### Limpar e reiniciar:

```sql
-- Limpar profiles problemáticos
DELETE FROM public.profiles
WHERE username IN ('Board_RFeltrim', 'Board_MCordeiro', 'Board_LMuller',
                   'Board_FCustodio', 'Board_JPaulo', 'Board_MNeves');

-- Reexecutar inserts com UUIDs corretos
```

### Verificar integridade:

```sql
-- Contar usuários e profiles
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'editor') as editors,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'viewer') as viewers;
```

## 5. 🚨 CASOS ESPECIAIS

### Erro persiste após todos os passos:

1. **Limpe cache do navegador**
2. **Use aba anônima/incógnito**
3. **Verifique URL do Supabase** no .env
4. **Confirme ANON_KEY** está correto

### Usuário criado mas não loga:

```sql
-- Verificar detalhes do usuário
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_app_meta_data
FROM auth.users
WHERE email = 'Board_RFeltrim@agenda-qa.internal';
```

## 6. ✅ CHECKLIST FINAL

Antes de testar login:

- [ ] Usuários criados no Supabase Dashboard
- [ ] Emails confirmados (email_confirmed_at NOT NULL)
- [ ] Profiles inseridos com UUIDs corretos
- [ ] Variáveis de ambiente configuradas
- [ ] Servidor reiniciado
- [ ] Cache do navegador limpo

## 7. 🆘 EMERGENCIAL

Se nada funcionar:

1. **Backup rápido:**

```sql
-- Exportar profiles atuais
COPY (SELECT * FROM public.profiles) TO '/tmp/profiles_backup.csv' CSV HEADER;
```

2. **Reset completo:**

```sql
-- Limpar tudo e recomeçar
DELETE FROM public.profiles;
-- Recriar usuários no Dashboard
-- Reexecutar setup com UUIDs novos
```

---

## 📞 SUPORTE

Se continuar com problemas:

1. Execute `auth-debug.sql` e compartilhe resultados
2. Verifique console do navegador (F12 → Console)
3. Confirme todas etapas do checklist acima
