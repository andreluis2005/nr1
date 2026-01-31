-- =============================================================================
-- NR1 Pro - Schema do Banco de Dados Supabase
-- Sistema de Gestão de Saúde e Segurança do Trabalho
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABELA: PERFIS DE USUÁRIO (Estende auth.users do Supabase)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    sobrenome TEXT,
    avatar_url TEXT,
    telefone TEXT,
    cargo TEXT,
    perfil TEXT NOT NULL DEFAULT 'usuario' CHECK (perfil IN ('admin', 'gestor', 'usuario', 'auditor')),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'pendente')),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    ultimo_acesso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE public.perfis IS 'Perfis de usuários do sistema NR1 Pro';
COMMENT ON COLUMN public.perfis.perfil IS 'Nível de acesso: admin, gestor, usuario, auditor';

-- =============================================================================
-- TABELA: EMPRESAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia TEXT NOT NULL,
    razao_social TEXT,
    cnpj TEXT UNIQUE,
    inscricao_estadual TEXT,
    inscricao_municipal TEXT,
    
    -- Endereço
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado CHAR(2),
    
    -- Contato
    telefone TEXT,
    email TEXT,
    site TEXT,
    
    -- Configurações
    logo_url TEXT,
    cor_primaria TEXT DEFAULT '#1E40AF',
    cor_secundaria TEXT DEFAULT '#3B82F6',
    
    -- Plano e Faturamento
    plano TEXT NOT NULL DEFAULT 'trial' CHECK (plano IN ('trial', 'starter', 'business', 'enterprise')),
    trial_ate TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'suspensa', 'cancelada')),
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- TABELA: USUÁRIOS_EMPRESAS (Relacionamento N:N)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.usuarios_empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    perfil TEXT NOT NULL DEFAULT 'usuario' CHECK (perfil IN ('admin', 'gestor', 'usuario', 'auditor')),
    departamento TEXT,
    matricula TEXT,
    data_admissao DATE,
    is_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(usuario_id, empresa_id)
);

-- =============================================================================
-- TABELA: SESSÕES ATIVAS (Para controle de múltiplos dispositivos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sessoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT,
    ip_address INET,
    user_agent TEXT,
    location TEXT,
    refresh_token_hash TEXT,
    ultima_atividade TIMESTAMPTZ DEFAULT NOW(),
    expira_em TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABELA: LOGS DE AUDITORIA
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.perfis(id),
    empresa_id UUID REFERENCES public.empresas(id),
    acao TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABELA: FUNCIONÁRIOS (Colaboradores da empresa)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    
    -- Dados Pessoais
    nome_completo TEXT NOT NULL,
    cpf TEXT,
    rg TEXT,
    data_nascimento DATE,
    sexo CHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
    estado_civil TEXT,
    
    -- Endereço
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado CHAR(2),
    
    -- Contato
    telefone TEXT,
    celular TEXT,
    email TEXT,
    
    -- Dados Profissionais
    matricula TEXT,
    cargo TEXT,
    departamento TEXT,
    data_admissao DATE,
    data_demissao DATE,
    tipo_contrato TEXT DEFAULT 'clt' CHECK (tipo_contrato IN ('clt', 'pj', 'estagio', 'temporario')),
    
    -- Saúde e Segurança
    pis_pasep TEXT,
    ctps_numero TEXT,
    ctps_serie TEXT,
    ctps_uf CHAR(2),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'afastado', 'ferias', 'demissional', 'inativo')),
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- TABELA: ASOS (Atestados de Saúde Ocupacional)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.asos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    
    -- Dados do ASO
    tipo_aso TEXT NOT NULL CHECK (tipo_aso IN ('admissional', 'demissional', 'periodico', 'retorno', 'mudanca_funcao', 'risco_especial')),
    data_exame DATE NOT NULL,
    data_validade DATE,
    
    -- Resultados
    apto BOOLEAN,
    restricoes TEXT,
    observacoes TEXT,
    
    -- Médico
    medico_nome TEXT,
    medico_crm TEXT,
    medico_uf CHAR(2),
    
    -- Documento
    arquivo_url TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado', 'vencido')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- TABELA: EXAMES COMPLEMENTARES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.exames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    
    tipo_exame TEXT NOT NULL,
    data_solicitacao DATE,
    data_realizacao DATE,
    data_resultado DATE,
    resultado TEXT,
    observacoes TEXT,
    arquivo_url TEXT,
    
    status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'agendado', 'realizado', 'resultado_disponivel', 'cancelado')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- TABELA: ACIDENTES DE TRABALHO
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.acidentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    
    -- Dados do Acidente
    data_acidente TIMESTAMPTZ NOT NULL,
    hora_acidente TIME,
    local_acidente TEXT,
    descricao TEXT NOT NULL,
    
    -- Tipo e Natureza
    tipo_acidente TEXT CHECK (tipo_acidente IN ('tipico', 'trajeto', 'doenca_profissional', 'doenca_trabalho')),
    natureza_lesao TEXT,
    parte_corpo TEXT,
    
    -- CAT
    cat_emitida BOOLEAN DEFAULT FALSE,
    cat_numero TEXT,
    cat_data_emissao DATE,
    
    -- Afastamento
    afastamento_dias INTEGER,
    afastamento_inicio DATE,
    afastamento_fim DATE,
    
    -- Investigação
    causas TEXT,
    medidas_adotadas TEXT,
    testemunhas TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'registrado' CHECK (status IN ('registrado', 'investigacao', 'concluido', 'arquivado')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- TABELA: NOTIFICAÇÕES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
    
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'error')),
    
    -- Link opcional
    link TEXT,
    link_text TEXT,
    
    -- Status
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMPTZ,
    
    -- Agendamento
    agendada_para TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_perfis_email ON public.perfis(email);
