export async function runLegalAgent(data: any) {
  const issues = [];

  if (!data.technical?.inventory?.length) {
    issues.push("Inventário de riscos inexistente ou incompleto.");
  }

  return {
    compliant: issues.length === 0,
    issues,
    legalRisk: issues.length * 20
  };
}