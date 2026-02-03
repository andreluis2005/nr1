-- =============================================================================
-- MIGRATION: RPC Criar Empresa
-- Data: 2026-02-02
-- Objetivo: Permitir que usuários autenticados criem sua primeira empresa
-- ignorando as restrições de RLS padrão.
-- =============================================================================

-- Função segura (Security Definer) para criar empresa e vínculo
CREATE OR REPLACE FUNCTION public.criar_empresa_rpc(
    p_nome_fantasia TEXT,
    p_cnpj TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_empresa_id UUID;
    v_usuario_id UUID;
    v_result JSONB;
BEGIN
    -- Obter ID do usuário atual
    v_usuario_id := auth.uid();
    
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

    -- 1. Inserir Empresa
    -- IMPORTANTE: Plano 'trial' é o padrão inicial permitido pelo sistema
    INSERT INTO public.empresas (
        nome_fantasia, 
        razao_social, 
        cnpj, 
        status, 
        plano,
        created_by
    ) VALUES (
        p_nome_fantasia,
        p_nome_fantasia, -- Usa o mesmo nome para Razão Social inicialmente
        p_cnpj,
        'ativa',
        'trial', -- CORRIGIDO: de 'free' para 'trial'
        v_usuario_id
    ) RETURNING id INTO v_empresa_id;

    -- 2. Vincular Usuário como Admin
    INSERT INTO public.usuarios_empresas (
        usuario_id,
        empresa_id,
        perfil,
        is_principal
    ) VALUES (
        v_usuario_id,
        v_empresa_id,
        'admin',
        true
    );

    -- 3. Retornar dados da empresa criada
    SELECT jsonb_build_object(
        'id', id,
        'nome_fantasia', nome_fantasia,
        'cnpj', cnpj
    ) INTO v_result
    FROM public.empresas
    WHERE id = v_empresa_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissões
GRANT EXECUTE ON FUNCTION public.criar_empresa_rpc TO authenticated;
GRANT EXECUTE ON FUNCTION public.criar_empresa_rpc TO service_role;

-- Comentário
COMMENT ON FUNCTION public.criar_empresa_rpc IS 'Cria uma empresa e vincula o usuário atual como admin via RPC seguro';
