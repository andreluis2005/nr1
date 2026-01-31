import { useState } from 'react';
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
  ArrowDownRight
} from 'lucide-react';

// Mock de empresas do grupo
const mockEmpresas = [
  {
    id: '1',
    nome: 'MetalSil Indústria Ltda',
    nomeFantasia: 'MetalSil',
    cnpj: '12.345.678/0001-90',
    tipo: 'matriz',
    cidade: 'São Paulo',
    estado: 'SP',
    funcionarios: 127,
    conformidade: 87,
    alertas: 8,
    alertasCriticos: 2,
    status: 'ativo',
    logo: null,
    corPrimaria: '#2563eb',
  },
  {
    id: '2',
    nome: 'MetalSil Comercial Ltda',
    nomeFantasia: 'MetalSil Comercial',
    cnpj: '12.345.678/0002-71',
    tipo: 'filial',
    cidade: 'Campinas',
    estado: 'SP',
    funcionarios: 45,
    conformidade: 92,
    alertas: 3,
    alertasCriticos: 0,
    status: 'ativo',
    logo: null,
    corPrimaria: '#059669',
  },
  {
    id: '3',
    nome: 'MetalSil Logística Ltda',
    nomeFantasia: 'MetalSil Log',
    cnpj: '12.345.678/0003-52',
    tipo: 'filial',
    cidade: 'Guarulhos',
    estado: 'SP',
    funcionarios: 78,
    conformidade: 79,
    alertas: 12,
    alertasCriticos: 4,
    status: 'ativo',
    logo: null,
    corPrimaria: '#d97706',
  },
  {
    id: '4',
    nome: 'MetalSil Construções Ltda',
    nomeFantasia: 'MetalSil Construções',
    cnpj: '12.345.678/0004-33',
    tipo: 'filial',
    cidade: 'Sorocaba',
    estado: 'SP',
    funcionarios: 156,
    conformidade: 68,
    alertas: 23,
    alertasCriticos: 8,
    status: 'atencao',
    logo: null,
    corPrimaria: '#dc2626',
  },
  {
    id: '5',
    nome: 'MetalSil Tecnologia Ltda',
    nomeFantasia: 'MetalSil Tech',
    cnpj: '12.345.678/0005-14',
    tipo: 'filial',
    cidade: 'São Paulo',
    estado: 'SP',
    funcionarios: 34,
    conformidade: 96,
    alertas: 1,
    alertasCriticos: 0,
    status: 'ativo',
    logo: null,
    corPrimaria: '#7c3aed',
  },
];

// Mock de benchmark entre empresas
const mockBenchmark = [
  { indicador: 'Conformidade NR-1', empresas: [87, 92, 79, 68, 96], media: 84.4 },
  { indicador: 'Exames em Dia', empresas: [94, 98, 85, 72, 99], media: 89.6 },
  { indicador: 'Treinamentos', empresas: [91, 95, 82, 65, 97], media: 86.0 },
  { indicador: 'Incidentes/mês', empresas: [0, 0, 1, 3, 0], media: 0.8 },
];

