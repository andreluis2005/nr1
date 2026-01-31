import { useState } from 'react';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Send,
  Download,
  Settings,
  ChevronRight,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  Users
} from 'lucide-react';

// Mock de eventos eSocial
const mockEventos = [
  {
    id: 'S-2210-001',
    tipo: 'S-2210',
    nome: 'Comunicação de Acidente de Trabalho',
    status: 'enviado',
    dataEnvio: '2026-01-15T10:30:00Z',
    dataOcorrencia: '2026-01-10',
    funcionario: 'João Silva Santos',
    matricula: '001',
    protocolo: '12345678901234567890',
    retorno: null,
  },
  {
    id: 'S-2220-001',
    tipo: 'S-2220',
    nome: 'Monitoramento da Saúde do Trabalhador',
    status: 'pendente',
    dataEnvio: null,
    dataOcorrencia: '2026-01-20',
    funcionario: 'Maria Oliveira Costa',
    matricula: '002',
    protocolo: null,
    retorno: null,
  },
  {
    id: 'S-2240-001',
    tipo: 'S-2240',
    nome: 'Condições Ambientais do Trabalho',
    status: 'erro',
    dataEnvio: '2026-01-25T14:00:00Z',
    dataOcorrencia: '2026-01-25',
    funcionario: null,
    matricula: null,
    protocolo: null,
    retorno: {
      codigo: '401',
      descricao: 'CNPJ não encontrado na base da Receita Federal',
    },
  },
  {
    id: 'S-2210-002',
    tipo: 'S-2210',
    nome: 'Comunicação de Acidente de Trabalho',
    status: 'processando',
    dataEnvio: '2026-01-30T09:15:00Z',
    dataOcorrencia: '2026-01-28',
    funcionario: 'Pedro Henrique Lima',
    matricula: '003',
    protocolo: '09876543210987654321',
    retorno: null,
  },
];

// Mock de pendências
const mockPendencias = [
  { tipo: 'S-2210', nome: 'Acidentes de Trabalho', quantidade: 1, urgente: true },
  { tipo: 'S-2220', nome: 'Exames', quantidade: 3, urgente: false },
  { tipo: 'S-2240', nome: 'Agentes Nocivos', quantidade: 0, urgente: false },
  { tipo: 'S-2230', nome: 'Afastamentos', quantidade: 1, urgente: true },
  { tipo: 'S-2245', nome: 'Treinamentos', quantidade: 5, urgente: false },
];

// Mock de estatísticas
const mockStats = {
  totalEnviados: 156,
  totalPendentes: 12,
  totalErros: 3,
  taxaSucesso: 97.4,
  ultimoEnvio: '2026-01-30T09:15:00Z',
  proximoLote: '2026-02-01T08:00:00Z',
};

