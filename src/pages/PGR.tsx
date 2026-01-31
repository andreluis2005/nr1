import { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  Download,
  Edit3,
  ChevronRight,
  Shield,
  Users,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PGR() {
  const { pgr, riscosMock } = useApp();
  const [showRiscos, setShowRiscos] = useState(false);
  const [showMedidas, setShowMedidas] = useState(false);

  const etapasPDCA = [
    { 
      key: 'planejar', 
      label: 'Planejar', 
      icon: Circle,
      desc: 'Identificação de riscos e planejamento'
    },
    { 
      key: 'fazer', 
      label: 'Fazer', 
      icon: Circle,
      desc: 'Implementação das medidas de controle'
    },
    { 
      key: 'checar', 
      label: 'Checar', 
      icon: Clock,
      desc: 'Monitoramento e avaliação'
    },
    { 
      key: 'agir', 
      label: 'Agir', 
      icon: Circle,
      desc: 'Ações corretivas e melhorias'
    },
  ];

  const getEtapaIndex = (etapa: string) => etapasPDCA.findIndex(e => e.key === etapa);
  const currentEtapaIndex = getEtapaIndex(pgr.etapaPDCA);

  const riscosPorTipo = riscosMock.reduce((acc: Record<string, number>, risco) => {
    acc[risco.tipo] = (acc[risco.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const medidasPorTipo = pgr.medidasControle.reduce((acc: Record<string, number>, medida) => {
    acc[medida.tipo] = (acc[medida.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const medidasImplementadas = pgr.medidasControle.filter(m => m.implementada).length;
  const percentualImplementacao = Math.round((medidasImplementadas / pgr.medidasControle.length) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            PGR - Programa de Gerenciamento de Riscos
          </h1>
          <p className="text-gray-500 mt-1">
            Gestão completa da NR-1 conforme GRO e PGR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Edit3 className="w-4 h-4" />
            Editar PGR
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">PGR {pgr.status === 'ativo' ? 'Ativo' : 'Em Revisão'}</h2>
                <StatusBadge status={pgr.status === 'ativo' ? 'atualizado' : 'atencao'} size="md" />
              </div>
              <p className="text-blue-100 mt-1">
                Versão {pgr.versao} • Última revisão: {new Date(pgr.dataRevisao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Responsável</p>
            <p className="font-medium">{pgr.responsavel}</p>
          </div>
        </div>
      </div>

      {/* Ciclo PDCA */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Ciclo PDCA - Gestão Contínua
        </h2>
        <div className="relative">
          <div className="flex items-center justify-between">
            {etapasPDCA.map((etapa, index) => {
              const isActive = index <= currentEtapaIndex;
              const isCurrent = index === currentEtapaIndex;
              
              return (
                <div key={etapa.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
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
                    <p className={`mt-2 font-medium text-sm ${
                      isCurrent ? 'text-blue-600' : isActive ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {etapa.label}
                    </p>
                    <p className="text-xs text-gray-500 text-center max-w-[120px] mt-1">
                      {etapa.desc}
                    </p>
                  </div>
                  {index < etapasPDCA.length - 1 && (
                    <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          index < currentEtapaIndex ? 'bg-green-500 w-full' : 
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
          className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
          onClick={() => setShowRiscos(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Riscos Identificados</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{riscosMock.length}</p>
          <div className="mt-4 space-y-2">
            {Object.entries(riscosPorTipo).map(([tipo, count]) => (
              <div key={tipo} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 capitalize">{tipo}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medidas de Controle */}
        <div 
          className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
          onClick={() => setShowMedidas(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Medidas de Controle</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{pgr.medidasControle.length}</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Implementadas</span>
              <span className="font-medium text-green-600">{percentualImplementacao}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${percentualImplementacao}%` }}
              />
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Estatísticas</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Funcionários cobertos</span>
              </div>
              <span className="font-medium text-gray-900">127</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Taxa de implementação</span>
              </div>
              <span className="font-medium text-green-600">{percentualImplementacao}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Dias desde revisão</span>
              </div>
              <span className="font-medium text-gray-900">
                {Math.ceil((new Date().getTime() - new Date(pgr.dataRevisao).getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarquia de Controles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Hierarquia de Controles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { tipo: 'eliminacao', label: 'Eliminação', count: medidasPorTipo['eliminacao'] || 0, color: 'bg-green-500' },
            { tipo: 'substituicao', label: 'Substituição', count: medidasPorTipo['substituicao'] || 0, color: 'bg-green-400' },
            { tipo: 'engenharia', label: 'Engenharia', count: medidasPorTipo['engenharia'] || 0, color: 'bg-yellow-500' },
            { tipo: 'administrativa', label: 'Administrativa', count: medidasPorTipo['administrativa'] || 0, color: 'bg-orange-500' },
            { tipo: 'epi', label: 'EPI', count: medidasPorTipo['epi'] || 0, color: 'bg-red-500' },
          ].map((controle, index) => (
            <div key={controle.tipo} className="relative">
              <div className={`${controle.color} rounded-xl p-4 text-white`}>
                <p className="text-sm font-medium opacity-90">{index + 1}º</p>
                <p className="text-lg font-bold mt-1">{controle.label}</p>
                <p className="text-2xl font-bold mt-2">{controle.count}</p>
                <p className="text-sm opacity-75">medidas</p>
              </div>
              {index < 4 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Ordem de prioridade: Eliminação → Substituição → Engenharia → Administrativa → EPI
        </p>
      </div>

      {/* Dialog - Riscos */}
      <Dialog open={showRiscos} onOpenChange={setShowRiscos}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Riscos Identificados
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {riscosMock.map((risco) => (
              <div key={risco.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{risco.agente}</h4>
                      <StatusBadge 
                        status={risco.grauRisco === 'critico' ? 'critica' : 
                                risco.grauRisco === 'grave' ? 'alta' : 
                                risco.grauRisco === 'moderado' ? 'media' : 'baixa'} 
                        size="sm" 
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{risco.descricao}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Tipo: <span className="capitalize">{risco.tipo}</span></span>
                      {risco.limiteTolerancia && (
                        <span>Limite: {risco.limiteTolerancia}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Medidas Preventivas:</p>
                  <ul className="mt-1 space-y-1">
                    {risco.medidasPreventivas.map((medida, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {medida}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Medidas */}
      <Dialog open={showMedidas} onOpenChange={setShowMedidas}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              Medidas de Controle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {pgr.medidasControle.map((medida) => (
              <div key={medida.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{medida.descricao}</h4>
                      <StatusBadge 
                        status={medida.implementada ? 'realizado' : 'pendente'} 
                        size="sm" 
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">Tipo: {medida.tipo}</span>
                      <span>Responsável: {medida.responsavel}</span>
                      {medida.dataImplementacao && (
                        <span>Implementado: {new Date(medida.dataImplementacao).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
