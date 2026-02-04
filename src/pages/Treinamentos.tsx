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
import { useData } from '@/context/DataContext';
import { StatusBadge } from '@/components/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

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
  const { treinamentos, funcionarios, isLoading } = useData();
  const [filtroNR, setFiltroNR] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [showNovoTreinamento, setShowNovoTreinamento] = useState(false);

  // Filtrar treinamentos
  const treinamentosFiltrados = (treinamentos || []).filter(treinamento => {
    const funcionario = funcionarios.find(f => f.id === treinamento.funcionarioId);
    const matchNR = filtroNR === 'todos' || treinamento.nr === filtroNR;
    const matchStatus = filtroStatus === 'todos' || treinamento.status === filtroStatus;
    const matchBusca = !busca ||
      funcionario?.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      treinamento.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchNR && matchStatus && matchBusca;
  });

  // Estatísticas
  const stats = {
    vigentes: (treinamentos || []).filter(t => t.status === 'vigente').length,
    vencidos: (treinamentos || []).filter(t => t.status === 'vencido').length,
    agendados: (treinamentos || []).filter(t => t.status === 'agendado').length,
    totalHoras: (treinamentos || []).reduce((acc, t) => acc + (t.cargaHoraria || 0), 0),
  };

  // Treinamentos por NR
  const treinamentosPorNR = (treinamentos || []).reduce((acc: Record<string, number>, t) => {
    acc[t.nr] = (acc[t.nr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-4 pt-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  // isLoading já vem do context

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Treinamentos
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestão de capacitações e certificações das NRs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            onClick={() => setShowNovoTreinamento(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Treinamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center group-hover:bg-success-100 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.vigentes}</p>
              <p className="text-xs font-medium text-success-600 uppercase tracking-wider">Vigentes</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-50 rounded-lg flex items-center justify-center group-hover:bg-danger-100 transition-colors">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.vencidos}</p>
              <p className="text-xs font-medium text-danger-600 uppercase tracking-wider">Vencidos</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.agendados}</p>
              <p className="text-xs font-medium text-primary-600 uppercase tracking-wider">Agendados</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center group-hover:bg-warning-100 transition-colors">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalHoras}h</p>
              <p className="text-xs font-medium text-warning-600 uppercase tracking-wider">Horas Totais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar treinamento ou funcionário..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium italic"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filtroNR}
                  onChange={(e) => setFiltroNR(e.target.value)}
                  className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                >
                  {nrs.map(nr => (
                    <option key={nr.value} value={nr.value}>{nr.label}</option>
                  ))}
                </select>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                >
                  <option value="todos">Status: Todos</option>
                  <option value="vigente">Vigente</option>
                  <option value="vencido">Vencido</option>
                  <option value="agendado">Agendado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Treinamentos */}
          <div className="space-y-4">
            {isLoading ? (
              renderSkeleton()
            ) : treinamentosFiltrados.length === 0 ? (
              <Empty className="py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-neutral-50 text-neutral-400">
                    <GraduationCap />
                  </EmptyMedia>
                  <EmptyTitle>
                    {busca || filtroNR !== 'todos' || filtroStatus !== 'todos' ? 'Nenhum treinamento encontrado' : 'Nenhum treinamento cadastrado'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {busca || filtroNR !== 'todos' || filtroStatus !== 'todos'
                      ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                      : 'Comece a gerenciar as certificações e treinamentos obrigatórios da sua equipe.'}
                  </EmptyDescription>
                </EmptyHeader>
                {!(busca || filtroNR !== 'todos' || filtroStatus !== 'todos') && (
                  <EmptyContent>
                    <Button
                      onClick={() => setShowNovoTreinamento(true)}
                      className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Treinamento
                    </Button>
                  </EmptyContent>
                )}
              </Empty>
            ) : (
              treinamentosFiltrados.map((treinamento) => {
                const funcionario = funcionarios.find(f => f.id === treinamento.funcionarioId);

                return (
                  <div
                    key={treinamento.id}
                    className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm ${treinamento.status === 'vigente' ? 'bg-success-50 text-success-600 group-hover:bg-success-100' :
                          treinamento.status === 'vencido' ? 'bg-danger-50 text-danger-600 group-hover:bg-danger-100' :
                            'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
                          }`}>
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-neutral-900 tracking-tight">{treinamento.descricao}</h4>
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase rounded-md border border-neutral-200 tracking-wider">
                              {treinamento.nr}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-neutral-500 mt-1">{funcionario?.nome_completo || 'Funcionário não identificado'}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              Realizado: {new Date(treinamento.dataRealizacao).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {treinamento.cargaHoraria}h de carga horária
                            </span>
                            <span className="font-semibold text-neutral-600">Vence: {new Date(treinamento.dataVencimento).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={treinamento.status} size="sm" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2">
                              <Calendar className="w-4 h-4" />
                              Reagendar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="w-4 h-4" />
                              Baixar Comprovante
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Treinamentos por NR */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm overflow-hidden relative group">
            <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-neutral-400" />
              Treinamentos por NR
            </h3>
            <div className="space-y-4">
              {Object.entries(treinamentosPorNR)
                .sort((a, b) => b[1] - a[1])
                .map(([nr, count]) => (
                  <div key={nr} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-neutral-600">{nr}</span>
                      <span className="font-bold text-neutral-900">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${(count / (treinamentos?.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Próximos Vencimentos */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-warning-500" />
              Próximos Vencimentos
            </h3>
            <div className="space-y-4">
              {(treinamentos || [])
                .filter(t => t.status === 'vigente')
                .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
                .slice(0, 5)
                .map((treinamento) => {
                  const funcionario = funcionarios.find(f => f.id === treinamento.funcionarioId);
                  const diasRestantes = Math.ceil(
                    (new Date(treinamento.dataVencimento).getTime() - (new Date()).getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div key={treinamento.id} className="flex items-center justify-between group cursor-default">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900">{treinamento.nr}</p>
                        <p className="text-[10px] text-neutral-400 font-medium truncate">{funcionario?.nome_completo || 'N/A'}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[11px] font-bold ${diasRestantes <= 30 ? 'text-danger-600' :
                          diasRestantes <= 60 ? 'text-warning-600' : 'text-success-600'
                          }`}>
                          {diasRestantes} dias
                        </span>
                        <div className={`h-1 w-12 rounded-full mt-1 ${diasRestantes <= 30 ? 'bg-danger-100' :
                          diasRestantes <= 60 ? 'bg-warning-100' : 'bg-success-100'
                          }`} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog - Novo Treinamento */}
      <Dialog open={showNovoTreinamento} onOpenChange={setShowNovoTreinamento}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Plus className="w-6 h-6 text-primary-600" />
              Adicionar Treinamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Funcionário
              </label>
              <select className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 bg-white cursor-pointer">
                <option value="">Selecione um funcionário</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome_completo} - {f.matricula}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Norma Regulamentadora (NR)
              </label>
              <select className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 bg-white cursor-pointer">
                {nrs.filter(n => n.value !== 'todos').map(nr => (
                  <option key={nr.value} value={nr.value}>{nr.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Descrição da Atividade
              </label>
              <input
                type="text"
                placeholder="Ex: Treinamento NR-35 Trabalho em Altura"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                  Data de Realização
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                  Carga Horária (h)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 8"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Instrutor / Responsável
              </label>
              <input
                type="text"
                placeholder="Nome completo do instrutor"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNovoTreinamento(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setShowNovoTreinamento(false)}
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20"
              >
                Salvar Certificação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