export function MultiEmpresa() {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<typeof mockEmpresas[0] | null>(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');

  const totalFuncionarios = mockEmpresas.reduce((acc, e) => acc + e.funcionarios, 0);
  const mediaConformidade = Math.round(mockEmpresas.reduce((acc, e) => acc + e.conformidade, 0) / mockEmpresas.length);
  const totalAlertas = mockEmpresas.reduce((acc, e) => acc + e.alertas, 0);
  const totalAlertasCriticos = mockEmpresas.reduce((acc, e) => acc + e.alertasCriticos, 0);

  const empresasFiltradas = mockEmpresas.filter(e => 
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Empresa</h1>
          <p className="text-gray-500 mt-1">Gestão consolidada do grupo empresarial</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Empresa
        </button>
      </div>

      {/* KPIs Consolidados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-100 text-sm">Empresas</span>
            <Building2 className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-4xl font-bold">{mockEmpresas.length}</p>
          <p className="text-sm text-blue-100 mt-1">1 matriz, 4 filiais</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Funcionários Totais</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalFuncionarios}</p>
          <p className="text-sm text-gray-500 mt-1">Em todas as unidades</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Conformidade Média</span>
            <Shield className="w-5 h-5 text-green-500" />
          </div>
          <p className={`text-3xl font-bold ${getConformidadeColor(mediaConformidade)}`}>{mediaConformidade}%</p>
          <p className="text-sm text-gray-500 mt-1">Média do grupo</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Alertas Críticos</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{totalAlertasCriticos}</p>
          <p className="text-sm text-gray-500 mt-1">de {totalAlertas} alertas totais</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'visao-geral', label: 'Visão Geral', icon: Building2 },
          { id: 'benchmark', label: 'Benchmark', icon: BarChart3 },
          { id: 'matriz', label: 'Estrutura', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === tab.id
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Lista de Empresas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresasFiltradas.map((empresa) => (
              <div
                key={empresa.id}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setEmpresaSelecionada(empresa)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: empresa.corPrimaria + '20' }}
                    >
                      <Building2 className="w-6 h-6" style={{ color: empresa.corPrimaria }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{empresa.nomeFantasia}</h3>
                        {empresa.tipo === 'matriz' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Matriz
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{empresa.cnpj}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(empresa.status)}`}>
                    {empresa.status === 'ativo' ? 'Ativa' : 'Atenção'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  {empresa.cidade}, {empresa.estado}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{empresa.funcionarios}</p>
                    <p className="text-xs text-gray-500">Funcionários</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className={`text-lg font-bold ${getConformidadeColor(empresa.conformidade)}`}>
                      {empresa.conformidade}%
                    </p>
                    <p className="text-xs text-gray-500">Conformidade</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className={`text-lg font-bold ${empresa.alertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {empresa.alertasCriticos}
                    </p>
                    <p className="text-xs text-gray-500">Críticos</p>
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
            <div className="space-y-6">
              {mockBenchmark.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.indicador}</span>
                    <span className="text-sm text-gray-500">Média do Grupo: {item.media}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.empresas.map((valor, i) => (
                      <div key={i} className="flex-1">
                        <div
                          className={`h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                            valor >= item.media ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {valor}
                          {valor >= item.media ? (
                            <ArrowUpRight className="w-3 h-3 ml-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 ml-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          {mockEmpresas[i]?.nomeFantasia}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Ranking de Conformidade</h3>
            <div className="space-y-3">
              {[...mockEmpresas]
                .sort((a, b) => b.conformidade - a.conformidade)
                .map((empresa, index) => (
                  <div key={empresa.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{empresa.nomeFantasia}</p>
                      <p className="text-xs text-gray-500">{empresa.funcionarios} funcionários</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getConformidadeColor(empresa.conformidade)}`}>
                        {empresa.conformidade}%
                      </p>
                      <p className="text-xs text-gray-500">conformidade</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Estrutura */}
      {abaAtiva === 'matriz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-6">Estrutura Organizacional</h3>
            <div className="flex justify-center">
              <div className="text-center">
                {/* Matriz */}
                <div className="inline-block p-4 bg-blue-100 rounded-xl border-2 border-blue-300 mb-8">
                  <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-900">MetalSil Indústria Ltda</p>
                  <p className="text-sm text-blue-700">Matriz - São Paulo/SP</p>
                  <p className="text-xs text-blue-600 mt-1">127 funcionários</p>
                </div>

                {/* Conector */}
                <div className="w-0.5 h-8 bg-gray-300 mx-auto" />
                <div className="w-3/4 h-0.5 bg-gray-300 mx-auto" />
                <div className="flex justify-between px-16 -mt-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-0.5 h-8 bg-gray-300" />
                  ))}
                </div>

                {/* Filiais */}
                <div className="grid grid-cols-4 gap-4 mt-0">
                  {mockEmpresas.filter(e => e.tipo === 'filial').map((filial) => (
                    <div
                      key={filial.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setEmpresaSelecionada(filial)}
                    >
                      <Building2 className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="font-medium text-gray-900 text-sm">{filial.nomeFantasia}</p>
                      <p className="text-xs text-gray-500">{filial.cidade}/{filial.estado}</p>
                      <p className="text-xs text-gray-400 mt-1">{filial.funcionarios} func.</p>
                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        filial.conformidade >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {filial.conformidade}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Empresa */}
      {empresaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
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
                <div>
                  <p className="text-sm text-gray-500 mb-1">Localização</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{empresaSelecionada.cidade}, {empresaSelecionada.estado}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Funcionários</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{empresaSelecionada.funcionarios}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Índice de Conformidade</p>
                  <p className={`text-3xl font-bold ${getConformidadeColor(empresaSelecionada.conformidade)}`}>
                    {empresaSelecionada.conformidade}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Alertas Pendentes</p>
                  <p className={`text-3xl font-bold ${empresaSelecionada.alertasCriticos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {empresaSelecionada.alertas}
                  </p>
                  {empresaSelecionada.alertasCriticos > 0 && (
                    <p className="text-sm text-red-600 mt-1">{empresaSelecionada.alertasCriticos} críticos</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Editar Empresa
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
