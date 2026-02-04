import { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal
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

const tiposExame = [
  { value: 'todos', label: 'Todos' },
  { value: 'admissional', label: 'Admissional' },
  { value: 'periodico', label: 'Periódico' },
  { value: 'demissional', label: 'Demissional' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'mudanca_funcao', label: 'Mudança de Função' },
];

export function Exames() {
  const { exames, funcionarios, isLoading } = useData();
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [showNovoExame, setShowNovoExame] = useState(false);

  const hoje = new Date();
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Filtrar exames
  const examesFiltrados = (exames || []).filter(exame => {
    const funcionario = funcionarios.find(f => f.id === exame.funcionarioId);
    const matchTipo = filtroTipo === 'todos' || exame.tipo === filtroTipo;
    const matchBusca = !busca ||
      funcionario?.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario?.matricula.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  // Estatísticas
  const stats = {
    vencidos: (exames || []).filter(e => e.status === 'vencido').length,
    proximos30: (exames || []).filter(e => {
      const vencimento = new Date(e.dataVencimento);
      return e.status === 'realizado' && vencimento <= trintaDias && vencimento >= hoje;
    }).length,
    proximos60: (exames || []).filter(e => {
      const vencimento = new Date(e.dataVencimento);
      return e.status === 'realizado' && vencimento > trintaDias && vencimento <= new Date(hoje.getTime() + 60 * 24 * 60 * 60 * 1000);
    }).length,
    emDia: (exames || []).filter(e => {
      const vencimento = new Date(e.dataVencimento);
      return e.status === 'realizado' && vencimento > new Date(hoje.getTime() + 60 * 24 * 60 * 60 * 1000);
    }).length,
  };

  const renderSkeleton = () => (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="h-12 bg-neutral-50 border-b border-neutral-200" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 last:border-0">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-4 w-20 mx-4" />
          <Skeleton className="h-4 w-24 mx-4" />
          <Skeleton className="h-4 w-16 mx-4" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );

  // isLoading já vem do context

  const getDiasRestantes = (dataVencimento: string) => {
    const vencimento = new Date(dataVencimento);
    const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (exame: any) => {
    if (exame.status === 'vencido') return 'text-danger-600';
    const dias = getDiasRestantes(exame.dataVencimento);
    if (dias <= 7) return 'text-danger-600';
    if (dias <= 30) return 'text-warning-600';
    return 'text-success-600';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Exames Ocupacionais
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Controle de ASO e programação de exames periódicos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            onClick={() => setShowNovoExame(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Exame
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm overflow-hidden relative group transition-all hover:border-danger-100 hover:shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-danger-50 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.vencidos}</p>
              <p className="text-xs font-medium text-danger-600 uppercase tracking-wider">Vencidos</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm overflow-hidden relative group transition-all hover:border-warning-100 hover:shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-warning-50 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.proximos30}</p>
              <p className="text-xs font-medium text-warning-600 uppercase tracking-wider">&lt; 30 dias</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm overflow-hidden relative group transition-all hover:border-primary-100 hover:shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary-50 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.proximos60}</p>
              <p className="text-xs font-medium text-primary-600 uppercase tracking-wider">30-60 dias</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-150 rounded-xl p-5 shadow-sm overflow-hidden relative group transition-all hover:border-success-100 hover:shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-success-50 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.emDia}</p>
              <p className="text-xs font-medium text-success-600 uppercase tracking-wider">Em dia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar funcionário ou matrícula..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer hover:bg-neutral-50"
            >
              {tiposExame.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        renderSkeleton()
      ) : examesFiltrados.length === 0 ? (
        <Empty className="py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-neutral-50 text-neutral-400">
              <Stethoscope />
            </EmptyMedia>
            <EmptyTitle>
              {busca || filtroTipo !== 'todos' ? 'Nenhum exame encontrado' : 'Nenhum exame programado'}
            </EmptyTitle>
            <EmptyDescription>
              {busca || filtroTipo !== 'todos'
                ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                : 'Você ainda não tem exames cadastrados. Comece programando o controle de saúde dos seus colaboradores.'}
            </EmptyDescription>
          </EmptyHeader>
          {!(busca || filtroTipo !== 'todos') && (
            <EmptyContent>
              <Button
                onClick={() => setShowNovoExame(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                Agendar Primeiro Exame
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Funcionário</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Realização</th>
                  <th className="px-6 py-3 font-medium">Vencimento</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Dias</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {examesFiltrados.map((exame) => {
                  const funcionario = funcionarios.find(f => f.id === exame.funcionarioId);
                  const diasRestantes = getDiasRestantes(exame.dataVencimento);

                  return (
                    <tr key={exame.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center font-medium shadow-sm border border-primary-100">
                            {funcionario?.nome_completo?.charAt(0) || '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-900">{funcionario?.nome_completo || 'N/A'}</span>
                            <span className="text-xs text-neutral-500">{funcionario?.matricula || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-neutral-700">
                          {exame.tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {new Date(exame.dataRealizacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {new Date(exame.dataVencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={exame.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold text-xs ${getStatusColor(exame)}`}>
                          {exame.status === 'vencido'
                            ? `${Math.abs(diasRestantes)} dias atrás`
                            : `${diasRestantes} dias`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-neutral-400 hover:text-neutral-600 p-1 rounded hover:bg-neutral-100 transition-colors">
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
                              Baixar ASO
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog - Novo Exame */}
      <Dialog open={showNovoExame} onOpenChange={setShowNovoExame}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Plus className="w-6 h-6 text-primary-600" />
              Novo Exame Ocupacional
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">
                Funcionário
              </label>
              <select className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="">Selecione um funcionário</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome_completo} - {f.matricula}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">
                Tipo de Exame
              </label>
              <select className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20">
                {tiposExame.filter(t => t.value !== 'todos').map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Data de Realização
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">
                Clínica
              </label>
              <input
                type="text"
                placeholder="Nome da clínica"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                placeholder="Observações adicionais..."
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNovoExame(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setShowNovoExame(false)}
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
              >
                Salvar Exame
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
