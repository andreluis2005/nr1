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
  workersPerRole.forEach((count, role) => {
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