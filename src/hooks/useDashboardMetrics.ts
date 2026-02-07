/**
 * Hook para buscar métricas reais do Dashboard
 * Substitui dados mock por queries ao Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { evaluateRegulatoryState, type RegulatoryEngineResult } from '@/domains/risks/nr1.engine';
import { runTechnicalAgent } from '../../core/agents/technicalAgent';
import type { Metrics, Alerta, Exame, Treinamento, OnboardingStatus, Setor, Risco } from '@/context/DataContext';

// Dados de fallback caso não haja empresa selecionada ou erro
const fallbackMetrics: Metrics = {
    totalFuncionarios: 0,
    funcionariosAtivos: 0,
    alertasPendentes: 0,
    alertasCriticos: 0,
    examesVencidos: 0,
    examesAVencer: 0,
    treinamentosVencidos: 0
};

const defaultOnboarding: OnboardingStatus = {
    empresaCriada: false,
    setorCadastrado: false,
    funcionarioCadastrado: false,
    completouOnboarding: false
};

interface UseDashboardMetricsResult {
    metrics: Metrics;
    alertas: Alerta[];
    exames: Exame[];
    treinamentos: Treinamento[];
    funcionarios: any[];
    setores: Setor[];
    riscos: Risco[];
    onboarding: OnboardingStatus;
    regulatoryState: RegulatoryEngineResult | null;
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
    const [setores, setSetores] = useState<Setor[]>([]);
    const [riscos, setRiscos] = useState<Risco[]>([]);
    const [onboarding, setOnboarding] = useState<OnboardingStatus>(defaultOnboarding);
    const [regulatoryState, setRegulatoryState] = useState<RegulatoryEngineResult | null>(null);
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

        // Buscar status de verificação atualizado diretamente do banco
        let isVerificada = false;
        try {
            const { data: vData } = await supabase
                .from('empresas')
                .select('b_verificada')
                .eq('id', empresaId)
                .single() as any;
            isVerificada = !!vData?.b_verificada;
        } catch (e) {
            console.error('[useDashboardMetrics] Erro ao buscar status de verificação:', e);
        }

        try {
            // Data atual e daqui a 30 dias para cálculos
            const hoje = new Date().toISOString().split('T')[0];
            const trintaDias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // 1. BUSCAR FUNCIONÁRIOS
            const { data: funcionariosData, error: funcError } = await supabase
                .from('funcionarios')
                .select('id, nome_completo, status, matricula, setor_id, cargo')
                .eq('empresa_id', empresaId);

            if (funcError) throw funcError;

            const totalFuncionarios = (funcionariosData as any[] || []).length;
            const funcionariosAtivos = (funcionariosData as any[] || []).filter(f => f.status === 'ativo').length || 0;

            // 2. BUSCAR EXAMES (ASOs)
            const { data: asosData, error: asoError } = await supabase
                .from('asos')
                .select('id, funcionario_id, tipo_aso, data_validade, status')
                .eq('empresa_id', empresaId) as { data: any[] | null, error: any };

            if (asoError) throw asoError;

            const examesVencidos = asosData?.filter(a =>
                a.data_validade && a.data_validade < hoje
            ).length || 0;

            const examesAVencer = asosData?.filter(a =>
                a.data_validade &&
                a.data_validade >= hoje &&
                a.data_validade <= trintaDias
            ).length || 0;

            const examesFormatados: Exame[] = (asosData || []).map(aso => ({
                id: aso.id,
                funcionarioId: aso.funcionario_id,
                tipo: aso.tipo_aso,
                status: aso.data_validade && aso.data_validade < hoje
                    ? 'vencido'
                    : (aso.status === 'aprovado' ? 'realizado' : 'pendente'),
                dataRealizacao: aso.data_validade || '',
                dataVencimento: aso.data_validade || ''
            }));

            // 3. BUSCAR NOTIFICAÇÕES (Alertas)
            const { data: notificacoesData, error: notifError } = await supabase
                .from('notificacoes')
                .select('id, titulo, mensagem, tipo, lida, created_at')
                .eq('usuario_id', user?.id || '')
                .eq('lida', false)
                .order('created_at', { ascending: false })
                .limit(10) as { data: any[] | null, error: any };

            if (notifError) throw notifError;

            const alertasFormatados: Alerta[] = (notificacoesData || []).map(n => ({
                id: n.id,
                titulo: n.titulo,
                descricao: n.mensagem,
                prioridade: mapTipoPrioridade(n.tipo),
                status: 'pendente',
                dataCriacao: n.created_at
            }));

            const alertasCriticos = alertasFormatados.filter(a =>
                a.prioridade === 'critica' || a.prioridade === 'alta'
            ).length;

            // 4. BUSCAR SETORES E RISCOS
            const { data: setoresData, error: setoresError } = await supabase
                .from('setores')
                .select('*')
                .eq('empresa_id', empresaId) as { data: any[] | null, error: any };

            if (setoresError) throw setoresError;

            let riscosData: any[] = [];
            try {
                const { data: rData, error: rError } = await supabase
                    .from('riscos')
                    .select('*')
                    .eq('empresa_id', empresaId);
                if (!rError) riscosData = rData || [];
            } catch (e) {
                console.warn('[useDashboardMetrics] Erro ao buscar riscos:', e);
            }

            const setoresFormatados: Setor[] = (setoresData || []).map(s => ({
                id: s.id,
                nome: s.nome,
                descricao: s.descricao,
                created_at: s.created_at
            }));

            const riscosFormatados: Risco[] = (riscosData || []).map(r => ({
                id: r.id,
                setor_id: r.setor_id,
                categoria: r.categoria,
                nome: r.nome,
                descricao: r.descricao,
                severidade: r.severidade,
                probabilidade: r.probabilidade,
                medidas_controle: r.medidas_controle,
                status: r.status
            }));

            // -----------------------------------------------------------------
            // 4.1. AGENTE TÉCNICO (AGREGAÇÃO MECÂNICA E AVALIAÇÃO V2)
            // -----------------------------------------------------------------
            const workersPerSector = new Map<string, number>();
            const workersPerRole = new Map<string, number>();

            (funcionariosData as any[] || []).forEach(f => {
                if (f.status === 'ativo') {
                    if (f.setor_id) {
                        workersPerSector.set(f.setor_id, (workersPerSector.get(f.setor_id) || 0) + 1);
                    }
                    if (f.cargo) {
                        workersPerRole.set(f.cargo, (workersPerRole.get(f.cargo) || 0) + 1);
                    }
                }
            });

            const technicalResult = await runTechnicalAgent(riscosFormatados, workersPerSector, workersPerRole);
            const totalAlertasCriticos = alertasCriticos + technicalResult.riscosCriticosCount;

            // -----------------------------------------------------------------
            // 5. MOTOR REGULATÓRIO (ÚNICA FONTE DE VERDADE)
            // -----------------------------------------------------------------
            const setoresComRisco = new Set(riscosFormatados.map(r => r.setor_id));
            const setoresSemRisco = setoresFormatados.filter(s => !setoresComRisco.has(s.id)).length;

            const engineResult = evaluateRegulatoryState({
                empresaVerificada: isVerificada,
                totalSetores: setoresFormatados.length,
                totalFuncionarios,
                setoresSemRisco,
                totalRiscos: riscosFormatados.length,
                pgrAtivo: false, // TODO: Integrar documentos PGR
                pgrVencido: false,
                examesVencidos,
                alertasCriticos: totalAlertasCriticos,
                medidasPendentes: 0
            });

            setRegulatoryState(engineResult);

            // -----------------------------------------------------------------
            // 6. MAPEAR RESULTADOS PARA COMPATIBILIDADE DA UI
            // -----------------------------------------------------------------
            setMetrics({
                totalFuncionarios,
                funcionariosAtivos,
                alertasPendentes: alertasFormatados.length,
                alertasCriticos: totalAlertasCriticos,
                examesVencidos,
                examesAVencer,
                treinamentosVencidos: 0
            });

            setOnboarding({
                empresaCriada: isVerificada,
                setorCadastrado: setoresFormatados.length > 0,
                funcionarioCadastrado: totalFuncionarios > 0,
                completouOnboarding: engineResult.progress >= 50 && !technicalResult.isCritico
            });

            setAlertas(alertasFormatados);
            setExames(examesFormatados);
            setTreinamentos([]);
            setSetores(setoresFormatados);
            setRiscos(riscosFormatados);
            setFuncionarios((funcionariosData as any[])?.map(f => ({
                id: f.id,
                nome_completo: f.nome_completo,
                matricula: f.matricula,
                status: f.status,
                setor_id: f.setor_id
            })) || []);

        } catch (err) {
            console.error('[useDashboardMetrics] Erro ao buscar métricas:', err);
            setError(err instanceof Error ? err : new Error('Erro ao buscar dados'));
        } finally {
            setIsLoading(false);
        }
    }, [empresaSelecionada, user?.id]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return {
        metrics,
        alertas,
        exames,
        treinamentos,
        funcionarios,
        setores,
        riscos,
        onboarding,
        regulatoryState,
        isLoading,
        error,
        refetch: fetchMetrics
    };
}

function mapTipoPrioridade(tipo: string): 'baixa' | 'media' | 'alta' | 'critica' {
    switch (tipo) {
        case 'error': return 'critica';
        case 'warning': return 'alta';
        case 'success': return 'media';
        default: return 'baixa';
    }
}
