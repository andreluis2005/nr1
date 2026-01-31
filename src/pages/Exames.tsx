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
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const tiposExame = [
  { value: 'todos', label: 'Todos' },
  { value: 'admissional', label: 'Admissional' },
  { value: 'periodico', label: 'Periódico' },
  { value: 'demissional', label: 'Demissional' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'mudanca_funcao', label: 'Mudança de Função' },
];

export function Exames() {
  const { funcionarios, exames } = useApp();
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [showNovoExame, setShowNovoExame] = useState(false);

  const hoje = new Date();
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Filtrar exames
  const examesFiltrados = exames.filter(exame => {
    const funcionario = funcionarios.find(f => f.id === exame.funcionarioId);
    const matchTipo = filtroTipo === 'todos' || exame.tipo === filtroTipo;
    const matchBusca = !busca || 
      funcionario?.nome.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario?.matricula.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  // Estatísticas
  const stats = {
    vencidos: exames.filter(e => e.status === 'vencido').length,
    proximos30: exames.filter(e => {
      const vencimento = new Date(e.dataVencimento);
      return e.status === 'realizado' && vencimento <= trintaDias && vencimento >= hoje;
    }).length,
    proximos60: exames.filter(e => {
      const vencimento = new Date(e.dataVencimento);
      return e.status === 'realizado' && vencimento > trintaDias && vencimento <= new Date(hoje.getTime() + 60 * 24 * 60 * 60 * 1000);
    }).length,
    emDia: exames.filter(e => {
      const vencimento = new Date(e.dataVencimento);
      return e.status === 'realizado' && vencimento > new Date(hoje.getTime() + 60 * 24 * 60 * 60 * 1000);
    }).length,
  };

  const getDiasRestantes = (dataVencimento: string) => {
    const vencimento = new Date(dataVencimento);
    const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (exame: typeof exames[0]) => {
    if (exame.status === 'vencido') return 'text-red-600';
    const dias = getDiasRestantes(exame.dataVencimento);
    if (dias <= 7) return 'text-red-600';
    if (dias <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Exames Ocupacionais
          </h1>
          <p className="text-gray-500 mt-1">
            Controle de ASO e programação de exames
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setShowNovoExame(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Exame
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.proximos30}</p>
              <p className="text-sm text-yellow-600">&lt; 30 dias</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.proximos60}</p>
              <p className="text-sm text-blue-600">30-60 dias</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.emDia}</p>
              <p className="text-sm text-green-600">Em dia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar funcionário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {tiposExame.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realização
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dias
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {examesFiltrados.map((exame) => {
                const funcionario = funcionarios.find(f => f.id === exame.funcionarioId);
                const diasRestantes = getDiasRestantes(exame.dataVencimento);
                
                return (
                  <tr key={exame.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {funcionario?.nome.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{funcionario?.nome}</p>
                          <p className="text-sm text-gray-500">{funcionario?.matricula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="capitalize text-sm text-gray-900">
                        {exame.tipo.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(exame.dataRealizacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(exame.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={exame.status} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-medium text-sm ${getStatusColor(exame)}`}>
                        {exame.status === 'vencido' 
                          ? `${Math.abs(diasRestantes)} dias atrás`
                          : `${diasRestantes} dias`
                        }
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
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
        {examesFiltrados.length === 0 && (
          <div className="p-8 text-center">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum exame encontrado</p>
          </div>
        )}
      </div>

      {/* Dialog - Novo Exame */}
      <Dialog open={showNovoExame} onOpenChange={setShowNovoExame}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Plus className="w-6 h-6 text-blue-600" />
              Novo Exame Ocupacional
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
                Tipo de Exame
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                {tiposExame.filter(t => t.value !== 'todos').map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
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
                  Data de Vencimento
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clínica
              </label>
              <input 
                type="text" 
                placeholder="Nome da clínica"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea 
                rows={3}
                placeholder="Observações adicionais..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setShowNovoExame(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowNovoExame(false)}
                className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Salvar Exame
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
