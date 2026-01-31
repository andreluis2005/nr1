import { useState } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Slack,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  Calendar
} from 'lucide-react';

// Mock de configurações de notificação
const mockCanais = [
  { id: 'email', nome: 'Email', icone: Mail, ativo: true, configurado: true },
  { id: 'sms', nome: 'SMS', icone: Smartphone, ativo: true, configurado: true },
  { id: 'whatsapp', nome: 'WhatsApp', icone: MessageSquare, ativo: true, configurado: true },
  { id: 'slack', nome: 'Slack', icone: Slack, ativo: false, configurado: false },
];

const mockRegras = [
  {
    id: 'R001',
    nome: 'Exames a Vencer',
    descricao: 'Notificar 30, 15 e 5 dias antes do vencimento',
    evento: 'exame_vencimento',
    canais: ['email', 'whatsapp'],
    antecedencia: [30, 15, 5],
    destinatarios: ['funcionario', 'gestor', 'rh'],
    ativa: true,
    enviadas: 127,
    taxaAbertura: 89,
  },
  {
    id: 'R002',
    nome: 'Treinamentos Pendentes',
    descricao: 'Alerta semanal de treinamentos não realizados',
    evento: 'treinamento_pendente',
    canais: ['email', 'sms'],
    antecedencia: [7],
    destinatarios: ['funcionario', 'gestor'],
    ativa: true,
    enviadas: 45,
    taxaAbertura: 76,
  },
  {
    id: 'R003',
    nome: 'PGR - Revisão Anual',
    descricao: 'Alerta 60 dias antes da revisão anual do PGR',
    evento: 'pgr_revisao',
    canais: ['email', 'whatsapp', 'sms'],
    antecedencia: [60, 30, 7],
    destinatarios: ['gestor', 'diretor', 'seguranca'],
    ativa: true,
    enviadas: 8,
    taxaAbertura: 100,
  },
  {
    id: 'R004',
    nome: 'Incidentes Críticos',
    descricao: 'Notificação imediata para incidentes de alta gravidade',
    evento: 'incidente_critico',
    canais: ['email', 'sms', 'whatsapp', 'slack'],
    antecedencia: [0],
    destinatarios: ['gestor', 'diretor', 'seguranca', 'medicina'],
    ativa: true,
    enviadas: 2,
    taxaAbertura: 100,
  },
  {
    id: 'R005',
    nome: 'Relatório Semanal',
    descricao: 'Resumo semanal de compliance enviado à diretoria',
    evento: 'relatorio_semanal',
    canais: ['email'],
    antecedencia: [0],
    destinatarios: ['diretor'],
    ativa: false,
    enviadas: 0,
    taxaAbertura: 0,
  },
];

const mockHistorico = [
  { id: '1', regra: 'Exames a Vencer', destinatario: 'João Silva', canal: 'email', status: 'entregue', data: '2026-01-31T10:30:00Z', assunto: 'Seu exame periódico vence em 15 dias' },
  { id: '2', regra: 'Exames a Vencer', destinatario: 'João Silva', canal: 'whatsapp', status: 'entregue', data: '2026-01-31T10:31:00Z', assunto: 'Seu exame periódico vence em 15 dias' },
  { id: '3', regra: 'Treinamentos Pendentes', destinatario: 'Maria Costa', canal: 'email', status: 'entregue', data: '2026-01-31T09:00:00Z', assunto: 'Treinamento NR-10 pendente' },
  { id: '4', regra: 'Incidentes Críticos', destinatario: 'Carlos Silva', canal: 'sms', status: 'entregue', data: '2026-01-30T14:15:00Z', assunto: 'ALERTA: Incidente na produção' },
  { id: '5', regra: 'Exames a Vencer', destinatario: 'Pedro Lima', canal: 'email', status: 'falha', data: '2026-01-30T08:00:00Z', assunto: 'Seu exame periódico vence em 5 dias' },
];

