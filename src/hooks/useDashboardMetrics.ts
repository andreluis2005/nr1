/**
 * Hook para buscar métricas reais do Dashboard
 * Substitui dados mock por queries ao Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { evaluateRegulatoryState, type RegulatoryEngineResult } from '@/domains/risks/nr1.engine';
import { runTechnicalAgent } from '@/core/agents/technicalAgent';
import type { Metrics, Alerta, Exame, Treinamento, OnboardingStatus, Setor, Risco, MedidaControle } from '@/types';

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
    medidasControle: MedidaControle[];
    onboarding: OnboardingStatus;
    regulatoryState: RegulatoryEngineResult | null;
    exposureData: any;
    exposureHistory: any[];
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
    const [medidasControle, setMedidasControle] = useState<MedidaControle[]>([]);
    const [onboarding, setOnboarding] = useState<OnboardingStatus>(defaultOnboarding);
    const [regulatoryState, setRegulatoryState] = useState<RegulatoryEngineResult | null>(null);
    const [exposureData, setExposureData] = useState<any>(null);
    const [exposureHistory, setExposureHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMetrics = useCallback(async () => {
        if (!empresaSelecionada?.empresa_id) {
            setMetrics(fallbackMetrics);
            setOnboarding(defaultOnboarding);
            setRegulatoryState(null);
            setIsLoading(false);
            return;
        }

        const empresaId = empresaSelecionada.empresa_id;
        setIsLoading(true);
        setError(null);

        // Buscar status de verificação atualizado diretamente do banco
        // Fallback para o que já temos no contexto caso a coluna b_verificada ainda não exista
        let isVerificada = !!empresaSelecionada?.empresa?.b_verificada;
        try {
            const { data: vData, error: vError } = await supabase
                .from('empresas')
                .select('b_verificada')
                .eq('id', empresaId)
                .single() as any;

            if (!vError && vData) {
                isVerificada = !!vData.b_verificada;
            }
        } catch (e) {
            console.warn('[useDashboardMetrics] Erro ao buscar status de verificação (usando fallback do contexto):', e);
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
            let examesFormatados: Exame[] = [];
            let examesVencidos = 0;
            let examesAVencer = 0;
            try {
                const { data: asosData, error: asoError } = await supabase
                    .from('asos')
                    .select('id, funcionario_id, tipo_aso, data_validade, status')
                    .eq('empresa_id', empresaId) as { data: any[] | null, error: any };

                if (!asoError && asosData) {
                    examesVencidos = asosData.filter(a =>
                        a.data_validade && a.data_validade < hoje
                    ).length || 0;

                    examesAVencer = asosData.filter(a =>
                        a.data_validade &&
                        a.data_validade >= hoje &&
                        a.data_validade <= trintaDias
                    ).length || 0;

                    examesFormatados = asosData.map(aso => ({
                        id: aso.id,
                        funcionarioId: aso.funcionario_id,
                        tipo: aso.tipo_aso,
                        status: aso.data_validade && aso.data_validade < hoje
                            ? 'vencido'
                            : (aso.status === 'aprovado' ? 'realizado' : 'pendente'),
                        dataRealizacao: aso.data_validade || '',
                        dataVencimento: aso.data_validade || ''
                    }));
                }
            } catch (e) {
                console.warn('[useDashboardMetrics] Erro ao buscar ASOS:', e);
            }

            // 3. BUSCAR NOTIFICAÇÕES (Alertas)
            let alertasFormatados: Alerta[] = [];
            let alertasCriticos = 0;
            try {
                const { data: notificacoesData, error: notifError } = await supabase
                    .from('notificacoes')
                    .select('id, titulo, mensagem, tipo, lida, created_at')
                    .eq('usuario_id', user?.id || '')
                    .eq('lida', false)
                    .order('created_at', { ascending: false })
                    .limit(10) as { data: any[] | null, error: any };

                if (!notifError && notificacoesData) {
                    alertasFormatados = notificacoesData.map(n => ({
                        id: n.id,
                        titulo: n.titulo,
                        descricao: n.mensagem,
                        prioridade: mapTipoPrioridade(n.tipo),
                        status: 'pendente',
                        dataCriacao: n.created_at
                    }));

                    alertasCriticos = alertasFormatados.filter(a =>
                        a.prioridade === 'critica' || a.prioridade === 'alta'
                    ).length;
                }
            } catch (e) {
                console.warn('[useDashboardMetrics] Erro ao buscar notificações:', e);
            }

            // 4. BUSCAR SETORES E RISCOS
            let setoresFormatados: Setor[] = [];
            try {
                const { data: setoresData, error: setoresError } = await supabase
                    .from('setores')
                    .select('*')
                    .eq('empresa_id', empresaId) as { data: any[] | null, error: any };

                if (!setoresError && setoresData) {
                    setoresFormatados = setoresData.map(s => ({
                        id: s.id,
                        nome: s.nome,
                        descricao: s.descricao,
                        created_at: s.created_at
                    }));
                }
            } catch (e) {
                console.warn('[useDashboardMetrics] Erro ao buscar setores:', e);
            }

            let riscosData: any[] = [];
            let medidasData: any[] = [];

            try {
                // Fetch risks
                const { data: rData, error: rError } = await supabase
                    .from('riscos')
                    .select('*')
                    .eq('empresa_id', empresaId);
                if (!rError) riscosData = rData || [];

                // Fetch measures (AVOID JOIN COLLISION with legacy column)
                const { data: mData, error: mError } = await supabase
                    .from('medidas_controle')
                    .select('*')
                    .eq('empresa_id', empresaId);
                if (!mError) medidasData = mData || [];

            } catch (e) {
                console.warn('[useDashboardMetrics] Erro ao buscar riscos/medidas:', e);
            }

            // Map measures directly
            const allMedidas: MedidaControle[] = medidasData.map((m: any) => ({
                id: m.id,
                riscoId: m.risco_id,
                empresaId: m.empresa_id,
                tipo: m.tipo,
                descricao: m.descricao,
                dataPrevista: m.data_prevista,
                dataConclusao: m.data_conclusao,
                responsavel: m.responsavel,
                status: m.status,
                eficaz: m.eficaz
            }));

            const riscosFormatados: Risco[] = (riscosData || []).map(r => {
                return {
                    id: r.id,
                    tipo: (r.tipo_risco || r.categoria || 'acidente') as any,
                    agente: r.agente || r.nome,
                    descricao: r.descricao,
                    // UI & DB Fields
                    nome: r.nome,
                    categoria: r.categoria,
                    severidade: r.severidade,
                    probabilidade: r.probabilidade,
                    setor_id: r.setor_id,

                    setores: [],
                    funcoes: [],
                    medidasPreventivas: [],
                    grauRisco: r.severidade >= 4 ? 'critico' : r.severidade === 3 ? 'grave' : r.severidade === 2 ? 'moderado' : 'leve',
                    medidas_controle: r.medidas_controle // Legacy text field
                };
            });

            // -----------------------------------------------------------------
            // 4.1. AGENTE TÉCNICO
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

            // ADAPTER: Risco -> TechnicalRisk (Strict Type Guard)
            const technicalRisks = riscosFormatados
                .filter(r => r.setor_id) // Required by technical agent
                .map(r => ({
                    id: r.id,
                    setor_id: r.setor_id as string,
                    nome: r.nome ?? 'Risco não identificado',
                    severidade: r.severidade ?? 1,
                    probabilidade: r.probabilidade ?? 1,
                    categoria: r.categoria ?? 'nao_classificado'
                }));

            const technicalResult = await runTechnicalAgent(technicalRisks, workersPerSector, workersPerRole);
            setExposureData(technicalResult);

            // -----------------------------------------------------------------
            // 4.1.1. SNAPSHOT
            // -----------------------------------------------------------------
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data: existingSnapshot } = await (supabase
                    .from('historico_exposicao' as any) as any)
                    .select('id')
                    .eq('empresa_id', empresaId)
                    .eq('data_snapshot', today)
                    .single();

                if (!existingSnapshot) {
                    await (supabase
                        .from('historico_exposicao' as any) as any)
                        .insert({
                            empresa_id: empresaId,
                            data_snapshot: today,
                            exposicao_total: technicalResult.exposicaoTotal,
                            dados_setores: technicalResult.exposicaoPorSetor
                        });
                }
            } catch (snapshotErr) {
                console.warn('[useDashboardMetrics] Erro ao salvar snapshot de exposição:', snapshotErr);
            }

            // -----------------------------------------------------------------
            // 4.1.2. HISTÓRICO
            // -----------------------------------------------------------------
            try {
                const { data: historyData } = await (supabase
                    .from('historico_exposicao' as any) as any)
                    .select('*')
                    .eq('empresa_id', empresaId)
                    .order('data_snapshot', { ascending: true })
                    .limit(180);
                setExposureHistory(historyData || []);
            } catch (historyErr) {
                console.warn('[useDashboardMetrics] Erro ao buscar histórico de exposição:', historyErr);
            }

            const totalAlertasCriticos = alertasCriticos + technicalResult.riscosCriticosCount;

            // -----------------------------------------------------------------
            // 5. MOTOR REGULATÓRIO
            // -----------------------------------------------------------------
            const setoresComRisco = new Set(riscosFormatados.map(r => r.setor_id));
            const setoresSemRisco = setoresFormatados.filter(s => !setoresComRisco.has(s.id)).length;

            const engineResult = evaluateRegulatoryState({
                empresaVerificada: isVerificada,
                totalSetores: setoresFormatados.length,
                totalFuncionarios,
                setoresSemRisco,
                totalRiscos: riscosFormatados.length,
                pgrAtivo: false,
                pgrVencido: false,
                examesVencidos,
                alertasCriticos: totalAlertasCriticos,
                medidasPendentes: 0
            });

            setRegulatoryState(engineResult);

            // -----------------------------------------------------------------
            // 6. MAPEAR RESULTADOS
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
                completouOnboarding: engineResult.state !== 'ESTRUTURA_INCOMPLETA' && !technicalResult.isCritico
            });

            setAlertas(alertasFormatados);
            setExames(examesFormatados);
            setTreinamentos([]);
            setSetores(setoresFormatados);
            setRiscos(riscosFormatados);
            setMedidasControle(allMedidas);
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
        medidasControle,
        onboarding,
        regulatoryState,
        exposureData,
        exposureHistory,
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
