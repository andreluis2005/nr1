import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  ArrowRight,
  History,
  MessageSquare,
  Download,
  Eye,
  Shield
} from 'lucide-react';

// Mock de workflows de aprovação
const mockWorkflows = [
  {
    id: 'WF-001',
    tipo: 'PGR',
    titulo: 'Revisão Anual do PGR - Versão 3.0',
    descricao: 'Atualização do Programa de Gerenciamento de Riscos com novos agentes identificados',
    solicitante: { nome: 'Eng. Paulo Santos', cargo: 'Técnico de Segurança', email: 'paulo.santos@metalsil.com.br' },
    dataSolicitacao: '2026-01-28T10:30:00Z',
    status: 'em_aprovacao',
    etapaAtual: 2,
    etapas: [
      { ordem: 1, nome: 'Elaboração', responsavel: 'Eng. Paulo Santos', status: 'concluido', data: '2026-01-28' },
      { ordem: 2, nome: 'Revisão Técnica', responsavel: 'Ana Paula Ferreira', status: 'em_andamento', data: null },
      { ordem: 3, nome: 'Aprovação Diretoria', responsavel: 'Carlos Silva', status: 'pendente', data: null },
    ],
    documentos: [
      { nome: 'PGR_v3.0_Draft.pdf', tamanho: 2456789, tipo: 'application/pdf' },
      { nome: 'Anexo_Riscos_2026.xlsx', tamanho: 456789, tipo: 'application/excel' },
    ],
    comentarios: [
      { autor: 'Eng. Paulo Santos', data: '2026-01-28T10:30:00Z', mensagem: 'PGR atualizado com novos riscos identificados na inspeção de janeiro.', tipo: 'sistema' },
    ],
    historico: [],
  },
  {
    id: 'WF-002',
    tipo: 'Exame',
    titulo: 'Aprovação de Exames Complementares - Pedro Henrique Lima',
    descricao: 'Solicitação de exames complementares baseados em resultado do ASO periódico',
    solicitante: { nome: 'Dra. Maria Santos', cargo: 'Médica do Trabalho', email: 'maria.santos@clinicamedica.com.br' },
    dataSolicitacao: '2026-01-29T14:15:00Z',
    status: 'aprovado',
    etapaAtual: 3,
    etapas: [
      { ordem: 1, nome: 'Solicitação Médica', responsavel: 'Dra. Maria Santos', status: 'concluido', data: '2026-01-29' },
      { ordem: 2, nome: 'Análise RH', responsavel: 'Ana Paula Ferreira', status: 'concluido', data: '2026-01-30' },
      { ordem: 3, nome: 'Aprovação Financeira', responsavel: 'Carlos Silva', status: 'concluido', data: '2026-01-31' },
    ],
    documentos: [
      { nome: 'ASO_Pedro_Lima_2026.pdf', tamanho: 1234567, tipo: 'application/pdf' },
      { nome: 'Solicitacao_Exames_Complementares.pdf', tamanho: 567890, tipo: 'application/pdf' },
    ],
    comentarios: [
      { autor: 'Dra. Maria Santos', data: '2026-01-29T14:15:00Z', mensagem: 'Necessário exames complementares devido à alteração nos parâmetros auditivos.', tipo: 'sistema' },
      { autor: 'Ana Paula Ferreira', data: '2026-01-30T09:20:00Z', mensagem: 'Aprovado. Funcionário será afastado temporariamente da área de ruído.', tipo: 'aprovacao' },
      { autor: 'Carlos Silva', data: '2026-01-31T11:00:00Z', mensagem: 'Aprovado financeiramente. Orçamento dentro da previsão.', tipo: 'aprovacao' },
    ],
    historico: [
      { acao: 'Criado', usuario: 'Dra. Maria Santos', data: '2026-01-29T14:15:00Z' },
      { acao: 'Aprovado - Análise RH', usuario: 'Ana Paula Ferreira', data: '2026-01-30T09:20:00Z' },
      { acao: 'Aprovado - Financeiro', usuario: 'Carlos Silva', data: '2026-01-31T11:00:00Z' },
    ],
  },
  {
    id: 'WF-003',
    tipo: 'Treinamento',
    titulo: 'Treinamento NR-35 - Trabalho em Altura (Turma 2)',
    descricao: 'Capacitação de 15 funcionários da manutenção para trabalho em altura',
    solicitante: { nome: 'Ana Paula Ferreira', cargo: 'Gerente de RH', email: 'ana.ferreira@metalsil.com.br' },
    dataSolicitacao: '2026-01-30T08:00:00Z',
    status: 'rejeitado',
    etapaAtual: 2,
    etapas: [
      { ordem: 1, nome: 'Solicitação', responsavel: 'Ana Paula Ferreira', status: 'concluido', data: '2026-01-30' },
      { ordem: 2, nome: 'Aprovação Diretoria', responsavel: 'Carlos Silva', status: 'rejeitado', data: '2026-01-30' },
    ],
    documentos: [
      { nome: 'Plano_Treinamento_NR35.pdf', tamanho: 1890123, tipo: 'application/pdf' },
      { nome: 'Lista_Participantes.xlsx', tamanho: 234567, tipo: 'application/excel' },
    ],
    comentarios: [
      { autor: 'Ana Paula Ferreira', data: '2026-01-30T08:00:00Z', mensagem: 'Solicitação de treinamento para equipe de manutenção.', tipo: 'sistema' },
      { autor: 'Carlos Silva', data: '2026-01-30T16:45:00Z', mensagem: 'Rejeitado. Aguardar conclusão da turma 1 antes de iniciar nova turma.', tipo: 'rejeicao' },
    ],
    historico: [
      { acao: 'Criado', usuario: 'Ana Paula Ferreira', data: '2026-01-30T08:00:00Z' },
      { acao: 'Rejeitado', usuario: 'Carlos Silva', data: '2026-01-30T16:45:00Z' },
    ],
  },
];

