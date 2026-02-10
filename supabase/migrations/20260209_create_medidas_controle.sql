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

CREATE POLICY "Enable read access for users in same company" ON medidas_controle
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'empresa_id' = empresa_id::text
    ));

CREATE POLICY "Enable write access for users in same company" ON medidas_controle
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'empresa_id' = empresa_id::text
    ));
