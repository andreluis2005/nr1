import { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  Users,
  AlertTriangle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { generateNR1Report, calculateHash } from '@/core/agents/technicalAgent';
import { exportReportToPDF } from '@/core/agents/distributionAgent';
import { toast } from 'sonner';

// Tipos de Relatórios Técnicos conformidade NR-1
const tiposRelatorio = [
  {
    id: 'compliance',
    label: 'Relatório Técnico NR-1',
    icon: ShieldCheck,
    desc: 'Evidência técnica imutável de exposição ao risco (GRO/PGR)',
    formatos: ['pdf']
  },
  {
    id: 'pgr',
    label: 'PGR Tradicional',
    icon: FileText,
    desc: 'Programa de Gerenciamento de Riscos (Documento Geral)',
    formatos: ['pdf']
  },
  {
    id: 'exames',
    label: 'Exames Ocupacionais',
    icon: Calendar,
    desc: 'Relatório de controle de exames e vencimentos',
    formatos: ['pdf', 'xlsx']
  }
];

export function Relatorios() {
  const { metrics, exposureData } = useData();
  const { empresaSelecionada, user } = useSupabaseAuth();

  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGerarRelatorio, setShowGerarRelatorio] = useState(false);

  // Buscar relatórios técnicos reais do banco
  const fetchRelatorios = async () => {
    if (!empresaSelecionada?.empresa?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('relatorios_tecnicos')
        .select('*')
        .eq('empresa_id', empresaSelecionada.empresa.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatorios(data || []);
    } catch (err) {
      console.error('Erro ao buscar relatórios:', err);
      toast.error('Erro ao carregar histórico de relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, [empresaSelecionada?.empresa?.id]);

  const handleGerarRelatorio = (tipo: string) => {
    if (tipo !== 'compliance') {
      toast.info('Este tipo de relatório está em desenvolvimento.');
      return;
    }
    setShowGerarRelatorio(true);
  };

  /**
   * Execução da Phase 7A + 7B:
   * 1. Gera o Markdown (Engine 7A)
   * 2. Calcula Hash (Engine 7A)
   * 3. Persiste M-Evidência (Governança 7B)
   */
  const confirmarGeracao = async () => {
    if (!empresaSelecionada || !exposureData) return;

    setIsGenerating(true);
    try {
      // 1. Obter Template (Usando arquivo local ou storage)
      // Para este MVP, vamos ler o arquivo local RELATORIO_TECNICO_NR1.md
      // No futuro, isso pode vir de uma tabela de templates
      const response = await fetch('/RELATORIO_TECNICO_NR1.md');
      const template = await response.text();

      if (!template || template.includes('<!DOCTYPE html>')) {
        throw new Error('Template não encontrado. Verifique se o arquivo RELATORIO_TECNICO_NR1.md existe na pasta public.');
      }

      // 2. Preparar Dados para a Engine Phase 7A
      const now = new Date();
      const reportData = {
        empresa: {
          razao_social: empresaSelecionada.empresa.razao_social || empresaSelecionada.empresa.nome_fantasia,
          cnpj: empresaSelecionada.empresa.cnpj || '',
          cnae: empresaSelecionada.empresa.cnae || '',
          endereco: empresaSelecionada.empresa.logradouro || ''
        },
        indicadores: {
          total_riscos: exposureData.totalRiscos,
          riscos_criticos: exposureData.riscosCriticosCount,
          exposicao_total: exposureData.exposicaoTotal
        },
        exposicao_por_setor: Object.entries(exposureData.exposicaoPorSetor).map(([s, v]) => ({
          setor: s,
          valor: v
        })),
        exposicao_por_funcao: Object.entries(exposureData.exposicaoPorFuncao).map(([f, v]) => ({
          funcao: f,
          valor: v
        })),
        inventario: exposureData.inventory.map((i: any) => ({
          nome: i.nome,
          setor: i.setor_id,
          severidade: i.severidade,
          probabilidade: i.probabilidade,
          rating: i.rating,
          num_trabalhadores: i.numWorkers,
          exposicao: i.exposureValue
        })),
        metadados: {
          data_emissao: now.toLocaleDateString('pt-BR'),
          periodo_referencia: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          versao_relatorio: '1.2.0',
          timestamp_geracao: now.toISOString()
        }
      };

      // 3. Executar Engine 7A (Geração e Selagem)
      const markdown = generateNR1Report(template, reportData);
      const hash = await calculateHash(markdown);
      const finalMarkdown = markdown.replace('\{\{hash_relatorio\}\}', hash);

      // 4. Obter Snapshot ID para vínculo
      const { data: snapshotData } = await (supabase
        .from('historico_exposicao' as any) as any)
        .select('id')
        .eq('empresa_id', empresaSelecionada.empresa.id)
        .eq('data_snapshot', now.toISOString().split('T')[0])
        .maybeSingle();

      // 5. Persistir Evidência (Tabela 7A/7B)
      const { error: insertError } = await (supabase
        .from('relatorios_tecnicos' as any) as any)
        .insert({
          empresa_id: empresaSelecionada.empresa.id,
          snapshot_id: snapshotData?.id,
          hash_integridade: hash,
          versao_engine: 'Agente Técnico v2',
          data_referencia: now.toISOString().split('T')[0],
          conteudo_markdown: finalMarkdown,
          created_by: user?.id
        });

      if (insertError) throw insertError;

      toast.success('Evidência técnica selada com sucesso!');
      setShowGerarRelatorio(false);
      fetchRelatorios();
    } catch (err: any) {
      console.error('Erro na geração:', err);
      toast.error(err.message || 'Erro ao gerar relatório técnico');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Execução da Phase 7B: 
   * 1. Valida Hash
   * 2. Renderiza PDF
   * 3. Registra Log
   */
  const handleDownload = async (relatorio: any) => {
    try {
      toast.loading('Validando integridade e gerando PDF...', { id: 'dist' });

      const blob = await exportReportToPDF(
        relatorio.conteudo_markdown,
        relatorio.hash_integridade,
        {
          userId: user?.id || 'anonymous',
          reportId: relatorio.id,
          companyId: empresaSelecionada?.empresa.id || '',
          ipAddress: 'client-side',
          userAgent: navigator.userAgent
        }
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RELATORIO_TECNICO_${relatorio.data_referencia}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('PDF exportado com sucesso!', { id: 'dist' });
    } catch (err: any) {
      toast.error(err.message, { id: 'dist' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Relatórios e Governança
          </h1>
          <p className="text-gray-500 mt-1">
            Gestão de evidências imutáveis para conformidade NR-1
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-5 text-white shadow-lg shadow-success-200`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{relatorios.length}</p>
              <p className="text-sm text-success-100 italic">Relatórios Selados</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalFuncionarios}</p>
              <p className="text-sm text-blue-100">Escopo de Exposição</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg shadow-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.alertasPendentes}</p>
              <p className="text-sm text-orange-100">Alertas de Risco</p>
            </div>
          </div>
        </div>
      </div>

      {/* Relatórios Disponíveis */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Gerar Novo Documento
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
                Gerar evidência agora
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relatórios Gerados */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Cadeia de Custódia técnica
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relatório
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash (SHA-256)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referência
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Geração
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Acessando registros de custódia...
                    </td>
                  </tr>
                ) : relatorios.map((relatorio) => (
                  <tr key={relatorio.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-success-600" />
                        <div>
                          <span className="font-medium text-gray-900 block">RELATÓRIO_TECNICO_NR1</span>
                          <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{relatorio.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 font-mono" title={relatorio.hash_integridade}>
                        {relatorio.hash_integridade.substring(0, 16)}...
                      </code>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(relatorio.data_referencia).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(relatorio.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDownload(relatorio)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 inline-flex items-center gap-2 group/btn"
                      >
                        <Download className="w-5 h-5" />
                        <span className="text-xs font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity">PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && relatorios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      Nenhum relatório selado encontrado para esta empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog - Gerar Relatório */}
      <Dialog open={showGerarRelatorio} onOpenChange={setShowGerarRelatorio}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              Selo de Evidência Técnica
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              Você irá selar o estado atual da exposição técnica da empresa.
              Este processo produz uma evidência imutável e auditável.
            </p>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-orange-900 border-b border-orange-200 mb-1 pb-1 uppercase tracking-wider">Atenção Governança</p>
                  <p className="text-[11px] text-orange-800 leading-relaxed">
                    Uma vez selada, esta evidência não poderá ser alterada ou excluída, servindo como registro histórico para fins de auditoria ministerial.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowGerarRelatorio(false)}
                disabled={isGenerating}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarGeracao}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Selando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Selar e Registrar
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
