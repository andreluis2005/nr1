export async function runFiscalAgent(data: any) {
  let score = 0;

  if (!data.legal.compliant) score += 40;
  if (data.technical.highRiskCount > 0) score += 30;

  return {
    score,
    probabilityOfFine: score > 50 ? "ALTA" : "BAIXA"
  };
}