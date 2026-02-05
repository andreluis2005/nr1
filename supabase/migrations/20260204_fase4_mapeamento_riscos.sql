-- =============================================================================
-- NR1 PRO - MIGRATION: FASE 4 - MAPEAMENTO DE RISCOS
-- =============================================================================

-- 1. Criar a tabela de riscos
CREATE TABLE IF NOT EXISTS public.riscos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    setor_id UUID NOT NULL REFERENCES public.setores(id) ON DELETE CASCADE,
    
    -- Dados do Risco
    categoria TEXT NOT NULL CHECK (categoria IN ('fisico', 'quimico', 'biologico', 'ergonomico', 'acidente')),
    nome TEXT NOT NULL,
    descricao TEXT,
    
    -- Avaliação de Risco (Matriz NR-1)
    severidade INTEGER DEFAULT 1 CHECK (severidade >= 1 AND severidade <= 5),
    probabilidade INTEGER DEFAULT 1 CHECK (probabilidade >= 1 AND probabilidade <= 5),
    
    -- Medidas de Controle
    medidas_controle TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'controlado', 'eliminado', 'inativo')),
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Habilitar RLS
ALTER TABLE public.riscos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança (RLS)
CREATE POLICY "Usuários veem riscos da empresa" ON public.riscos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = riscos.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Gestores gerenciam riscos" ON public.riscos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = riscos.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );

-- 4. Trigger para updated_at
CREATE TRIGGER update_riscos_updated_at BEFORE UPDATE ON public.riscos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_riscos_empresa ON public.riscos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_riscos_setor ON public.riscos(setor_id);
CREATE INDEX IF NOT EXISTS idx_riscos_categoria ON public.riscos(categoria);

-- 6. Comentários
COMMENT ON TABLE public.riscos IS 'Inventário de riscos ocupacionais por setor (NR-1)';
COMMENT ON COLUMN public.riscos.categoria IS 'Categoria do risco: fisico, quimico, biologico, ergonomico, acidente';
COMMENT ON COLUMN public.riscos.severidade IS 'Impacto do risco (1 a 5)';
COMMENT ON COLUMN public.riscos.probabilidade IS 'Chance de ocorrência (1 a 5)';
