import { useState } from 'react';
import { useData } from '@/context/DataContext';
import {
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileText
} from 'lucide-react';

// Dados simulados de analytics
const mockAnalytics = {
  economiaMensal: 12500,
  economiaAnual: 150000,
  multasEvitadas: 8,
  multasValor: 45000,
  conformidadeHistorico: [65, 68, 72, 75, 78, 82, 85, 87, 89, 91, 93, 95],
  conformidadeMercado: 72,
  scoreMaturidade: 78,
  examesNoPrazo: 94,
  treinamentosCompliant: 91,
  pgrAtualizado: true,
  tempoMedioResposta: 2.3,
  funcionariosTreinados: 127,
  incidentesMes: 0,
  afastamentosEvitados: 3,
  economiaAfastamentos: 18000,
  produtividadeGanha: 240,
  roiPercentual: 320,
  paybackMeses: 3.2,
};

const mockSetores = [
  { nome: 'Produção', conformidade: 92, risco: 'médio', funcionarios: 45 },
  { nome: 'Manutenção', conformidade: 88, risco: 'alto', funcionarios: 23 },
  { nome: 'Administrativo', conformidade: 98, risco: 'baixo', funcionarios: 18 },
  { nome: 'Logística', conformidade: 85, risco: 'médio', funcionarios: 28 },
  { nome: 'Qualidade', conformidade: 96, risco: 'baixo', funcionarios: 13 },
];

const mockBenchmark = [
  { indicador: 'Conformidade NR-1', empresa: 87, mercado: 72, lideres: 94 },
  { indicador: 'Exames em Dia', empresa: 94, mercado: 78, lideres: 98 },
  { indicador: 'Treinamentos', empresa: 91, mercado: 65, lideres: 95 },
  { indicador: 'Resposta a Alertas', empresa: 2.3, mercado: 5.2, lideres: 1.5 },
  { indicador: 'Incidentes/mês', empresa: 0, mercado: 2.1, lideres: 0.2 },
];

