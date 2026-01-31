# NR1 Pro - Setup do Supabase

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha organização e nome do projeto: `nr1-pro`
4. Selecione região: `sa-east-1` (São Paulo) para melhor latência
5. Escolha plano: **Free Tier** (para começar)
6. Aguarde a criação (2-3 minutos)

## 2. Configurar Autenticação

### 2.1 Provedores de Email

1. Vá em **Authentication > Providers > Email**
2. Configure:
   - ✅ Enable Email provider
   - ✅ Confirm email: ON
   - ✅ Secure email change: ON
   - ✅ Secure password change: ON
   - ✅ Autoconfirm: OFF (para produção)

### 2.2 Configurar SMTP (Opcional - para emails reais)

1. Vá em **Authentication > SMTP Settings**
2. Use um serviço como SendGrid, Mailgun ou AWS SES
3. Configure:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: [sua chave SendGrid]

### 2.3 Configurar Redirecionamentos

1. Vá em **Authentication > URL Configuration**
2. Configure:
   - Site URL: `https://seu-app.vercel.app`
   - Redirect URLs: `https://seu-app.vercel.app/auth/callback`

## 3. Executar Schema SQL

1. Vá em **SQL Editor > New query**
2. Cole o conteúdo do arquivo `supabase/schema.sql`
3. Clique em **Run**

## 4. Configurar Storage

### 4.1 Criar Buckets

1. Vá em **Storage > New bucket**
2. Crie os buckets:
   - `profiles` (avatars de usuários)
   - `documentos` (ASOs, exames, etc.)
   - `logos` (logos das empresas)

### 4.2 Configurar Políticas de Storage

Para cada bucket, configure as políticas:

**Bucket: profiles**
```sql
-- Permitir upload apenas do próprio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Permitir leitura pública
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');
```

**Bucket: documentos**
```sql
-- Permitir upload para usuários da empresa
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Permitir leitura para usuários da mesma empresa
CREATE POLICY "Users can view company documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos');
```

## 5. Obter Credenciais

1. Vá em **Project Settings > API**
2. Copie:
   - **Project URL**: `VITE_SUPABASE_URL`
   - **anon public**: `VITE_SUPABASE_ANON_KEY`

## 6. Configurar Frontend

1. Copie `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Preencha as variáveis:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

## 7. Deploy na Vercel

### 7.1 Build do Projeto

```bash
npm run build
```

### 7.2 Deploy

1. Acesse [https://vercel.com](https://vercel.com)
2. Importe seu repositório GitHub
3. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Adicione as Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Clique em **Deploy**

## 8. Configurar Domínio Personalizado (Opcional)

1. Vá em **Project Settings > Domains**
2. Adicione seu domínio: `app.nr1pro.com.br`
3. Siga as instruções de DNS

## 9. Configurar Backup (Importante!)

1. Vá em **Database > Backups**
2. O plano Free faz backups diários automáticos
3. Para backup manual: **Trigger backup now**

## 10. Monitoramento

### 10.1 Logs

- **Database > Logs**: Queries e erros
- **Auth > Logs**: Eventos de autenticação
- **Edge Functions > Logs**: Funções serverless

### 10.2 Métricas

- **Reports > API**: Requisições e latência
- **Reports > Database**: Performance do banco
- **Reports > Auth**: Usuários ativos

## Comandos Úteis

### Resetar Banco (Cuidado!)

```sql
-- Remove todas as tabelas
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Reexecuta schema
-- Cole o conteúdo de schema.sql
```

### Verificar Usuários

```sql
SELECT * FROM auth.users;
SELECT * FROM public.perfis;
```

### Verificar Empresas

```sql
SELECT * FROM public.empresas;
SELECT * FROM public.usuarios_empresas;
```

## Custos Estimados

| Plano | Preço | Limites |
|-------|-------|---------|
| **Free** | $0 | 500MB DB, 1GB storage, 2M req/mês |
| **Pro** | $25/mês | 8GB DB, 100GB storage, ilimitado |
| **Team** | $599/mês | Ilimitado, suporte prioritário |

Para começar, o **Free Tier** é suficiente para até 100 usuários ativos.

## Suporte

- Documentação: [https://supabase.com/docs](https://supabase.com/docs)
- Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Status: [https://status.supabase.com](https://status.supabase.com)
