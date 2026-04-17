import type { ResolvedFinding, Severity } from "@/adapters/types";

const ORDER: Severity[] = ["info", "low", "medium", "high", "critical"];

export const DEFAULT_SEVERITY: Record<string, Severity> = {
  rdap: "info",
  doh: "info",
  github: "info",
  "crt-sh": "low",
  hibp: "critical",
  wikipedia: "info",
  hn: "info",
  reddit: "low",
  twitter: "info",
  linkedin: "info",
  gdelt: "low",
  "sec-edgar": "info",
  opencorporates: "info",
  newsapi: "low",
};

function downgrade(s: Severity): Severity {
  const i = ORDER.indexOf(s);
  return i > 0 ? ORDER[i - 1] : s;
}

export function applyRisk(findings: ResolvedFinding[]): ResolvedFinding[] {
  return findings.map((f) => {
    const locked = f.severity === "critical" && f.corroboratingSources >= 2;
    const sev = !locked && f.confidence < 0.3 ? downgrade(f.severity) : f.severity;
    return { ...f, severity: sev };
  });
}

export function overallRisk(findings: ResolvedFinding[]): Severity {
  if (findings.length === 0) return "info";
  let best: Severity = "info";
  let bestConf = -1;
  for (const f of findings) {
    const cmp = ORDER.indexOf(f.severity) - ORDER.indexOf(best);
    if (cmp > 0 || (cmp === 0 && f.confidence > bestConf)) {
      best = f.severity;
      bestConf = f.confidence;
    }
  }
  return best;
}
