import fs from "fs";

export async function logEvidence(decision: any) {
  const log = {
    timestamp: new Date().toISOString(),
    decision
  };

  fs.appendFileSync("evidence.log", JSON.stringify(log) + "\n");
}