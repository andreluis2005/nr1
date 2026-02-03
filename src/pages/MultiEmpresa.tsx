import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle,
  XCircle,
  BarChart3,
  MapPin,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NovaEmpresaDialog } from '@/components/empresas/NovaEmpresaDialog';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Tipo enriquecido para UI
interface EmpresaUI {
  id: string;
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  tipo: 'matriz' | 'filial';
  cidade: string;
  estado: string;
  funcionarios: number;
  conformidade: number;
  alertas: number;
  alertasCriticos: number;
  status: 'ativo' | 'atencao' | 'inativo';
  logo: string | null;
  corPrimaria: string;
}

export function MultiEmpresa() {
  const { empresas: empresasAuth, isLoading: isLoadingAuth, selecionarEmpresa, criarEmpresa } = useSupabaseAuth();
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState<EmpresaUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaUI | null>(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');

  const fetchMetrics = useCallback(async () => {
    // Se não tiver empresas vinculadas no auth, limpa e retorna
    if (!empresasAuth || empresasAuth.length === 0) {
      setEmpresas([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Mapeia cada empresa vinculada para buscar métricas extras
      const promises = empresasAuth.map(async (vinculo) => {
        const emp = vinculo.empresa;
        const empresaId = emp.id;

        // 1. Fetch count Funcionários
        const { count: countFunc } = await supabase
          .from('funcionarios')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId);

        // 2. Fetch exames vencidos (para simular alertas/conformidade)
        const hoje = new Date().toISOString().split('T')[0];
        const { count: countVencidos } = await supabase
          .from('asos')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .lt('data_validade', hoje);

        // Cálculos simples para MVP
        const totalFuncionarios = countFunc || 0;
        const totalVencidos = countVencidos || 0;

        // Simulação de conformidade
        // Se 0 funcs => 100%. Se tem funcs => desconta % baseado em vencidos
        let conformidade = 100;
        if (totalFuncionarios > 0) {
          // Se tiver 10% de exames vencidos, conformidade cai
          const ratio = totalVencidos / Math.max(totalFuncionarios, 1);
          // Exemplo: 0.1 (10%) => conformidade = 90
          conformidade = Math.max(0, Math.round(100 - (ratio * 100)));
        }

        // Status visual
        let status: 'ativo' | 'atencao' | 'inativo' = 'ativo';
        if (conformidade < 70 || totalVencidos > 5) status = 'atencao';
        if (emp.status === 'inativo') status = 'inativo';

        // Definindo cor baseada no nome (apenas para visual)
        const cores = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];
        const corIndex = (empresaId.charCodeAt(0) || 0) % cores.length;

        return {
          id: emp.id,
          nome: emp.razao_social || emp.nome_fantasia,
          nomeFantasia: emp.nome_fantasia,
          cnpj: emp.cnpj || 'CNPJ não informado',
          tipo: (vinculo.is_principal ? 'matriz' : 'filial') as 'matriz' | 'filial',
          cidade: 'Não def.', // Endereço ainda não está no schema 'empresas'
          estado: 'UF',
          funcionarios: totalFuncionarios,
          conformidade: conformidade,
          alertas: totalVencidos,
          alertasCriticos: totalVencidos,
          status: status,
          logo: emp.logo_url,
          corPrimaria: cores[corIndex]
        } as EmpresaUI;
      });

      const results = await Promise.all(promises);
      setEmpresas(results);
    } catch (error) {
      console.error("Erro ao buscar métricas de empresas:", error);
      toast.error("Erro ao atualizar dados das empresas.");
    } finally {
      setIsLoading(false);
    }
  }, [empresasAuth]);

  useEffect(() => {
    // Dispara fetch quando a lista de empresas do usuário mudar (ex: criou nova empresa)
    fetchMetrics();

    // Opcional: Polling a cada 30s
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const handleAccessDashboard = (empresa: EmpresaUI) => {
    selecionarEmpresa(empresa.id);
    navigate('/app');
  };

  // Cálculos consolidados para KPIs do grupo
  const totalFuncionarios = empresas.reduce((acc, e) => acc + e.funcionarios, 0);
  const mediaConformidade = empresas.length > 0
    ? Math.round(empresas.reduce((acc, e) => acc + e.conformidade, 0) / empresas.length)
    : 0;
  const totalAlertas = empresas.reduce((acc, e) => acc + e.alertas, 0);
  const totalAlertasCriticos = empresas.reduce((acc, e) => acc + e.alertasCriticos, 0);

  const empresasFiltradas = empresas.filter(e =>
    e.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    e.cnpj.includes(filtroBusca)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700';
      case 'atencao': return 'bg-yellow-100 text-yellow-700';
      case 'inativo': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConformidadeColor = (valor: number) => {
    if (valor >= 90) return 'text-green-600';
    if (valor >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Loading global
  if (isLoadingAuth || (isLoading && empresas.length === 0)) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Dados para Benchmark (derivados dos dados reais)
  const realBenchmark = [
    {
      indicador: 'Conformidade',
      empresas: empresas.map(e => e.conformidade),
      media: mediaConformidade
    },
    {
      indicador: 'Funcionários',
      empresas: empresas.map(e => e.funcionarios),
      media: Math.round(totalFuncionarios / (empresas.length || 1))
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Empresa</h1>
          <p className="text-gray-500 mt-1">Gestão consolidada do grupo empresarial</p>
        </div>
        <NovaEmpresaDialog
          // Ao criar com sucesso, o SupabaseAuthContext atualiza 'empresasAuth',
          // que dispara o useEffect deste componente, recarregando a lista.
          onSuccess={() => { }}
          trigger={
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Empresa
            </button>
          }
        />
      </div>

      {/* Resultados Vazios */}
      {empresas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhuma empresa encontrada</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Você ainda não possui empresas cadastradas. Crie sua primeira empresa para começar.
          </p>
          <NovaEmpresaDialog
            trigger={
              <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Criar Minha Empresa
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* KPIs Consolidados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-100 text-sm font-medium">Empresas</span>
                <Building2 className="w-5 h-5 text-blue-200" />
              </div>
              <p className="text-4xl font-bold">{empresas.length}</p>
              <p className="text-sm text-blue-100 mt-1">Vinculadas a você</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Funcionários Totais</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalFuncionarios}</p>
              <p className="text-sm text-gray-500 mt-1">Em todas as unidades</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Conformidade Média</span>
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <p className={`text-3xl font-bold ${getConformidadeColor(mediaConformidade)}`}>{mediaConformidade}%</p>
              <p className="text-sm text-gray-500 mt-1">Média do grupo</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Atendimentos Necessários</span>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className={`text-3xl font-bold ${totalAlertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totalAlertasCriticos}
              </p>
              <p className="text-sm text-gray-500 mt-1">Exames vencidos ou alertas</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'visao-geral', label: 'Visão Geral', icon: Building2 },
              { id: 'benchmark', label: 'Benchmark', icon: BarChart3 },
              // { id: 'matriz', label: 'Estrutura', icon: TrendingUp }, // TODO: Implementar visualização de árvore
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${abaAtiva === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Visão Geral */}
          {abaAtiva === 'visao-geral' && (
            <div className="space-y-6">
              {/* Busca */}
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar empresa por nome ou CNPJ..."
                    value={filtroBusca}
                    onChange={(e) => setFiltroBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Lista de Empresas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {empresasFiltradas.map((empresa) => (
                  <div
                    key={empresa.id}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer group"
                    onClick={() => setEmpresaSelecionada(empresa)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 transition-colors"
                        >
                          <Building2 className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate" title={empresa.nomeFantasia}>{empresa.nomeFantasia}</h3>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{empresa.cnpj}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(empresa.status)}`}>
                        {empresa.status === 'ativo' ? 'Ativa' : 'Atenção'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{empresa.cidade}, {empresa.estado}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50/30 transition-colors">
                        <p className="text-lg font-bold text-gray-900">{empresa.funcionarios}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Funcs.</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50/30 transition-colors">
                        <p className={`text-lg font-bold ${getConformidadeColor(empresa.conformidade)}`}>
                          {empresa.conformidade}%
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Conform.</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50/30 transition-colors">
                        <p className={`text-lg font-bold ${empresa.alertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {empresa.alertasCriticos}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Pend.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmark */}
          {abaAtiva === 'benchmark' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Benchmark entre Empresas</h3>
                <div className="space-y-8">
                  {realBenchmark.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900">{item.indicador}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Média: {item.media}</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                        {item.empresas.map((valor, i) => (
                          <div key={i} className="flex-1 min-w-[120px] max-w-[200px]">
                            <div className="relative pt-6">
                              <div
                                className={`h-10 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${valor >= item.media ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}
                              >
                                {valor}
                                {valor >= item.media ? (
                                  <ArrowUpRight className="w-4 h-4 ml-1" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4 ml-1" />
                                )}
                              </div>
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200 -z-10"></div>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2 truncate font-medium" title={empresas[i]?.nomeFantasia}>
                              {empresas[i]?.nomeFantasia}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes da Empresa */}
      {empresaSelecionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: empresaSelecionada.corPrimaria + '20' }}
                  >
                    <Building2 className="w-8 h-8" style={{ color: empresaSelecionada.corPrimaria }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{empresaSelecionada.nomeFantasia}</h2>
                      {empresaSelecionada.tipo === 'matriz' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Matriz
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500">{empresaSelecionada.nome}</p>
                    <p className="text-sm text-gray-400">CNPJ: {empresaSelecionada.cnpj}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmpresaSelecionada(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Localização</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{empresaSelecionada.cidade}, {empresaSelecionada.estado}</span>
                  </div>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Equipe</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{empresaSelecionada.funcionarios} Colaboradores</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Índice de Conformidade</p>
                  <p className={`text-4xl font-bold ${getConformidadeColor(empresaSelecionada.conformidade)}`}>
                    {empresaSelecionada.conformidade}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Baseado em laudos e exames</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Pendências</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold ${empresaSelecionada.alertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {empresaSelecionada.alertas}
                    </p>
                    <span className="text-sm text-gray-500">totais</span>
                  </div>
                  {empresaSelecionada.alertasCriticos > 0 && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{empresaSelecionada.alertasCriticos} críticas requerem atenção</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setEmpresaSelecionada(null)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleAccessDashboard(empresaSelecionada)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  Acessar Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
