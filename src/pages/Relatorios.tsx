import { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const tiposRelatorio = [
  { 
    id: 'compliance', 
    label: 'Status de Compliance', 
    icon: CheckCircle2,
    desc: 'Visão geral do índice de conformidade da empresa',
    formatos: ['pdf', 'xlsx']
  },
  { 
    id: 'pgr', 
    label: 'PGR Completo', 
    icon: FileText,
    desc: 'Programa de Gerenciamento de Riscos documentado',
    formatos: ['pdf']
  },
  { 
    id: 'exames', 
    label: 'Exames Ocupacionais', 
    icon: Calendar,
    desc: 'Relatório de controle de exames e vencimentos',
    formatos: ['pdf', 'xlsx']
  },
  { 
    id: 'treinamentos', 
    label: 'Treinamentos', 
    icon: TrendingUp,
    desc: 'Controle de capacitações e certificações',
    formatos: ['pdf', 'xlsx']
  },
  { 
    id: 'alertas', 
    label: 'Alertas Pendentes', 
    icon: AlertTriangle,
    desc: 'Lista de alertas e não conformidades',
    formatos: ['pdf', 'xlsx']
  },
  { 
    id: 'funcionarios', 
    label: 'Funcionários', 
    icon: Users,
    desc: 'Cadastro e situação dos colaboradores',
    formatos: ['pdf', 'xlsx']
  },
];

export function Relatorios() {
  const { relatorios, metrics } = useApp();
  const [showGerarRelatorio, setShowGerarRelatorio] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [formato, setFormato] = useState('pdf');

  const handleGerarRelatorio = (tipo: string) => {
    setTipoSelecionado(tipo);
    setShowGerarRelatorio(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Relatórios
          </h1>
          <p className="text-gray-500 mt-1">
            Gere relatórios para fiscalização e gestão
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.indiceConformidade}%</p>
              <p className="text-sm text-blue-100">Índice de Conformidade</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalFuncionarios}</p>
              <p className="text-sm text-green-100">Funcionários</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.alertasPendentes}</p>
              <p className="text-sm text-orange-100">Alertas Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Relatórios Disponíveis */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Relatórios Disponíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiposRelatorio.map((tipo) => (
            <div 
              key={tipo.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleGerarRelatorio(tipo.id)}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <tipo.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex gap-1">
                  {tipo.formatos.map(fmt => (
                    <span 
                      key={fmt} 
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded uppercase"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mt-4">{tipo.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{tipo.desc}</p>
              <div className="flex items-center gap-2 mt-4 text-blue-600 text-sm font-medium">
                Gerar relatório
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relatórios Gerados */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Relatórios Gerados Recentemente
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Geração
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {relatorios.map((relatorio) => (
                  <tr key={relatorio.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {relatorio.formato === 'pdf' ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <FileSpreadsheet className="w-5 h-5 text-green-500" />
                        )}
                        <span className="font-medium text-gray-900">{relatorio.titulo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="capitalize text-sm text-gray-600">{relatorio.tipo}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(relatorio.periodoInicio).toLocaleDateString('pt-BR')} - {new Date(relatorio.periodoFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatFileSize(relatorio.tamanho)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600">
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {relatorios.length === 0 && (
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum relatório gerado ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog - Gerar Relatório */}
      <Dialog open={showGerarRelatorio} onOpenChange={setShowGerarRelatorio}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Gerar Relatório
            </DialogTitle>
          </DialogHeader>
          {tipoSelecionado && (() => {
            const tipo = tiposRelatorio.find(t => t.id === tipoSelecionado);
            if (!tipo) return null;
            
            return (
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <tipo.icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{tipo.label}</h4>
                      <p className="text-sm text-gray-600">{tipo.desc}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período Início
                    </label>
                    <input 
                      type="date" 
                      value={periodoInicio}
                      onChange={(e) => setPeriodoInicio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período Fim
                    </label>
                    <input 
                      type="date" 
                      value={periodoFim}
                      onChange={(e) => setPeriodoFim(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formato
                  </label>
                  <div className="flex gap-3">
                    {tipo.formatos.map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setFormato(fmt)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          formato === fmt 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {fmt === 'pdf' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4" />
                        )}
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setShowGerarRelatorio(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => setShowGerarRelatorio(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Gerar Relatório
                  </button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