export function Notificacoes() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [, setRegraSelecionada] = useState<typeof mockRegras[0] | null>(null);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'entregue': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'falha': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCanalIcon = (canalId: string) => {
    const canal = mockCanais.find(c => c.id === canalId);
    if (!canal) return Mail;
    return canal.icone;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Central de Notificações</h1>
          <p className="text-gray-500 mt-1">Gerencie canais e regras de comunicação</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Regra
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'canais', label: 'Canais', icon: Settings },
          { id: 'regras', label: 'Regras', icon: Bell },
          { id: 'historico', label: 'Histórico', icon: Calendar },
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
                <span className="text-gray-500 text-sm">Notificações Enviadas (30d)</span>
                <Send className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">182</p>
              <p className="text-sm text-green-600 mt-1">+23% vs. mês anterior</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Taxa de Entrega</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">97.3%</p>
              <p className="text-sm text-gray-500 mt-1">Meta: 95%</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Taxa de Abertura</span>
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">84.5%</p>
              <p className="text-sm text-green-600 mt-1">+5% vs. mês anterior</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Canais Ativos</span>
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">3/5</p>
              <p className="text-sm text-gray-500 mt-1">Email, SMS, WhatsApp</p>
            </div>
          </div>

          {/* Gráfico de uso por canal */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Uso por Canal (30 dias)</h3>
            <div className="space-y-4">
              {[
                { canal: 'Email', percentual: 65, cor: 'bg-blue-500' },
                { canal: 'WhatsApp', percentual: 25, cor: 'bg-green-500' },
                { canal: 'SMS', percentual: 10, cor: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.canal}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.canal}</span>
                    <span className="text-sm font-medium text-gray-900">{item.percentual}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.cor} rounded-full`} style={{ width: `${item.percentual}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regras mais ativas */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Regras Mais Ativas</h3>
            <div className="space-y-3">
              {mockRegras
                .filter(r => r.ativa)
                .sort((a, b) => b.enviadas - a.enviadas)
                .slice(0, 3)
                .map((regra) => (
                  <div key={regra.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{regra.nome}</p>
                        <p className="text-sm text-gray-500">{regra.enviadas} notificações enviadas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{regra.taxaAbertura}%</p>
                      <p className="text-xs text-gray-500">taxa de abertura</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Canais */}
      {abaAtiva === 'canais' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCanais.map((canal) => {
            const Icon = canal.icone;
            return (
              <div key={canal.id} className={`bg-white rounded-xl p-6 border ${canal.ativo ? 'border-green-200' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${canal.ativo ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${canal.ativo ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    canal.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {canal.ativo ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{canal.nome}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {canal.configurado ? 'Configurado e pronto para uso' : 'Requer configuração'}
                </p>
                <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  canal.ativo
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {canal.ativo ? 'Configurar' : 'Ativar'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Regras */}
      {abaAtiva === 'regras' && (
        <div className="space-y-4">
          {mockRegras.map((regra) => (
            <div key={regra.id} className={`bg-white rounded-xl p-6 border ${regra.ativa ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${regra.ativa ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Bell className={`w-5 h-5 ${regra.ativa ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{regra.nome}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        regra.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {regra.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{regra.descricao}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Canais:</span>
                        <div className="flex items-center gap-1">
                          {regra.canais.map((canal) => {
                            const Icon = getCanalIcon(canal);
                            return <Icon key={canal} className="w-4 h-4 text-gray-400" />;
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Antecedência:</span>
                        <span className="font-medium text-gray-700">{regra.antecedencia.join(', ')} dias</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRegraSelecionada(regra)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Histórico */}
      {abaAtiva === 'historico' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regra</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockHistorico.map((item) => {
                  const Icon = getCanalIcon(item.canal);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{formatDate(item.data)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{item.regra}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{item.destinatario}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">{item.canal}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{item.assunto}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(item.status)}
                          <span className={`text-sm capitalize ${
                            item.status === 'entregue' ? 'text-green-700' :
                            item.status === 'falha' ? 'text-red-700' :
                            'text-yellow-700'
                          }`}>{item.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
