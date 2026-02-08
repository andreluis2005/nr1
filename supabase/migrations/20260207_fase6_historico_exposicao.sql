-- Migration Phase 6: Histórico de Exposição ao Risco (Auditável)
-- -----------------------------------------------------------------------------
-- Tabela para snapshots imutáveis da exposição técnica calculada pelo Agente v2.
-- Segue o Contrato Ouro: Evidência analítica atemporal, isolada do Motor NR-1.

CREATE TABLE IF NOT EXISTS public.historico_exposicao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    data_snapshot DATE NOT NULL DEFAULT CURRENT_DATE,
    exposicao_total INTEGER NOT NULL DEFAULT 0,
    dados_setores JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Regra de Ouro Phase 6: Apenas um snapshot por dia por empresa (Imutabilidade Estrutural)
    CONSTRAINT unique_empresa_dia_snapshot UNIQUE (empresa_id, data_snapshot)
);

-- RLS (Row Level Security) - Apenas leitura e inserção permitidas (Sem UPDATE)
ALTER TABLE public.historico_exposicao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas podem ver seu próprio histórico de exposição" 
ON public.historico_exposicao FOR SELECT 
USING (auth.uid() IN (
    SELECT user_id FROM public.empresas WHERE id = historico_exposicao.empresa_id
));

CREATE POLICY "Empresas podem inserir snapshots de exposição" 
ON public.historico_exposicao FOR INSERT 
WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.empresas WHERE id = historico_exposicao.empresa_id
));

-- Nota: Não criamos política de UPDATE para reforçar imutabilidade técnica.
-- -----------------------------------------------------------------------------
