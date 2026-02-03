import { cnaeRiskMap } from "../rules/cnaeRiskMap";

export async function runTechnicalAgent(context: any) {
  const risks = cnaeRiskMap[context.cnae] || [];
  return {
    inventory: risks,
    highRiskCount: risks.filter(r => r.level === "HIGH").length
  };
}