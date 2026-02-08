-- =============================================================================
-- Phase 7B - Formalização e Custódia de Conteúdo
-- Complemento à tabela de relatórios técnicos para garantir a imutabilidade
-- do conteúdo Markdown original (Fonte única de verdade).
-- =============================================================================

ALTER TABLE public.relatorios_tecnicos 
ADD COLUMN IF NOT EXISTS conteudo_markdown TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.relatorios_tecnicos.conteudo_markdown IS 'Conteúdo Markdown canônico selado pelo hash de integridade.';