export function Analytics() {
  const { metrics, regulatoryState } = useData();
  const [periodo, setPeriodo] = useState('12m');
  const [abaAtiva, setAbaAtiva] = useState('executivo');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo': return 'bg-green-500';
      case 'médio': return 'bg-yellow-500';
      case 'alto': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Business Intelligence</h1>
          <p className="text-gray-500 mt-1">Dashboard executivo e análise de performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="12m">Últimos 12 meses</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'executivo', label: 'Visão Executiva', icon: BarChart3 },
          { id: 'financeiro', label: 'Financeiro & ROI', icon: DollarSign },
          { id: 'benchmark', label: 'Benchmark', icon: Target },
          { id: 'setores', label: 'Análise por Setor', icon: PieChart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${abaAtiva === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo por Aba */}
      {abaAtiva === 'executivo' && (
        <div className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-100 text-sm">Score de Maturidade SST</span>
                <Award className="w-5 h-5 text-blue-200" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{mockAnalytics.scoreMaturidade}</span>
                <span className="text-blue-200 text-lg">/100</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-blue-100">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12 pontos vs. ano anterior</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Índice de Conformidade</span>
                <Shield className={`w-5 h-5 text-${regulatoryState?.color === 'green' ? 'green-500' : (regulatoryState?.color === 'red' ? 'red-500' : 'blue-500')}`} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{regulatoryState?.progress || 0}%</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{(regulatoryState?.progress || 0) - mockAnalytics.conformidadeMercado}% vs. mercado</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Multas Evitadas (12m)</span>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{mockAnalytics.multasEvitadas}</span>
              </div>
              <div className="mt-3 text-sm text-green-600">
                <span>Economia de {formatCurrency(mockAnalytics.multasValor)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Tempo Médio Resposta</span>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{mockAnalytics.tempoMedioResposta}</span>
                <span className="text-gray-400 text-lg">dias</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
                <ArrowDownRight className="w-4 h-4" />
                <span>56% mais rápido que o mercado</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Evolução da Conformidade</h3>
                <p className="text-sm text-gray-500">Últimos 12 meses vs. média do mercado</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Sua Empresa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-sm text-gray-600">Média do Mercado</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end gap-2">
              {mockAnalytics.conformidadeHistorico.map((valor, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end gap-1">
                    <div
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${valor * 2}px` }}
                    />
                    <div
                      className="flex-1 bg-gray-200 rounded-t"
                      style={{ height: `${mockAnalytics.conformidadeMercado * 2}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas Secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funcionários Treinados</p>
                  <p className="text-2xl font-bold text-gray-900">{mockAnalytics.funcionariosTreinados}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <TrendingUp className="w-4 h-4" />
                <span>100% da força de trabalho</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exames no Prazo</p>
                  <p className="text-2xl font-bold text-gray-900">{mockAnalytics.examesNoPrazo}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <TrendingUp className="w-4 h-4" />
                <span>+8% vs. mês anterior</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Treinamentos Compliant</p>
                  <p className="text-2xl font-bold text-gray-900">{mockAnalytics.treinamentosCompliant}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <TrendingUp className="w-4 h-4" />
                <span>+5% vs. mês anterior</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'financeiro' && (
        <div className="space-y-6">
          {/* ROI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-100">Economia Anual Estimada</span>
                <DollarSign className="w-6 h-6 text-green-200" />
              </div>
              <p className="text-4xl font-bold">{formatCurrency(mockAnalytics.economiaAnual)}</p>
              <p className="mt-2 text-green-100 text-sm">Baseado em multas evitadas e ganho de produtividade</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">ROI do Investimento</span>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{mockAnalytics.roiPercentual}%</p>
              <p className="mt-2 text-gray-500 text-sm">Retorno anual sobre o investimento na plataforma</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Payback</span>
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{mockAnalytics.paybackMeses} meses</p>
              <p className="mt-2 text-gray-500 text-sm">Tempo para recuperar o investimento</p>
            </div>
          </div>

          {/* Detalhamento Financeiro */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Detalhamento de Economia</h3>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Multas Evitadas</p>
                    <p className="text-sm text-gray-500">{mockAnalytics.multasEvitadas} multas não aplicadas</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600">{formatCurrency(mockAnalytics.multasValor)}</p>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Afastamentos Evitados</p>
                    <p className="text-sm text-gray-500">{mockAnalytics.afastamentosEvitados} casos prevenidos</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600">{formatCurrency(mockAnalytics.economiaAfastamentos)}</p>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Produtividade Ganhada</p>
                    <p className="text-sm text-gray-500">{mockAnalytics.produtividadeGanha} horas/mês economizadas</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600">{formatCurrency(mockAnalytics.produtividadeGanha * 50)}</p>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <p className="font-semibold text-gray-900">Economia Total Estimada</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(mockAnalytics.economiaAnual)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'benchmark' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Benchmarking de Conformidade</h3>
              <p className="text-sm text-gray-500">Comparação com mercado e líderes do setor</p>
            </div>
            <div className="divide-y divide-gray-200">
              {mockBenchmark.map((item, index) => (
                <div key={index} className="px-6 py-4">
                  <p className="font-medium text-gray-900 mb-3">{item.indicador}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Sua Empresa</span>
                        <span className="font-medium text-blue-600">{item.empresa}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.empresa}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Média do Mercado</span>
                        <span className="font-medium text-gray-500">{item.mercado}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-400 rounded-full"
                          style={{ width: `${item.mercado}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Líderes do Setor</span>
                        <span className="font-medium text-green-600">{item.lideres}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${item.lideres}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'setores' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSetores.map((setor, index) => (
              <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{setor.nome}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRiscoColor(setor.risco)}`}>
                    Risco {setor.risco}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Conformidade</span>
                      <span className="font-medium text-gray-900">{setor.conformidade}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${setor.conformidade >= 90 ? 'bg-green-500' :
                          setor.conformidade >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${setor.conformidade}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Funcionários</span>
                    <span className="font-medium text-gray-900">{setor.funcionarios}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Heatmap de Riscos por Setor</h3>
            <div className="grid grid-cols-5 gap-2">
              {['Físico', 'Químico', 'Ergonômico', 'Biológico', 'Acidente'].map((tipo, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-gray-500 mb-2">{tipo}</p>
                  {mockSetores.map((setor, j) => (
                    <div
                      key={j}
                      className={`h-12 rounded-lg mb-2 flex items-center justify-center text-xs font-medium ${setor.risco === 'alto' && (tipo === 'Físico' || tipo === 'Acidente')
                        ? 'bg-red-500 text-white'
                        : setor.risco === 'médio' && tipo === 'Químico'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-100 text-green-700'
                        }`}
                    >
                      {setor.risco === 'alto' && (tipo === 'Físico' || tipo === 'Acidente')
                        ? 'Alto'
                        : setor.risco === 'médio' && tipo === 'Químico'
                          ? 'Médio'
                          : 'Baixo'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded" />
                <span className="text-sm text-gray-600">Baixo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span className="text-sm text-gray-600">Médio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-sm text-gray-600">Alto</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
