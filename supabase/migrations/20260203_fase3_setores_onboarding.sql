-- =============================================================================
-- FASE 3: ESTRUTURA ORGANIZACIONAL (SETORES) E ONBOARDING REATIVO
-- =============================================================================

-- 1. Criar a tabela de setores
CREATE TABLE IF NOT EXISTS public.setores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, nome)
);

-- 2. Adicionar trigger para updated_at
CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON public.setores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Habilitar RLS e configurar políticas
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem setores da própria empresa" ON public.setores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = setores.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Gestores gerenciam setores da empresa" ON public.setores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = setores.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );

-- 4. Ajustar tabela de funcionários
-- Adicionar setor_id vinculando à nova tabela
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS setor_id UUID REFERENCES public.setores(id) ON DELETE SET NULL;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_setores_empresa ON public.setores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_setor ON public.funcionarios(setor_id);

-- 6. Comentários para documentação (NR-1)
COMMENT ON TABLE public.setores IS 'Setores da empresa para fins de PGR/GRO conforme NR-1';
COMMENT ON COLUMN public.setores.nome IS 'Nome do setor (ex: Operacional, Administrativo)';
COMMENT ON COLUMN public.funcionarios.setor_id IS 'Vínculo estrutural do funcionário com um setor real da empresa';

-- NOTA: O campo 'departamento' em funcionarios será mantido temporariamente
-- para evitar perda de dados e permitir migração gradual via interface.