const statusEvento = {
  enviado: { label: 'Enviado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  erro: { label: 'Erro', color: 'bg-red-100 text-red-700', icon: XCircle },
  processando: { label: 'Processando', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
};

export function ESocial() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [eventoSelecionado, setEventoSelecionado] = useState<typeof mockEventos[0] | null>(null);

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    return statusEvento[status as keyof typeof statusEvento] || { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integração eSocial</h1>
          <p className="text-gray-500 mt-1">Envio e monitoramento de eventos SST</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Conectado</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar Lote
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'eventos', label: 'Eventos', icon: FileText },
          { id: 'pendencias', label: 'Pendências', icon: AlertTriangle },
          { id: 'configuracao', label: 'Configuração', icon: Settings },
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

      {/* Dashboard */}
      {abaAtiva === 'dashboard' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Eventos Enviados</span>
                <Send className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{mockStats.totalEnviados}</p>
              <p className="text-sm text-gray-500 mt-1">Últimos 12 meses</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Pendentes</span>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{mockStats.totalPendentes}</p>
              <p className="text-sm text-gray-500 mt-1">Requerem atenção</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Com Erro</span>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{mockStats.totalErros}</p>
              <p className="text-sm text-gray-500 mt-1">Precisam correção</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Taxa de Sucesso</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{mockStats.taxaSucesso}%</p>
              <p className="text-sm text-gray-500 mt-1">Meta: 98%</p>
            </div>
          </div>

          {/* Status de Conexão */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Conexão com eSocial Ativa</h3>
                  <p className="text-sm text-gray-500">Ambiente de Produção - CNPJ: 12.345.678/0001-90</p>
                  <p className="text-sm text-gray-400 mt-1">Último envio: {formatDate(mockStats.ultimoEnvio)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Próximo lote automático</p>
                <p className="font-medium text-gray-900">{formatDate(mockStats.proximoLote)}</p>
              </div>
            </div>
          </div>

          {/* Eventos por Tipo */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Eventos por Tipo</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { tipo: 'S-2210', nome: 'Acidentes', total: 45, icon: AlertTriangle, cor: 'bg-red-100 text-red-600' },
                { tipo: 'S-2220', nome: 'Exames', total: 89, icon: Activity, cor: 'bg-blue-100 text-blue-600' },
                { tipo: 'S-2230', nome: 'Afastamentos', total: 12, icon: Clock, cor: 'bg-orange-100 text-orange-600' },
                { tipo: 'S-2240', nome: 'Agentes', total: 8, icon: Shield, cor: 'bg-purple-100 text-purple-600' },
                { tipo: 'S-2245', nome: 'Treinamentos', total: 2, icon: Users, cor: 'bg-green-100 text-green-600' },
              ].map((item) => (
                <div key={item.tipo} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 ${item.cor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500">{item.tipo}</p>
                  <p className="font-semibold text-gray-900">{item.nome}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.total}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Eventos */}
      {abaAtiva === 'eventos' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Todos os tipos</option>
              <option value="S-2210">S-2210 - Acidentes</option>
              <option value="S-2220">S-2220 - Exames</option>
              <option value="S-2230">S-2230 - Afastamentos</option>
              <option value="S-2240">S-2240 - Agentes</option>
              <option value="S-2245">S-2245 - Treinamentos</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Todos os status</option>
              <option value="enviado">Enviado</option>
              <option value="pendente">Pendente</option>
              <option value="erro">Erro</option>
              <option value="processando">Processando</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funcionário</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Ocorrência</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Envio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockEventos.map((evento) => {
                    const statusInfo = getStatusInfo(evento.status);
                    const Icon = statusInfo.icon;
                    return (
                      <tr key={evento.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-600">{evento.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{evento.tipo}</p>
                            <p className="text-xs text-gray-500">{evento.nome}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {evento.funcionario ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">{evento.funcionario}</p>
                              <p className="text-xs text-gray-500">Matrícula: {evento.matricula}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{evento.dataOcorrencia}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{formatDate(evento.dataEnvio)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setEventoSelecionado(evento)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pendências */}
      {abaAtiva === 'pendencias' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockPendencias.map((pendencia) => (
              <div key={pendencia.tipo} className={`bg-white rounded-xl p-5 border ${pendencia.urgente ? 'border-red-200' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{pendencia.tipo}</p>
                    <h3 className="font-semibold text-gray-900">{pendencia.nome}</h3>
                  </div>
                  {pendencia.urgente && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Urgente
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-5 h-5 ${pendencia.quantidade > 0 ? 'text-orange-500' : 'text-green-500'}`} />
                    <span className={`text-2xl font-bold ${pendencia.quantidade > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {pendencia.quantidade}
                    </span>
                    <span className="text-sm text-gray-500">pendentes</span>
                  </div>
                  {pendencia.quantidade > 0 && (
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Alertas */}
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900">Atenção: Prazos Próximos</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Você tem 3 exames com vencimento em menos de 5 dias que precisam ser enviados ao eSocial.
                </p>
                <button className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors">
                  Ver Exames
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuração */}
      {abaAtiva === 'configuracao' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Dados da Empresa</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Razão Social</p>
                <p className="font-medium text-gray-900">Indústria Metalúrgica Silva Ltda</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">CNPJ</p>
                <p className="font-medium text-gray-900">12.345.678/0001-90</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Ambiente</p>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Produção
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Certificado Digital</p>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Válido até 15/12/2026
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Configurações de Envio</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Envio Automático</p>
                  <p className="text-sm text-gray-500">Enviar eventos automaticamente quando disponíveis</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Validação Pré-Envio</p>
                  <p className="text-sm text-gray-500">Validar XML antes de enviar ao eSocial</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Notificações de Erro</p>
                  <p className="text-sm text-gray-500">Enviar email quando houver rejeição</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Evento */}
      {eventoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusInfo(eventoSelecionado.status).color}`}>
                      {(() => {
                        const Icon = getStatusInfo(eventoSelecionado.status).icon;
                        return <Icon className="w-3.5 h-3.5" />;
                      })()}
                      {getStatusInfo(eventoSelecionado.status).label}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{eventoSelecionado.nome}</h2>
                  <p className="text-gray-500">{eventoSelecionado.tipo}</p>
                </div>
                <button
                  onClick={() => setEventoSelecionado(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID do Evento</p>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{eventoSelecionado.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Protocolo</p>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{eventoSelecionado.protocolo || '-'}</p>
                </div>
              </div>

              {eventoSelecionado.funcionario && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Funcionário</p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{eventoSelecionado.funcionario}</p>
                    <p className="text-sm text-gray-500">Matrícula: {eventoSelecionado.matricula}</p>
                  </div>
                </div>
              )}

              {eventoSelecionado.retorno && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">Erro no Envio</p>
                      <p className="text-sm text-red-700 mt-1">Código: {eventoSelecionado.retorno.codigo}</p>
                      <p className="text-sm text-red-700">{eventoSelecionado.retorno.descricao}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar XML
                </button>
                {eventoSelecionado.status === 'erro' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Reenviar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
