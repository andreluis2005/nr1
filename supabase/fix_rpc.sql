-- =============================================================================
-- CORREÇÃO: Criar Empresa e Vínculo (Versão Idempotente)
-- Resolve o erro 409 Conflict quando o CNPJ já existe
-- =============================================================================
CREATE OR REPLACE FUNCTION public.criar_empresa_rpc(
    p_nome_fantasia TEXT,
    p_cnpj TEXT DEFAULT NULL,
    p_empresa_pai_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_empresa_id UUID;
BEGIN
    -- 1. Verificar se a empresa já existe pelo CNPJ
    IF p_cnpj IS NOT NULL THEN
        SELECT id INTO v_empresa_id FROM public.empresas WHERE cnpj = p_cnpj LIMIT 1;
    END IF;

    -- 2. Se não existir, criar a nova empresa
    IF v_empresa_id IS NULL THEN
        INSERT INTO public.empresas (nome_fantasia, cnpj, empresa_pai_id, created_by)
        VALUES (p_nome_fantasia, p_cnpj, p_empresa_pai_id, auth.uid())
        RETURNING id INTO v_empresa_id;
    END IF;

    -- 3. Vincular o usuário como Admin (Se ainda não estiver vinculado)
    INSERT INTO public.usuarios_empresas (usuario_id, empresa_id, perfil, is_principal)
    VALUES (auth.uid(), v_empresa_id, 'admin', TRUE)
    ON CONFLICT (usuario_id, empresa_id) 
    DO UPDATE SET is_principal = TRUE;

    RETURN v_empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
