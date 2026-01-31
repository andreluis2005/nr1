import { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Award,
  Users
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const nrs = [
  { value: 'todos', label: 'Todas' },
  { value: 'NR-05', label: 'NR-05 - Comissão Interna' },
  { value: 'NR-06', label: 'NR-06 - EPI' },
  { value: 'NR-10', label: 'NR-10 - Segurança Elétrica' },
  { value: 'NR-11', label: 'NR-11 - Transporte e Movimentação' },
  { value: 'NR-12', label: 'NR-12 - Máquinas' },
  { value: 'NR-17', label: 'NR-17 - Ergonomia' },
  { value: 'NR-18', label: 'NR-18 - Condições de Trabalho' },
  { value: 'NR-20', label: 'NR-20 - Líquidos Inflamáveis' },
  { value: 'NR-33', label: 'NR-33 - Espaço Confinado' },
  { value: 'NR-35', label: 'NR-35 - Trabalho em Altura' },
];

export function Treinamentos() {
  const { funcionarios, treinamentos } = useApp();
  const [filtroNR, setFiltroNR] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [showNovoTreinamento, setShowNovoTreinamento] = useState(false);

  // Filtrar treinamentos
  const treinamentosFiltrados = treinamentos.filter(treinamento => {
    const funcionario = funcionarios.find(f => f.id === treinamento.funcionarioId);
    const matchNR = filtroNR === 'todos' || treinamento.nr === filtroNR;
    const matchStatus = filtroStatus === 'todos' || treinamento.status === filtroStatus;
    const matchBusca = !busca || 
      funcionario?.nome.toLowerCase().includes(busca.toLowerCase()) ||
      treinamento.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchNR && matchStatus && matchBusca;
  });

  // Estatísticas
  const stats = {
    vigentes: treinamentos.filter(t => t.status === 'vigente').length,
    vencidos: treinamentos.filter(t => t.status === 'vencido').length,
    agendados: treinamentos.filter(t => t.status === 'agendado').length,
    totalHoras: treinamentos.reduce((acc, t) => acc + t.cargaHoraria, 0),
  };

  // Treinamentos por NR
  const treinamentosPorNR = treinamentos.reduce((acc: Record<string, number>, t) => {
    acc[t.nr] = (acc[t.nr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Treinamentos
          </h1>
          <p className="text-gray-500 mt-1">
            Gestão de capacitações obrigatórias das NRs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setShowNovoTreinamento(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Treinamento
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.vigentes}</p>
              <p className="text-sm text-green-600">Vigentes</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
              <p className="text-sm text-red-600">Vencidos</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.agendados}</p>
              <p className="text-sm text-blue-600">Agendados</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalHoras}</p>
              <p className="text-sm text-purple-600">Horas totais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar treinamento..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filtroNR}
                  onChange={(e) => setFiltroNR(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {nrs.map(nr => (
                    <option key={nr.value} value={nr.value}>{nr.label}</option>
                  ))}
                </select>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos</option>
                  <option value="vigente">Vigente</option>
                  <option value="vencido">Vencido</option>
                  <option value="agendado">Agendado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Treinamentos */}
          <div className="space-y-3">
            {treinamentosFiltrados.map((treinamento) => {
              const funcionario = funcionarios.find(f => f.id === treinamento.funcionarioId);
              
              return (
                <div 
                  key={treinamento.id} 
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        treinamento.status === 'vigente' ? 'bg-green-100' :
                        treinamento.status === 'vencido' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Award className={`w-6 h-6 ${
                          treinamento.status === 'vigente' ? 'text-green-600' :
                          treinamento.status === 'vencido' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{treinamento.descricao}</h4>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {treinamento.nr}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{funcionario?.nome}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(treinamento.dataRealizacao).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {treinamento.cargaHoraria}h
                          </span>
                          <span>Vence: {new Date(treinamento.dataVencimento).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={treinamento.status} size="sm" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Reagendar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar comprovante
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {treinamentosFiltrados.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum treinamento encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Treinamentos por NR */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Treinamentos por NR
            </h3>
            <div className="space-y-3">
              {Object.entries(treinamentosPorNR)
                .sort((a, b) => b[1] - a[1])
                .map(([nr, count]) => (
                  <div key={nr} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{nr}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Próximos Vencimentos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Próximos Vencimentos
            </h3>
            <div className="space-y-3">
              {treinamentos
                .filter(t => t.status === 'vigente')
                .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
                .slice(0, 5)
                .map((treinamento) => {
                  const funcionario = funcionarios.find(f => f.id === treinamento.funcionarioId);
                  const diasRestantes = Math.ceil(
                    (new Date(treinamento.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={treinamento.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{treinamento.nr}</p>
                        <p className="text-xs text-gray-500">{funcionario?.nome}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        diasRestantes <= 30 ? 'text-red-600' :
                        diasRestantes <= 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {diasRestantes} dias
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog - Novo Treinamento */}
      <Dialog open={showNovoTreinamento} onOpenChange={setShowNovoTreinamento}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Plus className="w-6 h-6 text-blue-600" />
              Novo Treinamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funcionário
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">Selecione um funcionário</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome} - {f.matricula}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Norma Regulamentadora
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                {nrs.filter(n => n.value !== 'todos').map(nr => (
                  <option key={nr.value} value={nr.value}>{nr.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input 
                type="text" 
                placeholder="Descrição do treinamento"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Realização
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carga Horária (horas)
                </label>
                <input 
                  type="number" 
                  placeholder="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrutor
              </label>
              <input 
                type="text" 
                placeholder="Nome do instrutor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setShowNovoTreinamento(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowNovoTreinamento(false)}
                className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Salvar Treinamento
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
