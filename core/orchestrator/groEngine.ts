import { runLegalAgent } from "../agents/legalAgent";
import { runFiscalAgent } from "../agents/fiscalAgent";
import { runTechnicalAgent } from "../agents/technicalAgent";
import { logEvidence } from "../agents/evidenceAgent";

export async function runGROEngine(context: any) {
  const technical = await runTechnicalAgent(context);
  const legal = await runLegalAgent({ ...context, technical });
  const fiscal = await runFiscalAgent({ ...context, technical, legal });

  const decision = {
    technical,
    legal,
    fiscal,
    status: fiscal.score > 70 ? "CRITICAL" : "OK"
  };

  await logEvidence(decision);
  return decision;
}