/**
 * Hook para buscar métricas reais do Dashboard
 * Substitui dados mock por queries ao Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import type { Metrics, Alerta, Exame, Treinamento, OnboardingStatus } from '@/context/DataContext';

// Dados de fallback caso não haja empresa selecionada ou erro
const fallbackMetrics: Metrics = {
    totalFuncionarios: 0,
    funcionariosAtivos: 0,
    indiceConformidade: 0,
    alertasPendentes: 0,
    alertasCriticos: 0,
    examesVencidos: 0,
    examesAVencer: 0,
    treinamentosVencidos: 0,
    pgrStatus: 'atencao'
};

const defaultOnboarding: OnboardingStatus = {
    empresaCriada: false,
    setorCadastrado: false,
    funcionarioCadastrado: false,
    vinculoSetorEfetivado: false,
    treinamentosPlanejados: false,
    inventarioGerado: false,
    completouOnboarding: false
};

interface UseDashboardMetricsResult {
    metrics: Metrics;
    alertas: Alerta[];
    exames: Exame[];
    treinamentos: Treinamento[];
    funcionarios: any[];
    onboarding: OnboardingStatus;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useDashboardMetrics(): UseDashboardMetricsResult {
    const { empresaSelecionada, user } = useSupabaseAuth();

    const [metrics, setMetrics] = useState<Metrics>(fallbackMetrics);
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [exames, setExames] = useState<Exame[]>([]);
    const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [onboarding, setOnboarding] = useState<OnboardingStatus>(defaultOnboarding);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMetrics = useCallback(async () => {
        if (!empresaSelecionada?.empresa_id) {
            setIsLoading(false);
            return;
        }

        const empresaId = empresaSelecionada.empresa_id;
        setIsLoading(true);
        setError(null);

        try {
            // Data atual e daqui a 30 dias para cálculos
            const hoje = new Date().toISOString().split('T')[0];
            const trintaDias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // -----------------------------------------------------------------
            // 1. FUNCIONÁRIOS
            // -----------------------------------------------------------------
            const { data: funcionariosData, error: funcError } = await supabase
                .from('funcionarios')
                .select('id, nome_completo, status, matricula')
                .eq('empresa_id', empresaId);

            if (funcError) throw funcError;

            const totalFuncionarios = (funcionariosData as any[] || []).length;
            const funcionariosAtivos = (funcionariosData as any[] || []).filter(f => f.status === 'ativo').length || 0;

            // -----------------------------------------------------------------
            // 2. ASOs (Exames Ocupacionais)
            // -----------------------------------------------------------------
            const { data: asosData, error: asoError } = await supabase
                .from('asos')
                .select('id, funcionario_id, tipo_aso, data_validade, status')
                .eq('empresa_id', empresaId) as { data: any[] | null, error: any };

            if (asoError) throw asoError;

            // Exames vencidos (data_validade < hoje)
            const examesVencidos = asosData?.filter(a =>
                a.data_validade && a.data_validade < hoje
            ).length || 0;

            // Exames a vencer nos próximos 30 dias
            const examesAVencer = asosData?.filter(a =>
                a.data_validade &&
                a.data_validade >= hoje &&
                a.data_validade <= trintaDias
            ).length || 0;

            // Converter para formato esperado pela UI
            const examesFormatados: Exame[] = (asosData || []).map(aso => ({
                id: aso.id,
                funcionarioId: aso.funcionario_id,
                tipo: aso.tipo_aso,
                status: aso.data_validade && aso.data_validade < hoje
                    ? 'vencido'
                    : (aso.status === 'aprovado' ? 'realizado' : 'pendente'),
                dataRealizacao: aso.data_validade || '', // Temporário: usar validade como realização se vácuo
                dataVencimento: aso.data_validade || ''
            }));

            // -----------------------------------------------------------------
            // 3. NOTIFICAÇÕES (como Alertas)
            // -----------------------------------------------------------------
            const { data: notificacoesData, error: notifError } = await supabase
                .from('notificacoes')
                .select('id, titulo, mensagem, tipo, lida, created_at')
                .eq('usuario_id', user?.id || '')
                .eq('lida', false)
                .order('created_at', { ascending: false })
                .limit(10) as { data: any[] | null, error: any };

            if (notifError) throw notifError;

            // Mapear notificações para formato de alerta
            const alertasFormatados: Alerta[] = (notificacoesData || []).map(n => ({
                id: n.id,
                titulo: n.titulo,
                descricao: n.mensagem,
                prioridade: mapTipoPrioridade(n.tipo),
                status: 'pendente',
                dataCriacao: n.created_at
            }));

            const alertasPendentes = alertasFormatados.length;
            const alertasCriticos = alertasFormatados.filter(a =>
                a.prioridade === 'critica' || a.prioridade === 'alta'
            ).length;

            // -----------------------------------------------------------------
            // 4. CÁLCULO DE CONFORMIDADE
            // -----------------------------------------------------------------
            // Fórmula: (1 - (problemas / total_itens)) * 100
            // Problemas = exames vencidos + alertas críticos
            // Total = funcionários ativos (mínimo 1 para evitar divisão por zero)
            const totalItens = Math.max(totalFuncionarios, 1);
            const problemas = examesVencidos + alertasCriticos;
            const indiceConformidade = Math.round(
                Math.max(0, Math.min(100, ((1 - (problemas / totalItens)) * 100)))
            );

            // -----------------------------------------------------------------
            // 5. STATUS DO PGR (simplificado - pode ser expandido)
            // -----------------------------------------------------------------
            let pgrStatus: 'atualizado' | 'atencao' | 'vencido' = 'atualizado';
            if (examesVencidos > 0 || alertasCriticos > 0) {
                pgrStatus = examesVencidos > 3 ? 'vencido' : 'atencao';
            }

            // -----------------------------------------------------------------
            // RESULTADO FINAL
            // -----------------------------------------------------------------
            setMetrics({
                totalFuncionarios,
                funcionariosAtivos,
                indiceConformidade,
                alertasPendentes,
                alertasCriticos,
                examesVencidos,
                examesAVencer,
                treinamentosVencidos: 0, // Tabela não existe ainda
                pgrStatus
            });

            setAlertas(alertasFormatados);
            setExames(examesFormatados);
            setTreinamentos([]);
            setFuncionarios((funcionariosData as any[])?.map(f => ({
                id: f.id,
                nome_completo: f.nome_completo,
                matricula: f.matricula,
                status: f.status,
                setor_id: f.setor_id
            })) || []);

            // -----------------------------------------------------------------
            // 6. STATUS DE ONBOARDING REATIVO (Fase 3)
            // -----------------------------------------------------------------
            // 6a. Verificar setores
            const { count: countSetores, error: errorSetores } = await supabase
                .from('setores')
                .select('*', { count: 'exact', head: true })
                .eq('empresa_id', empresaId);

            if (errorSetores) console.error('[Auth] Erro ao contar setores:', errorSetores);

            // 6b. Verificar se existe ao menos um funcionário com setor_id preenchido
            const hasVinculo = (funcionariosData as any[] || []).some(f => f.setor_id !== null);

            const onboardingStatus: OnboardingStatus = {
                empresaCriada: true, // Se chegou aqui, a empresa existe
                setorCadastrado: (countSetores || 0) > 0,
                funcionarioCadastrado: totalFuncionarios > 0,
                vinculoSetorEfetivado: hasVinculo,
                treinamentosPlanejados: false, // Implementar quando houver tabela
                inventarioGerado: false, // Implementar quando houver tabela
                completouOnboarding: (countSetores || 0) > 0 &&
                    totalFuncionarios > 0 &&
                    hasVinculo &&
                    false // Enquanto houver passos manuais pendentes
            };

            setOnboarding(onboardingStatus);

        } catch (err) {
            console.error('[useDashboardMetrics] Erro ao buscar métricas:', err);
            setError(err instanceof Error ? err : new Error('Erro ao buscar dados'));
        } finally {
            setIsLoading(false);
        }
    }, [empresaSelecionada?.empresa_id, user?.id]);

    // Buscar dados quando empresa mudar
    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return {
        metrics,
        alertas,
        exames,
        treinamentos,
        funcionarios,
        onboarding,
        isLoading,
        error,
        refetch: fetchMetrics
    };
}

// Helper para mapear tipo de notificação para prioridade
function mapTipoPrioridade(tipo: string): 'baixa' | 'media' | 'alta' | 'critica' {
    switch (tipo) {
        case 'error': return 'critica';
        case 'warning': return 'alta';
        case 'success': return 'media';
        default: return 'baixa';
    }
}
