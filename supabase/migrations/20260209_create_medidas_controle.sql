-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table for structured Action Plan (Medidas de Controle)
CREATE TABLE IF NOT EXISTS medidas_controle (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    risco_id UUID NOT NULL REFERENCES riscos(id) ON DELETE CASCADE,
    
    -- Core Normative Fields
    tipo TEXT NOT NULL CHECK (tipo IN ('eliminacao', 'substituicao', 'engenharia', 'administrativa', 'epi', 'nao_classificado')),
    descricao TEXT NOT NULL,
    
    -- Management (5W2H)
    data_prevista DATE,
    data_conclusao DATE,
    responsavel TEXT, -- Text for flexibility as per Phase 9 approval
    status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'atrasado')),
    eficaz BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE medidas_controle ENABLE ROW LEVEL SECURITY;

-- Policy: Users view action plans for their company
CREATE POLICY "Usuários veem medidas da empresa" ON medidas_controle
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = medidas_controle.empresa_id
            AND ue.usuario_id = auth.uid()
        )
    );

-- Policy: Managers manage action plans (insert/update/delete)
CREATE POLICY "Gestores gerenciam medidas" ON medidas_controle
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = medidas_controle.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresas ue
            WHERE ue.empresa_id = medidas_controle.empresa_id
            AND ue.usuario_id = auth.uid()
            AND ue.perfil IN ('admin', 'gestor')
        )
    );
