import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Download,
  ChevronRight,
  Shield,
  Users,
  Activity,
  TrendingUp,
  Ban,
  Bookmark
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { StatusBadge } from '@/components/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { ActionPlanModal } from '@/components/pgr/ActionPlanModal';
import type { Risco } from '@/types';

export function PGR() {
  const { metrics, riscos, setores, medidasControle, regulatoryState, isLoading, refetch } = useData();
  const [showRiscos, setShowRiscos] = useState(false);
  const [showMedidas, setShowMedidas] = useState(false);

  // Action Plan Modal State
  const [selectedRisk, setSelectedRisk] = useState<Risco | null>(null);
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dados do PGR...</p>
        </div>
      </div>
    );
  }

  // Use measures from context, which are flat and clean
  const allStructuredMeasures = medidasControle || [];

  // Count legacy measures (risks with text but no structured measures yet? or just count all legacy text fields)
  const legacyMeasuresCount = riscos.filter(r => r.medidas_controle && r.medidas_controle.trim().length > 0).length;

  // Implementation Rate (Structured Only)
  const completedMeasures = allStructuredMeasures.filter(m => m.status === 'concluido').length;
  const implementationRate = allStructuredMeasures.length > 0
    ? Math.round((completedMeasures / allStructuredMeasures.length) * 100)
    : 0;

  const etapasPDCA = [
    { key: 'planejar', label: 'Planejar', icon: Circle, desc: 'Identificação e Planejamento' },
    { key: 'fazer', label: 'Fazer', icon: Circle, desc: 'Execução do Plano de Ação' },
    { key: 'checar', label: 'Checar', icon: Clock, desc: 'Monitoramento e Auditoria' },
    { key: 'agir', label: 'Agir', icon: Circle, desc: 'Correções e Melhorias' },
  ];

  // --- PDCA LOGIC (REFACTORED) ---
  const calculatePDCAState = (
    riscos: Risco[],
    medidas: any[] // Using clean measure type
  ): 'planejar' | 'fazer' | 'checar' | 'agir' => {

    // 1. PLANEJAR
    // Não existem riscos OU existem riscos mas nenhuma medida cadastrada
    if (riscos.length === 0) return 'planejar';
    if (medidas.length === 0) return 'planejar';

    // 2. FAZER
    // Existem medidas com status que indicam pendência
    const hasPendingMeasures = medidas.some(m =>
      ['planejado', 'em_andamento', 'atrasado'].includes(m.status)
    );
    if (hasPendingMeasures) return 'fazer';

    // 3. CHECAR
    // Todas as medidas estão concluídas, mas ainda não avaliadas como eficaz
    const allConcluded = medidas.every(m => m.status === 'concluido');
    const allEffective = medidas.every(m => m.eficaz === true);

    if (allConcluded && !allEffective) return 'checar';

    // 4. AGIR
    // Todas as medidas concluídas E todas marcadas como eficaz = true
    if (allConcluded && allEffective) return 'agir';

    // Fallback padrão
    return 'planejar';
  };

  const currentEtapa = calculatePDCAState(riscos, allStructuredMeasures);
  const getEtapaIndex = (etapa: string) => etapasPDCA.findIndex(e => e.key === etapa);
  const currentEtapaIndex = getEtapaIndex(currentEtapa);

  const riscosPorTipo = riscos.reduce((acc: Record<string, number>, risco) => {
    const tipo = risco.categoria || 'outros';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Chart Data: Measures by Type
  const medidasPorTipo = allStructuredMeasures.reduce((acc, m) => {
    acc[m.tipo] = (acc[m.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // PGR Ativo = Etapa Checar ou Agir (Ciclo Avançado)
  const pgrAtivo = currentEtapa === 'checar' || currentEtapa === 'agir';

  const handleOpenActionPlan = (risco: Risco) => {
    setSelectedRisk(risco);
    setIsActionPlanOpen(true);
    setShowRiscos(false);
  };

  const handleExportPDF = () => {
    if (!pgrAtivo) {
      toast.error("O PGR precisa estar consolidado para gerar o PDF.");
      return;
    }
    toast.info("Geração de PDF será implementada na próxima fase.");
  };

  return (
    <div className="p-6 space-y-6">
      <ActionPlanModal
        isOpen={isActionPlanOpen}
        onClose={() => setIsActionPlanOpen(false)}
        risco={selectedRisk}
        onUpdate={refetch}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            PGR - Programa de Gerenciamento de Riscos
          </h1>
          <p className="text-gray-500 mt-1">
            Gestão completa da NR-1 conforme GRO e PGR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={!pgrAtivo}
            className="flex items-center gap-2"
            title={!pgrAtivo ? "Complete o PGR para exportar" : "Exportar documento oficial"}
          >
            {pgrAtivo ? <Download className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold">PGR {pgrAtivo ? 'Ativo' : 'Em Elaboração'}</h2>
                <StatusBadge
                  status={pgrAtivo ? 'atualizado' : 'atencao'}
                  size="md"
                />
              </div>
              <p className="text-blue-100 text-sm">
                Status Regulatório: {regulatoryState?.label || 'Analisando...'}
              </p>
            </div>
          </div>

          <div className="flex gap-8 text-right bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Ações Pendentes</p>
              <p className="font-semibold text-xl">{allStructuredMeasures.filter(m => m.status !== 'concluido').length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Validade</p>
              <p className="font-semibold text-xl">{pgrAtivo ? '24 meses' : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ciclo PDCA */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          Ciclo PDCA - Gestão Contínua
        </h2>
        <div className="relative px-4">
          <div className="flex items-center justify-between">
            {etapasPDCA.map((etapa, index) => {
              const isActive = index <= currentEtapaIndex;
              const isCurrent = index === currentEtapaIndex;

              return (
                <div key={etapa.key} className="flex items-center flex-1 last:flex-none last:w-auto md:last:flex-1">
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                      : isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                      {isActive && !isCurrent ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <etapa.icon className="w-7 h-7" />
                      )}
                    </div>
                    <p className={`mt-3 font-medium text-sm ${isCurrent ? 'text-blue-600' : isActive ? 'text-green-600' : 'text-gray-400'
                      }`}>
                      {etapa.label}
                    </p>
                    <p className="text-xs text-gray-500 text-center max-w-[120px] mt-1 hidden md:block">
                      {etapa.desc}
                    </p>
                  </div>
                  {index < etapasPDCA.length - 1 && (
                    <div className="flex-1 h-1 mx-4 bg-gray-100 rounded-full overflow-hidden relative -top-6 md:-top-8">
                      <div
                        className={`h-full transition-all duration-500 ${index < currentEtapaIndex ? 'bg-green-500 w-full' :
                          index === currentEtapaIndex ? 'bg-blue-500 w-1/2' : 'w-0'
                          }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Riscos Identificados */}
        <div
          className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
          onClick={() => setShowRiscos(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Riscos Identificados</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{riscos.length}</p>
          <div className="mt-4 space-y-2">
            {Object.entries(riscosPorTipo).slice(0, 3).map(([tipo, count]) => (
              <div key={tipo} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 capitalize">{tipo}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medidas de Controle */}
        <div
          className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
          onClick={() => setShowMedidas(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Medidas de Controle</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{allStructuredMeasures.length}</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Taxa de Conclusão</span>
              <span className="font-medium text-green-600">{implementationRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${implementationRate}%` }}
              />
            </div>
            {legacyMeasuresCount > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                + {legacyMeasuresCount} medidas não estruturadas
              </p>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Compliance</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Funcionários</span>
              </div>
              <span className="font-bold text-gray-900">{metrics.totalFuncionarios}</span>
            </div>

            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Ambientes</span>
              </div>
              <span className="font-bold text-gray-900">{setores.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarquia de Controles (REAL DATA in Phase 9) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 font-mono">
          Hierarquia de Controles (Dados Reais)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { key: 'eliminacao', label: 'Eliminação', color: 'bg-green-600' },
            { key: 'substituicao', label: 'Substituição', color: 'bg-green-500' },
            { key: 'engenharia', label: 'Engenharia', color: 'bg-yellow-500' },
            { key: 'administrativa', label: 'Administrativa', color: 'bg-orange-500' },
            { key: 'epi', label: 'EPI', color: 'bg-red-500' },
          ].map((controle, index) => {
            const count = medidasPorTipo[controle.key] || 0;
            return (
              <div key={index} className={`${controle.color} rounded-xl p-4 text-white shadow-sm`}>
                <p className="text-sm font-medium opacity-90 text-white/90">{index + 1}º Prioridade</p>
                <p className="text-lg font-bold mt-1">{controle.label}</p>
                <p className="text-3xl font-bold mt-2">{count}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>* Baseado nas medidas estruturadas do plano de ação.</span>
          {medidasPorTipo['nao_classificado'] ? (
            <span>+ {medidasPorTipo['nao_classificado']} medidas não classificadas</span>
          ) : null}
        </div>
      </div>

      {/* Dialog - Riscos & Action Plan Trigger */}
      <Dialog open={showRiscos} onOpenChange={setShowRiscos}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Gerenciar Riscos e Medidas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {riscos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum risco identificado ainda.
              </div>
            ) : (
              riscos.map((risco) => {
                const medidasDesteRisco = allStructuredMeasures.filter(m => m.riscoId === risco.id);
                const severidade = risco.severidade ?? 0;
                return (
                  <div key={risco.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{risco.nome}</h4>
                          <StatusBadge
                            status={
                              severidade >= 4 ? 'critica' :
                                severidade === 3 ? 'alta' :
                                  severidade === 2 ? 'media' : 'baixa'
                            }
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{risco.descricao}</p>

                        {/* Structured Measures Summary */}
                        {(medidasDesteRisco.length || 0) > 0 && (
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {medidasDesteRisco.length} medidas planejadas
                            </Badge>
                            {medidasDesteRisco.some(m => m.status === 'concluido') && (
                              <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                                {medidasDesteRisco.filter(m => m.status === 'concluido').length} concluídas
                              </Badge>
                            )}
                          </div>
                        )}

                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleOpenActionPlan(risco)}
                      >
                        <Bookmark className="w-4 h-4" /> Plano de Ação
                      </Button>
                    </div>

                    {/* Legacy Text Warning */}
                    {risco.medidas_controle && (
                      <div className="mt-3 bg-gray-50 p-2 rounded border border-gray-100 text-xs text-gray-500">
                        <span className="font-semibold">Legado:</span> {risco.medidas_controle}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Just simple list of measures (Read Only view for aggregation) */}
      <Dialog open={showMedidas} onOpenChange={setShowMedidas}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              Medidas de Controle (Consolidado)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {allStructuredMeasures.length === 0 && legacyMeasuresCount === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma medida cadastrada.
              </div>
            ) : (
              <>
                {allStructuredMeasures.map((medida, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{medida.tipo.replace('_', ' ')}</Badge>
                        <span className="text-sm font-medium">{medida.descricao}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Responsável: {medida.responsavel || '-'}</p>
                    </div>
                    <StatusBadge status={medida.status === 'concluido' ? 'concluido' : 'pendente'} size="sm" />
                  </div>
                ))}

                {legacyMeasuresCount > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Medidas Não Estruturadas (Legado)</h4>
                    {riscos.filter(r => r.medidas_controle).map(r => (
                      <div key={r.id} className="text-sm text-gray-500 mb-1 pl-2 border-l-2 border-amber-200">
                        {r.medidas_controle}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
