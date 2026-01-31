import { useState } from 'react';
import {
  Search,
  Download,
  FileText,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  Fingerprint
} from 'lucide-react';

// Mock de logs de auditoria
const mockAuditLogs = [
  {
    id: '1',
    timestamp: '2026-01-31T14:23:45Z',
    usuario: { nome: 'Carlos Silva', email: 'carlos.silva@metalsil.com.br', perfil: 'admin' },
    acao: 'LOGIN',
    modulo: 'Autenticação',
    descricao: 'Login bem-sucedido no sistema',
    ip: '192.168.1.100',
    userAgent: 'Chrome 120.0 / Windows 10',
    status: 'sucesso',
    entidade: 'Sessão',
    entidadeId: null,
    alteracoes: null,
    hash: 'a1b2c3d4e5f6...',
  },
  {
    id: '2',
    timestamp: '2026-01-31T14:25:12Z',
    usuario: { nome: 'Carlos Silva', email: 'carlos.silva@metalsil.com.br', perfil: 'admin' },
    acao: 'CREATE',
    modulo: 'Funcionários',
    descricao: 'Novo funcionário cadastrado',
    ip: '192.168.1.100',
    userAgent: 'Chrome 120.0 / Windows 10',
    status: 'sucesso',
    entidade: 'Funcionário',
    entidadeId: 'FUNC-009',
    alteracoes: { nome: 'Pedro Henrique Lima', cargo: 'Operador de Máquinas', setor: 'Produção' },
    hash: 'b2c3d4e5f6g7...',
  },
  {
    id: '3',
    timestamp: '2026-01-31T14:30:33Z',
    usuario: { nome: 'Ana Paula Ferreira', email: 'ana.ferreira@metalsil.com.br', perfil: 'gestor' },
    acao: 'UPDATE',
    modulo: 'Exames',
    descricao: 'Status do exame atualizado',
    ip: '192.168.1.105',
    userAgent: 'Firefox 121.0 / macOS',
    status: 'sucesso',
    entidade: 'Exame',
    entidadeId: 'EXM-001',
    alteracoes: { status: { de: 'agendado', para: 'realizado' }, dataRealizacao: { de: null, para: '2026-01-31' } },
    hash: 'c3d4e5f6g7h8...',
  },
  {
    id: '4',
    timestamp: '2026-01-31T14:35:18Z',
    usuario: { nome: 'João Operador', email: 'joao.operador@metalsil.com.br', perfil: 'operador' },
    acao: 'VIEW',
    modulo: 'PGR',
    descricao: 'Visualização do PGR',
    ip: '192.168.1.110',
    userAgent: 'Safari 17.0 / iOS',
    status: 'sucesso',
    entidade: 'PGR',
    entidadeId: 'PGR-001',
    alteracoes: null,
    hash: 'd4e5f6g7h8i9...',
  },
  {
    id: '5',
    timestamp: '2026-01-31T14:40:22Z',
    usuario: { nome: 'Carlos Silva', email: 'carlos.silva@metalsil.com.br', perfil: 'admin' },
    acao: 'DELETE',
    modulo: 'Treinamentos',
    descricao: 'Tentativa de exclusão de treinamento',
    ip: '192.168.1.100',
    userAgent: 'Chrome 120.0 / Windows 10',
    status: 'falha',
    entidade: 'Treinamento',
    entidadeId: 'TRN-005',
    alteracoes: null,
    hash: 'e5f6g7h8i9j0...',
  },
  {
    id: '6',
    timestamp: '2026-01-31T14:45:55Z',
    usuario: { nome: 'Maria Visualizadora', email: 'maria.visualizadora@metalsil.com.br', perfil: 'visualizador' },
    acao: 'EXPORT',
    modulo: 'Relatórios',
    descricao: 'Exportação de relatório de exames',
    ip: '192.168.1.115',
    userAgent: 'Edge 118.0 / Windows 11',
    status: 'sucesso',
    entidade: 'Relatório',
    entidadeId: 'RPT-2026-001',
    alteracoes: { formato: 'PDF', registros: 127 },
    hash: 'f6g7h8i9j0k1...',
  },
  {
    id: '7',
    timestamp: '2026-01-31T14:50:10Z',
    usuario: { nome: 'Ana Paula Ferreira', email: 'ana.ferreira@metalsil.com.br', perfil: 'gestor' },
    acao: 'APPROVE',
    modulo: 'Workflow',
    descricao: 'Aprovação de alteração no PGR',
    ip: '192.168.1.105',
    userAgent: 'Firefox 121.0 / macOS',
    status: 'sucesso',
    entidade: 'PGR',
    entidadeId: 'PGR-001',
    alteracoes: { versao: { de: 2, para: 3 }, status: 'ativo' },
    hash: 'g7h8i9j0k1l2...',
  },
  {
    id: '8',
    timestamp: '2026-01-31T14:55:33Z',
    usuario: { nome: 'Tentativa Falha', email: 'desconhecido', perfil: 'n/a' },
    acao: 'LOGIN',
    modulo: 'Autenticação',
    descricao: 'Tentativa de login com senha incorreta',
    ip: '203.0.113.50',
    userAgent: 'Chrome 119.0 / Linux',
    status: 'falha',
    entidade: 'Sessão',
    entidadeId: null,
    alteracoes: null,
    hash: 'h8i9j0k1l2m3...',
  },
];