const tipoWorkflow = {
  PGR: { label: 'PGR', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  Exame: { label: 'Exame', icon: Shield, color: 'bg-green-100 text-green-700' },
  Treinamento: { label: 'Treinamento', icon: User, color: 'bg-purple-100 text-purple-700' },
};

const statusWorkflow = {
  em_aprovacao: { label: 'Em Aprovação', color: 'bg-yellow-100 text-yellow-700' },
  aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
  pendente: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
};

export function Workflow() {
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [workflowSelecionado, setWorkflowSelecionado] = useState<typeof mockWorkflows[0] | null>(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('detalhes');

  const workflowsFiltrados = mockWorkflows.filter((wf) => {
    const matchStatus = !filtroStatus || wf.status === filtroStatus;
    const matchTipo = !filtroTipo || wf.tipo === filtroTipo;
    return matchStatus && matchTipo;
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTipoInfo = (tipo: string) => {
    return tipoWorkflow[tipo as keyof typeof tipoWorkflow] || { label: tipo, icon: FileText, color: 'bg-gray-100 text-gray-700' };
  };

  const getStatusInfo = (status: string) => {
    return statusWorkflow[status as keyof typeof statusWorkflow] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow de Aprovações</h1>
          <p className="text-gray-500 mt-1">Gestão de aprovações e assinaturas digitais</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Novo Workflow
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Pendentes</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {workflowsFiltrados.filter(w => w.status === 'em_aprovacao').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Aprovados</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {workflowsFiltrados.filter(w => w.status === 'aprovado').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Rejeitados</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {workflowsFiltrados.filter(w => w.status === 'rejeitado').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Tempo Médio</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">2.3</p>
          <p className="text-sm text-gray-500">dias</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todos os status</option>
            <option value="em_aprovacao">Em Aprovação</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todos os tipos</option>
            <option value="PGR">PGR</option>
            <option value="Exame">Exame</option>
            <option value="Treinamento">Treinamento</option>
          </select>
        </div>
      </div>

      {/* Lista de Workflows */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workflowsFiltrados.map((workflow) => {
                const tipoInfo = getTipoInfo(workflow.tipo);
                const statusInfo = getStatusInfo(workflow.status);
                const Icon = tipoInfo.icon;
                const progresso = (workflow.etapas.filter(e => e.status === 'concluido').length / workflow.etapas.length) * 100;

                return (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-600">{workflow.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tipoInfo.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {tipoInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{workflow.titulo}</p>
                      <p className="text-xs text-gray-500">{workflow.descricao.substring(0, 50)}...</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{workflow.solicitante.nome}</p>
                          <p className="text-xs text-gray-500">{workflow.solicitante.cargo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{formatDate(workflow.dataSolicitacao)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {workflow.status === 'aprovado' && <CheckCircle className="w-3.5 h-3.5" />}
                        {workflow.status === 'rejeitado' && <XCircle className="w-3.5 h-3.5" />}
                        {workflow.status === 'em_aprovacao' && <Clock className="w-3.5 h-3.5" />}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              workflow.status === 'aprovado' ? 'bg-green-500' :
                              workflow.status === 'rejeitado' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(progresso)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setWorkflowSelecionado(workflow)}
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
      {workflowSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTipoInfo(workflowSelecionado.tipo).color}`}>
                      {(() => {
                        const Icon = getTipoInfo(workflowSelecionado.tipo).icon;
                        return <Icon className="w-3.5 h-3.5" />;
                      })()}
                      {getTipoInfo(workflowSelecionado.tipo).label}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusInfo(workflowSelecionado.status).color}`}>
                      {workflowSelecionado.status === 'aprovado' && <CheckCircle className="w-3.5 h-3.5" />}
                      {workflowSelecionado.status === 'rejeitado' && <XCircle className="w-3.5 h-3.5" />}
                      {workflowSelecionado.status === 'em_aprovacao' && <Clock className="w-3.5 h-3.5" />}
                      {getStatusInfo(workflowSelecionado.status).label}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{workflowSelecionado.titulo}</h2>
                  <p className="text-gray-500 mt-1">{workflowSelecionado.descricao}</p>
                </div>
                <button
                  onClick={() => setWorkflowSelecionado(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-gray-200">
              {[
                { id: 'detalhes', label: 'Detalhes', icon: FileText },
                { id: 'etapas', label: 'Etapas', icon: ArrowRight },
                { id: 'documentos', label: 'Documentos', icon: Download },
                { id: 'comentarios', label: 'Comentários', icon: MessageSquare },
                { id: 'historico', label: 'Histórico', icon: History },
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

            {/* Conteúdo */}
            <div className="p-6">
              {abaAtiva === 'detalhes' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ID do Workflow</p>
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{workflowSelecionado.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Data de Solicitação</p>
                      <p className="text-sm font-medium">{formatDate(workflowSelecionado.dataSolicitacao)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Solicitante</p>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{workflowSelecionado.solicitante.nome}</p>
                        <p className="text-sm text-gray-500">{workflowSelecionado.solicitante.cargo}</p>
                        <p className="text-sm text-gray-400">{workflowSelecionado.solicitante.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'etapas' && (
                <div className="space-y-4">
                  {workflowSelecionado.etapas.map((etapa, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        etapa.status === 'concluido' ? 'bg-green-500 text-white' :
                        etapa.status === 'em_andamento' ? 'bg-blue-500 text-white' :
                        etapa.status === 'rejeitado' ? 'bg-red-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {etapa.status === 'concluido' ? <CheckCircle className="w-4 h-4" /> :
                         etapa.status === 'rejeitado' ? <XCircle className="w-4 h-4" /> :
                         <span className="text-sm font-medium">{etapa.ordem}</span>}
                      </div>
                      <div className="flex-1 pb-4 border-l-2 border-gray-200 pl-4 ml-[-18px]">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">{etapa.nome}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              etapa.status === 'concluido' ? 'bg-green-100 text-green-700' :
                              etapa.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                              etapa.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {etapa.status === 'concluido' ? 'Concluído' :
                               etapa.status === 'em_andamento' ? 'Em Andamento' :
                               etapa.status === 'rejeitado' ? 'Rejeitado' :
                               'Pendente'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">Responsável: {etapa.responsavel}</p>
                          {etapa.data && <p className="text-sm text-gray-400 mt-1">Concluído em: {formatDate(etapa.data)}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {abaAtiva === 'documentos' && (
                <div className="space-y-3">
                  {workflowSelecionado.documentos.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.nome}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(doc.tamanho)}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Download className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {abaAtiva === 'comentarios' && (
                <div className="space-y-4">
                  {workflowSelecionado.comentarios.map((comentario, index) => (
                    <div key={index} className={`p-4 rounded-lg ${
                      comentario.tipo === 'aprovacao' ? 'bg-green-50 border border-green-100' :
                      comentario.tipo === 'rejeicao' ? 'bg-red-50 border border-red-100' :
                      'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{comentario.autor}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(comentario.data)}</span>
                      </div>
                      <p className={`text-sm ${
                        comentario.tipo === 'aprovacao' ? 'text-green-800' :
                        comentario.tipo === 'rejeicao' ? 'text-red-800' :
                        'text-gray-600'
                      }`}>{comentario.mensagem}</p>
                    </div>
                  ))}

                  {/* Novo Comentário */}
                  {workflowSelecionado.status === 'em_aprovacao' && (
                    <div className="mt-4">
                      <textarea
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Adicionar comentário..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Aprovar
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {abaAtiva === 'historico' && (
                <div className="space-y-3">
                  {workflowSelecionado.historico.length > 0 ? (
                    workflowSelecionado.historico.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <History className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.acao}</p>
                          <p className="text-xs text-gray-500">por {item.usuario}</p>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(item.data)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nenhum histórico disponível</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
