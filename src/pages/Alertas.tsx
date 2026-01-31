import { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search,
  Calendar,
  User,
  Stethoscope,
  GraduationCap,
  FileText,
  AlertOctagon,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge, PriorityBadge } from '@/components/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const tiposAlerta = [
  { value: 'todos', label: 'Todos', icon: Bell },
  { value: 'exame', label: 'Exames', icon: Stethoscope },
  { value: 'treinamento', label: 'Treinamentos', icon: GraduationCap },
  { value: 'pgr', label: 'PGR', icon: FileText },
  { value: 'documento', label: 'Documentos', icon: FileText },
  { value: 'multa', label: 'Multas', icon: AlertOctagon },
];

const prioridades = [
  { value: 'todas', label: 'Todas' },
  { value: 'critica', label: 'Crítica' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
];

export function Alertas() {
  const { alertas, funcionarios, marcarAlertaResolvido } = useApp();
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [busca, setBusca] = useState('');
  const [alertaSelecionado, setAlertaSelecionado] = useState<string | null>(null);

  // Filtrar alertas
  const alertasFiltrados = alertas.filter(alerta => {
    const matchTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
    const matchPrioridade = filtroPrioridade === 'todas' || alerta.prioridade === filtroPrioridade;
    const matchStatus = filtroStatus === 'todos' || alerta.status === filtroStatus;
    const matchBusca = !busca || 
      alerta.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      alerta.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchPrioridade && matchStatus && matchBusca;
  });

  // Agrupar por prioridade
  const alertasCriticos = alertasFiltrados.filter(a => a.prioridade === 'critica');
  const alertasAlta = alertasFiltrados.filter(a => a.prioridade === 'alta');
  const alertasMedia = alertasFiltrados.filter(a => a.prioridade === 'media');
  const alertasBaixa = alertasFiltrados.filter(a => a.prioridade === 'baixa');

  const getTipoIcon = (tipo: string) => {
    const config = tiposAlerta.find(t => t.value === tipo);
    return config?.icon || Bell;
  };

  const renderAlertaCard = (alerta: typeof alertas[0]) => {
    const funcionario = alerta.funcionarioId 
      ? funcionarios.find(f => f.id === alerta.funcionarioId)
      : null;
    const TipoIcon = getTipoIcon(alerta.tipo);
    const diasRestantes = Math.ceil(
      (new Date(alerta.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div 
        key={alerta.id} 
        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            alerta.prioridade === 'critica' ? 'bg-red-100' :
            alerta.prioridade === 'alta' ? 'bg-orange-100' :
            alerta.prioridade === 'media' ? 'bg-yellow-100' : 'bg-blue-100'
          }`}>
            <TipoIcon className={`w-5 h-5 ${
              alerta.prioridade === 'critica' ? 'text-red-600' :
              alerta.prioridade === 'alta' ? 'text-orange-600' :
              alerta.prioridade === 'media' ? 'text-yellow-600' : 'text-blue-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900">{alerta.titulo}</h4>
                <p className="text-sm text-gray-500 mt-1">{alerta.descricao}</p>
              </div>
              <PriorityBadge priority={alerta.prioridade} size="sm" />
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Vence: {new Date(alerta.dataVencimento).toLocaleDateString('pt-BR')}</span>
              </div>
              {funcionario && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{funcionario.nome}</span>
                </div>
              )}
              <div className={`font-medium ${
                diasRestantes < 0 ? 'text-red-600' :
                diasRestantes <= 7 ? 'text-orange-600' :
                diasRestantes <= 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {diasRestantes < 0 
                  ? `${Math.abs(diasRestantes)} dias atrasado`
                  : `${diasRestantes} dias restantes`
                }
              </div>
            </div>

            {alerta.acaoSugerida && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Ação sugerida:</span> {alerta.acaoSugerida}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <StatusBadge status={alerta.status} size="sm" />
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setAlertaSelecionado(alerta.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                {alerta.status !== 'resolvido' && (
                  <button 
                    onClick={() => marcarAlertaResolvido(alerta.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Resolver
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Central de Alertas
          </h1>
          <p className="text-gray-500 mt-1">
            Acompanhe e gerencie todos os alertas de compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            Marcar todos lidos
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">
                {alertas.filter(a => a.prioridade === 'critica' && a.status !== 'resolvido').length}
              </p>
              <p className="text-sm text-red-600">Críticos</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {alertas.filter(a => a.prioridade === 'alta' && a.status !== 'resolvido').length}
              </p>
              <p className="text-sm text-orange-600">Alta</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {alertas.filter(a => a.prioridade === 'media' && a.status !== 'resolvido').length}
              </p>
              <p className="text-sm text-yellow-600">Média</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {alertas.filter(a => a.prioridade === 'baixa' && a.status !== 'resolvido').length}
              </p>
              <p className="text-sm text-blue-600">Baixa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar alertas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {tiposAlerta.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {prioridades.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em andamento</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alertas por Prioridade */}
      <div className="space-y-6">
        {/* Críticos */}
        {alertasCriticos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Crítico ({alertasCriticos.length})
              </h2>
            </div>
            <div className="space-y-3">
              {alertasCriticos.map(renderAlertaCard)}
            </div>
          </div>
        )}

        {/* Alta */}
        {alertasAlta.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Alta ({alertasAlta.length})
              </h2>
            </div>
            <div className="space-y-3">
              {alertasAlta.map(renderAlertaCard)}
            </div>
          </div>
        )}

        {/* Média */}
        {alertasMedia.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Média ({alertasMedia.length})
              </h2>
            </div>
            <div className="space-y-3">
              {alertasMedia.map(renderAlertaCard)}
            </div>
          </div>
        )}

        {/* Baixa */}
        {alertasBaixa.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Baixa ({alertasBaixa.length})
              </h2>
            </div>
            <div className="space-y-3">
              {alertasBaixa.map(renderAlertaCard)}
            </div>
          </div>
        )}

        {alertasFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tudo em ordem!</h3>
            <p className="text-gray-500 mt-1">
              Nenhum alerta encontrado com os filtros selecionados.
            </p>
          </div>
        )}
      </div>

      {/* Dialog - Detalhes do Alerta */}
      <Dialog open={!!alertaSelecionado} onOpenChange={() => setAlertaSelecionado(null)}>
        <DialogContent className="max-w-lg">
          {alertaSelecionado && (() => {
            const alerta = alertas.find(a => a.id === alertaSelecionado);
            if (!alerta) return null;
            const funcionario = alerta.funcionarioId 
              ? funcionarios.find(f => f.id === alerta.funcionarioId)
              : null;
            const TipoIcon = getTipoIcon(alerta.tipo);
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-3">
                    <TipoIcon className="w-6 h-6 text-blue-600" />
                    {alerta.titulo}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={alerta.prioridade} size="md" />
                    <StatusBadge status={alerta.status} size="md" />
                  </div>
                  
                  <p className="text-gray-700">{alerta.descricao}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Criado em: {new Date(alerta.dataCriacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Vence em: {new Date(alerta.dataVencimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {funcionario && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Funcionário: {funcionario.nome}</span>
                      </div>
                    )}
                  </div>
                  
                  {alerta.acaoSugerida && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Ação sugerida:</p>
                      <p className="text-sm text-blue-800">{alerta.acaoSugerida}</p>
                    </div>
                  )}
                  
                  {alerta.status !== 'resolvido' && (
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => {
                          marcarAlertaResolvido(alerta.id);
                          setAlertaSelecionado(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Marcar como resolvido
                      </button>
                      <button 
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Ignorar
                      </button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