const acoes = {
  LOGIN: { label: 'Login', icon: Lock, color: 'bg-blue-100 text-blue-700' },
  LOGOUT: { label: 'Logout', icon: Unlock, color: 'bg-gray-100 text-gray-700' },
  CREATE: { label: 'Criar', icon: Plus, color: 'bg-green-100 text-green-700' },
  UPDATE: { label: 'Atualizar', icon: Edit, color: 'bg-yellow-100 text-yellow-700' },
  DELETE: { label: 'Excluir', icon: Trash2, color: 'bg-red-100 text-red-700' },
  VIEW: { label: 'Visualizar', icon: Eye, color: 'bg-blue-100 text-blue-700' },
  EXPORT: { label: 'Exportar', icon: Download, color: 'bg-purple-100 text-purple-700' },
  APPROVE: { label: 'Aprovar', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  REJECT: { label: 'Rejeitar', icon: XCircle, color: 'bg-red-100 text-red-700' },
};

export function Auditoria() {
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [logSelecionado, setLogSelecionado] = useState<typeof mockAuditLogs[0] | null>(null);

  const logsFiltrados = mockAuditLogs.filter((log) => {
    const matchBusca = !filtroBusca || 
      log.usuario.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      log.descricao.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      log.entidade.toLowerCase().includes(filtroBusca.toLowerCase());
    
    const matchAcao = !filtroAcao || log.acao === filtroAcao;
    const matchStatus = !filtroStatus || log.status === filtroStatus;
    const matchData = !filtroData || log.timestamp.startsWith(filtroData);

    return matchBusca && matchAcao && matchStatus && matchData;
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAcaoInfo = (acao: string) => {
    return acoes[acao as keyof typeof acoes] || { label: acao, icon: FileText, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria & Logs</h1>
          <p className="text-gray-500 mt-1">Registro completo de todas as ações no sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Audit Trail Ativo</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Logs
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Total de Logs</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{logsFiltrados.length}</p>
          <p className="text-sm text-gray-500 mt-1">Últimas 24 horas</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Ações Bem-sucedidas</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {logsFiltrados.filter(l => l.status === 'sucesso').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {Math.round((logsFiltrados.filter(l => l.status === 'sucesso').length / logsFiltrados.length) * 100)}% do total
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Tentativas Falhas</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            {logsFiltrados.filter(l => l.status === 'falha').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Requerem atenção</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Usuários Ativos</span>
            <User className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {new Set(logsFiltrados.map(l => l.usuario.email)).size}
          </p>
          <p className="text-sm text-gray-500 mt-1">Últimas 24 horas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuário, descrição ou entidade..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <select
            value={filtroAcao}
            onChange={(e) => setFiltroAcao(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todas as ações</option>
            {Object.entries(acoes).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todos os status</option>
            <option value="sucesso">Sucesso</option>
            <option value="falha">Falha</option>
          </select>

          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logsFiltrados.map((log) => {
                const acaoInfo = getAcaoInfo(log.acao);
                const Icon = acaoInfo.icon;

                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.usuario.nome}</p>
                          <p className="text-xs text-gray-500">{log.usuario.perfil}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${acaoInfo.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {acaoInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{log.modulo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{log.descricao}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.status === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status === 'sucesso' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {log.status === 'sucesso' ? 'Sucesso' : 'Falha'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setLogSelecionado(log)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {logSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalhes do Log</h2>
                <button
                  onClick={() => setLogSelecionado(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID do Log</p>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{logSelecionado.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Timestamp</p>
                  <p className="text-sm font-medium">{formatDate(logSelecionado.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Endereço IP</p>
                  <p className="text-sm font-medium">{logSelecionado.ip}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">User Agent</p>
                  <p className="text-sm font-medium">{logSelecionado.userAgent}</p>
                </div>
              </div>

              {/* Hash de Integridade */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className="w-5 h-5 text-blue-600" />
                  <p className="font-medium text-blue-900">Hash de Integridade</p>
                </div>
                <p className="text-sm font-mono text-blue-700 break-all">{logSelecionado.hash}</p>
                <p className="text-xs text-blue-600 mt-2">
                  Este hash garante a imutabilidade do registro para fins de auditoria.
                </p>
              </div>

              {/* Alterações */}
              {logSelecionado.alteracoes && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">Alterações Realizadas</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(logSelecionado.alteracoes).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0">
                        <span className="text-sm text-gray-500 capitalize">{key}:</span>
                        {typeof value === 'object' && value !== null && 'de' in value && 'para' in value ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-red-600 line-through">{String(value.de)}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-green-600 font-medium">{String(value.para)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">{String(value)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
