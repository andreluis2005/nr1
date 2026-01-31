# 🚀 NR1 Pro - Guia de Deploy para Produção

## Resumo do que foi implementado

✅ **Supabase SDK** instalado e configurado  
✅ **Schema completo** do banco de dados (SQL)  
✅ **SupabaseAuthContext** - autenticação real  
✅ **Row Level Security (RLS)** - segurança de dados  
✅ **Build** funcionando perfeitamente  

---

## 📋 Checklist para Deploy

### 1. Criar Conta Supabase (5 minutos)

```bash
# Acesse: https://supabase.com
# Clique em "Start your project"
# Crie conta com GitHub/Google/Email
```

**Configurações recomendadas:**
- **Project Name:** `nr1-pro`
- **Database Password:** (gerar senha forte)
- **Region:** `South America (São Paulo)`
- **Plan:** Free Tier

---

### 2. Configurar Banco de Dados (10 minutos)

#### 2.1 Executar Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **Run**

#### 2.2 Configurar Autenticação

1. Vá em **Authentication > Providers > Email**
2. Ative:
   - ✅ Enable Email provider
   - ✅ Confirm email (recomendado para produção)
   - ✅ Secure email change
   - ✅ Secure password change

#### 2.3 Configurar Redirecionamentos

1. Vá em **Authentication > URL Configuration**
2. Configure:
   - **Site URL:** `https://seu-app.vercel.app` (ou seu domínio)
   - **Redirect URLs:** `https://seu-app.vercel.app/auth/callback`

---

### 3. Obter Credenciais (2 minutos)

1. Vá em **Project Settings > API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

---

### 4. Configurar Variáveis de Ambiente (3 minutos)

```bash
# No projeto local, copie o arquivo de exemplo
cp .env.example .env.local
```

Edite `.env.local`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

---

### 5. Deploy na Vercel (5 minutos)

#### 5.1 Criar conta Vercel

```bash
# Acesse: https://vercel.com
# Faça login com GitHub
```

#### 5.2 Importar projeto

1. Clique em **Add New Project**
2. Importe seu repositório GitHub
3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### 5.3 Adicionar Environment Variables

Adicione na Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

#### 5.4 Deploy

Clique em **Deploy** e aguarde (2-3 minutos)

---

## 🔧 Configurações Pós-Deploy

### Configurar Domínio Personalizado (Opcional)

1. Na Vercel, vá em **Settings > Domains**
2. Adicione seu domínio: `app.nr1pro.com.br`
3. Siga as instruções de DNS

### Configurar SMTP para Emails (Opcional)

Para enviar emails reais (confirmação de cadastro, recuperação de senha):

1. Crie conta no [SendGrid](https://sendgrid.com) (100 emails/dia grátis)
2. No Supabase: **Authentication > SMTP Settings**
3. Configure:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: sua API key do SendGrid

---

## 📊 Custos Estimados

| Serviço | Plano | Custo |
|---------|-------|-------|
| **Supabase** | Free | $0/mês |
| **Vercel** | Hobby | $0/mês |
| **Domínio** | .com.br | R$ 40-80/ano |
| **SendGrid** | Free | $0 (100 emails/dia) |

**Total inicial: R$ 0/mês** (até certos limites)

---

## 🛡️ Limites do Plano Gratuito

### Supabase Free Tier:
- ✅ 500MB de banco de dados
- ✅ 1GB de storage
- ✅ 2 milhões de requisições/mês
- ✅ 50 milhões de operações de banco/mês
- ✅ 200 usuários simultâneos (Realtime)

### Vercel Hobby:
- ✅ Builds ilimitados
- ✅ 100GB de bandwidth/mês
- ✅ 1000 execuções de funções/dia

---

## 🚨 Próximos Passos Importantes

### Antes de liberar para clientes:

- [ ] Configurar **SMTP** para emails reais
- [ ] Adicionar **termos de uso** e **política de privacidade**
- [ ] Configurar **backup automático** no Supabase
- [ ] Adicionar **monitoramento** (Sentry, LogRocket)
- [ ] Configurar **Google Analytics**
- [ ] Testar **fluxo completo** de cadastro e login
- [ ] Verificar **LGPD compliance**

---

## 🔗 Links Úteis

| Recurso | Link |
|---------|------|
| Supabase Dashboard | https://app.supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Documentação Supabase | https://supabase.com/docs |
| Documentação Vercel | https://vercel.com/docs |

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs na Vercel: **Deployments > Logs**
2. Verifique logs no Supabase: **Logs > API/Auth/Database**
3. Abra um issue no GitHub do projeto

---

## ✅ Status do Projeto

| Componente | Status |
|------------|--------|
| Frontend React + TypeScript | ✅ |
| UI Components (shadcn/ui) | ✅ |
| Tema Claro/Escuro | ✅ |
| Autenticação Supabase | ✅ |
| Banco de dados PostgreSQL | ✅ |
| Row Level Security | ✅ |
| Build otimizado | ✅ |
| Pronto para deploy | ✅ |

---

**Pronto para colocar em produção!** 🚀
