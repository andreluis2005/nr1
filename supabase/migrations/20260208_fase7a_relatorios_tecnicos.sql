-- =============================================================================
-- Phase 7A - Relatórios Técnicos NR-1 Imutáveis
-- Armazenamento de metadados de integridade e custódia
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.relatorios_tecnicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    snapshot_id UUID NOT NULL REFERENCES public.historico_exposicao(id) ON DELETE CASCADE,
    
    -- Metadados de Integridade
    hash_integridade TEXT NOT NULL,
    versao_engine TEXT NOT NULL DEFAULT 'v1',
    versao_template TEXT NOT NULL DEFAULT 'v2',
    
    -- Período de Referência (extraído do snapshot)
    data_referencia DATE NOT NULL,
    
    -- Metadados de Geração
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices para Auditoria
CREATE INDEX IF NOT EXISTS idx_relatorios_empresa ON public.relatorios_tecnicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_snapshot ON public.relatorios_tecnicos(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_hash ON public.relatorios_tecnicos(hash_integridade);

-- RLS
ALTER TABLE public.relatorios_tecnicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem relatórios de suas empresas" ON public.relatorios_tecnicos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = relatorios_tecnicos.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

COMMENT ON TABLE public.relatorios_tecnicos IS 'Registro de evidências técnicas imutáveis (NR-1)';
