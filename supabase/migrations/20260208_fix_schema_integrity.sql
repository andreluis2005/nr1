-- =============================================================================
-- MIGRATION: Phase 8A - Structural Integrity Recovery
-- Data: 2026-02-08
-- Objetivo: Restaurar consistência de esquema e políticas de segurança (RLS)
-- Sem alterações funcionais ou evolutivas.
-- =============================================================================

-- 1. Adicionar coluna b_verificada à tabela empresas
-- Esta coluna é assumida pela lógica de onboarding mas estava ausente fisicamente.
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS b_verificada BOOLEAN NOT NULL DEFAULT false;

-- 2. Corrigir Políticas RLS para historico_exposicao
-- As políticas anteriores referenciavam 'user_id' na tabela empresas (inexistente).
-- Ajustado para validar o vínculo do usuário na tabela usuarios_empresas.

DROP POLICY IF EXISTS "Empresas podem ver seu próprio histórico de exposição" ON public.historico_exposicao;
DROP POLICY IF EXISTS "Empresas podem inserir snapshots de exposição" ON public.historico_exposicao;

CREATE POLICY "Usuários vinculados podem ver o histórico da empresa" 
ON public.historico_exposicao FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios_empresas ue
        WHERE ue.empresa_id = historico_exposicao.empresa_id
        AND ue.usuario_id = auth.uid()
    )
);

CREATE POLICY "Usuários vinculados podem inserir snapshots da empresa" 
ON public.historico_exposicao FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.usuarios_empresas ue
        WHERE ue.empresa_id = historico_exposicao.empresa_id
        AND ue.usuario_id = auth.uid()
        AND ue.perfil IN ('admin', 'gestor')
    )
);

-- 3. Comentários de Governança
COMMENT ON COLUMN public.empresas.b_verificada IS 'Rastreia se os dados da empresa foram validados pelo usuário no Onboarding.';
