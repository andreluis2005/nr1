/**
 * Agente Técnico v2
 * - NÃO decide conformidade
 * - NÃO conhece estados regulatórios
 * - NÃO calcula progresso ou status
 * - APENAS produz evidência técnica de exposição ao risco
 */

export interface TechnicalRisk {
  id: string;
  setor_id: string;
  nome: string;
  severidade: number;
  probabilidade: number;
  [key: string]: any;
}

export interface TechnicalExposureResult {
  totalRiscos: number;
  riscosCriticosCount: number;
  exposicaoTotal: number;
  exposicaoPorSetor: Record<string, number>;
  exposicaoPorFuncao: Record<string, number>;
  isCritico: boolean;
  inventory: any[];
}

export function calculateRiskRating(severity: number, probability: number): number {
  return (severity || 0) * (probability || 0);
}

export async function runTechnicalAgent(
  riscos: TechnicalRisk[],
  workersPerSector: Map<string, number> = new Map(),
  workersPerRole: Map<string, number> = new Map()
): Promise<TechnicalExposureResult> {
  let exposicaoTotal = 0;
  const exposicaoPorSetor: Record<string, number> = {};
  const exposicaoPorFuncao: Record<string, number> = {};

  const processedRiscos = (riscos || []).map(r => {
    const rating = calculateRiskRating(r.severidade, r.probabilidade);
    const numWorkers = workersPerSector.get(r.setor_id) || 0;
    const exposureValue = rating * numWorkers;

    exposicaoTotal += exposureValue;
    exposicaoPorSetor[r.setor_id] = (exposicaoPorSetor[r.setor_id] || 0) + exposureValue;

    return {
      ...r,
      rating,
      exposureValue,
      numWorkers,
      isCritico: rating >= 20
    };
  });

  // Agregação por função (Placeholder para mapeamento granular Risco <-> Cargo no v3)
  workersPerRole.forEach((_, role) => {
    // No v2 apenas registramos que o cargo existe para fins de interface
    exposicaoPorFuncao[role] = 0;
  });

  const riscosCriticos = processedRiscos.filter(r => r.isCritico);

  return {
    totalRiscos: processedRiscos.length,
    riscosCriticosCount: riscosCriticos.length,
    exposicaoTotal,
    exposicaoPorSetor,
    exposicaoPorFuncao,
    isCritico: riscosCriticos.length > 0,
    inventory: processedRiscos
  };
}

export async function calculateHash(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateNR1Report(
  template: string,
  data: {
    empresa: any;
    indicadores: any;
    exposicao_por_setor: any[];
    exposicao_por_funcao: any[];
    inventario: any[];
    metadados: {
      data_emissao: string;
      periodo_referencia: string;
      versao_relatorio: string;
      timestamp_geracao: string;
    }
  }
): string {
  let report = template;

  // 1. Identificação da Empresa
  report = report.replace(/\{\{empresa\.razao_social\}\}/g, data.empresa.razao_social || '');
  report = report.replace(/\{\{empresa\.cnpj\}\}/g, data.empresa.cnpj || '');
  report = report.replace(/\{\{empresa\.cnae\}\}/g, data.empresa.cnae || '');
  report = report.replace(/\{\{empresa\.endereco\}\}/g, data.empresa.endereco || '');

  // 2. Metadados de Tempo
  report = report.replace(/\{\{data_emissao\}\}/g, data.metadados.data_emissao);
  report = report.replace(/\{\{periodo_referencia\}\}/g, data.metadados.periodo_referencia);
  report = report.replace(/\{\{versao_relatorio\}\}/g, data.metadados.versao_relatorio);
  report = report.replace(/\{\{timestamp_geracao\}\}/g, data.metadados.timestamp_geracao);

  // 3. Indicadores Gerais
  report = report.replace(/\{\{indicadores\.total_riscos\}\}/g, String(data.indicadores.total_riscos));
  report = report.replace(/\{\{indicadores\.riscos_criticos\}\}/g, String(data.indicadores.riscos_criticos));
  report = report.replace(/\{\{indicadores\.exposicao_total\}\}/g, (data.indicadores.exposicao_total || 0).toLocaleString('pt-BR'));

  // 4. Tabelas Dinâmicas (Mapeamento Simples de Blocos Handlebars-like)

  // 4.1 Distribuição por Setor
  const setorRows = data.exposicao_por_setor.map(s => `| ${s.setor} | ${s.valor.toLocaleString('pt-BR')} |`).join('\n');
  report = report.replace(/\{\{#each exposicao_por_setor\}\}[\s\S]*?\{\{\/each\}\}/, setorRows);

  // 4.2 Distribuição por Função
  const funcaoRows = data.exposicao_por_funcao.map(f => `| ${f.funcao} | ${f.valor.toLocaleString('pt-BR')} |`).join('\n');
  report = report.replace(/\{\{#each exposicao_por_funcao\}\}[\s\S]*?\{\{\/each\}\}/, funcaoRows);

  // 4.3 Inventário Técnico
  const inventarioRows = data.inventario.map(i =>
    `| ${i.nome} | ${i.setor} | ${i.severidade} | ${i.probabilidade} | ${i.rating} | ${i.num_trabalhadores} | ${i.exposicao.toLocaleString('pt-BR')} |`
  ).join('\n');
  report = report.replace(/\{\{#each inventario\}\}[\s\S]*?\{\{\/each\}\}/, inventarioRows);

  return report;
}