CREATE INDEX IF NOT EXISTS idx_perfis_perfil ON public.perfis(perfil);
CREATE INDEX IF NOT EXISTS idx_perfis_status ON public.perfis(status);

CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON public.empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON public.empresas(status);
CREATE INDEX IF NOT EXISTS idx_empresas_plano ON public.empresas(plano);

CREATE INDEX IF NOT EXISTS idx_usuarios_empresas_usuario ON public.usuarios_empresas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresas_empresa ON public.usuarios_empresas(empresa_id);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON public.sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_device ON public.sessoes(device_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira ON public.sessoes(expira_em);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa ON public.auditoria_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created ON public.auditoria_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON public.funcionarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_cpf ON public.funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_funcionarios_status ON public.funcionarios(status);

CREATE INDEX IF NOT EXISTS idx_asos_empresa ON public.asos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_asos_funcionario ON public.asos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_asos_validade ON public.asos(data_validade);
CREATE INDEX IF NOT EXISTS idx_asos_status ON public.asos(status);

CREATE INDEX IF NOT EXISTS idx_exames_empresa ON public.exames(empresa_id);
CREATE INDEX IF NOT EXISTS idx_exames_funcionario ON public.exames(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_exames_status ON public.exames(status);

CREATE INDEX IF NOT EXISTS idx_acidentes_empresa ON public.acidentes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_acidentes_funcionario ON public.acidentes(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_acidentes_data ON public.acidentes(data_acidente);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURANÇA
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS: PERFIS
-- =============================================================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários veem próprio perfil" ON public.perfis
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários atualizam próprio perfil" ON public.perfis
    FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins veem todos perfis" ON public.perfis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.perfil = 'admin'
        )
    );

-- =============================================================================
-- POLÍTICAS: EMPRESAS
-- =============================================================================

-- Usuários veem empresas onde estão vinculados
CREATE POLICY "Usuários veem suas empresas" ON public.empresas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = empresas.id
            AND ue.usuario_id = auth.uid()
        )
    );

-- Admins podem gerenciar suas empresas
CREATE POLICY "Admins gerenciam empresas" ON public.empresas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = empresas.id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil = 'admin'
        )
    );

-- =============================================================================
-- POLÍTICAS: USUÁRIOS_EMPRESAS
-- =============================================================================

CREATE POLICY "Usuários veem próprios vínculos" ON public.usuarios_empresas
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Admins gerenciam vínculos" ON public.usuarios_empresas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = usuarios_empresas.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil = 'admin'
        )
    );

-- =============================================================================
-- POLÍTICAS: FUNCIONÁRIOS
-- =============================================================================

CREATE POLICY "Usuários veem funcionários da empresa" ON public.funcionarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = funcionarios.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Gestores gerenciam funcionários" ON public.funcionarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = funcionarios.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );

-- =============================================================================
-- POLÍTICAS: ASOS
-- =============================================================================

CREATE POLICY "Usuários veem ASOs da empresa" ON public.asos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = asos.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Gestores gerenciam ASOs" ON public.asos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = asos.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );

-- =============================================================================
-- POLÍTICAS: EXAMES
-- =============================================================================

CREATE POLICY "Usuários veem exames da empresa" ON public.exames
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = exames.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Gestores gerenciam exames" ON public.exames
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = exames.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );

-- =============================================================================
-- POLÍTICAS: ACIDENTES
-- =============================================================================

CREATE POLICY "Usuários veem acidentes da empresa" ON public.acidentes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = acidentes.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Gestores gerenciam acidentes" ON public.acidentes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = acidentes.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );

-- =============================================================================
-- POLÍTICAS: NOTIFICAÇÕES
-- =============================================================================

CREATE POLICY "Usuários veem próprias notificações" ON public.notificacoes
    FOR ALL USING (usuario_id = auth.uid());

-- =============================================================================
-- FUNÇÕES AUXILIARES
-- =============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON public.perfis
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON public.funcionarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asos_updated_at BEFORE UPDATE ON public.asos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acidentes_updated_at BEFORE UPDATE ON public.acidentes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- FUNÇÃO: Registrar log de auditoria
-- =============================================================================
CREATE OR REPLACE FUNCTION public.registrar_auditoria(
    p_acao TEXT,
    p_entidade TEXT,
    p_entidade_id UUID,
    p_dados_anteriores JSONB DEFAULT NULL,
    p_dados_novos JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.auditoria_logs (
        usuario_id,
        acao,
        entidade,
        entidade_id,
        dados_anteriores,
        dados_novos,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_acao,
        p_entidade,
        p_entidade_id,
        p_dados_anteriores,
        p_dados_novos,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNÇÃO: Criar perfil após signup
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (id, email, nome, perfil, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'perfil', 'usuario'),
        'pendente'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- DADOS INICIAIS (SEED)
-- =============================================================================

-- Inserir empresa de demonstração (apenas em desenvolvimento)
-- INSERT INTO public.empresas (nome_fantasia, razao_social, cnpj, plano, status)
-- VALUES ('Empresa Demo', 'Empresa Demonstração LTDA', '00.000.000/0000-00', 'enterprise', 'ativa');
