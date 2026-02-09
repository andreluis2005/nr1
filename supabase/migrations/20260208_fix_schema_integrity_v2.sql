-- =============================================================================
-- NR1 PRO - MIGRATION: FASE 8A - CORREÇÃO DE INTEGRIDADE ESTRUTURAL (V2)
-- =============================================================================
-- Objetivo:
-- 1. Materializar colunas 'cnae' e 'descricao_cnae' na tabela empresas (Contrato de Domínio).
-- 2. Garantir existência da tabela 'riscos' (Phase 4).
-- 3. Garantir existência da tabela 'historico_exposicao' (Phase 6).
-- 4. CORRIGIR políticas RLS quebradas em 'historico_exposicao' (Ref. a user_id inexistente).
-- =============================================================================

-- 1. CORREÇÃO DA TABELA EMPRESAS (CNAE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'cnae') THEN
        ALTER TABLE public.empresas ADD COLUMN cnae TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'descricao_cnae') THEN
        ALTER TABLE public.empresas ADD COLUMN descricao_cnae TEXT;
    END IF;

    -- Garantir b_verificada (já devia estar lá, mas reforçando)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'b_verificada') THEN
        ALTER TABLE public.empresas ADD COLUMN b_verificada BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 2. GARANTIA DA TABELA RISCOS (Phase 4)
CREATE TABLE IF NOT EXISTS public.riscos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    setor_id UUID NOT NULL REFERENCES public.setores(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL CHECK (categoria IN ('fisico', 'quimico', 'biologico', 'ergonomico', 'acidente')),
    nome TEXT NOT NULL,
    descricao TEXT,
    severidade INTEGER DEFAULT 1 CHECK (severidade >= 1 AND severidade <= 5),
    probabilidade INTEGER DEFAULT 1 CHECK (probabilidade >= 1 AND probabilidade <= 5),
    medidas_controle TEXT,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'controlado', 'eliminado', 'inativo')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS Riscos
ALTER TABLE public.riscos ENABLE ROW LEVEL SECURITY;

-- Recriar Policies de Riscos (Drop if exists para evitar erro)
DROP POLICY IF EXISTS "Usuários veem riscos da empresa" ON public.riscos;
CREATE POLICY "Usuários veem riscos da empresa" ON public.riscos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = riscos.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Gestores gerenciam riscos" ON public.riscos;
CREATE POLICY "Gestores gerenciam riscos" ON public.riscos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = riscos.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );

-- Indices Riscos
CREATE INDEX IF NOT EXISTS idx_riscos_empresa ON public.riscos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_riscos_setor ON public.riscos(setor_id);

-- 3. CORREÇÃO DA TABELA HISTORICO_EXPOSICAO (Phase 6)
CREATE TABLE IF NOT EXISTS public.historico_exposicao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    data_snapshot DATE NOT NULL DEFAULT CURRENT_DATE,
    exposicao_total INTEGER NOT NULL DEFAULT 0,
    dados_setores JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_empresa_dia_snapshot UNIQUE (empresa_id, data_snapshot)
);

ALTER TABLE public.historico_exposicao ENABLE ROW LEVEL SECURITY;

-- CORREÇÃO CRÍTICA DAS POLICIES DO HISTORICO (USAR USUARIOS_EMPRESAS)
-- Policies antigas referenciavam 'user_id' na tabela empresas (inexistente)
DROP POLICY IF EXISTS "Empresas podem ver seu próprio histórico de exposição" ON public.historico_exposicao;
DROP POLICY IF EXISTS "Empresas podem inserir snapshots de exposição" ON public.historico_exposicao;

CREATE POLICY "Ver historico exposição" 
ON public.historico_exposicao FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios_empresas ue 
        WHERE ue.empresa_id = historico_exposicao.empresa_id 
        AND ue.usuario_id = auth.uid()
    )
);

CREATE POLICY "Inserir historico exposição" 
ON public.historico_exposicao FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.usuarios_empresas ue 
        WHERE ue.empresa_id = historico_exposicao.empresa_id 
        AND ue.usuario_id = auth.uid()
        AND ue.perfil IN ('admin', 'gestor')
    )
);

-- Comentários f finais
COMMENT ON TABLE public.empresas IS 'Tabela de empresas com CNAE materializado (Phase 8A)';
COMMENT ON TABLE public.riscos IS 'Inventário de riscos restaurado (Phase 8A)';
COMMENT ON TABLE public.historico_exposicao IS 'Histórico de exposição com RLS corrigida (Phase 8A)';
