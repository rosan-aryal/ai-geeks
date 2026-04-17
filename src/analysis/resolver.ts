import type { Finding, ResolvedFinding, SearchInput } from "@/adapters/types";

function identityKey(f: Finding): string {
  try {
    const host = new URL(f.sourceUrl).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return f.sourceUrl;
  }
}

export function resolve(findings: Finding[], input: SearchInput): ResolvedFinding[] {
  const keyToAdapters = new Map<string, Set<string>>();
  for (const f of findings) {
    const k = identityKey(f);
    if (!keyToAdapters.has(k)) keyToAdapters.set(k, new Set());
    keyToAdapters.get(k)!.add(f.adapterId);
  }

  const scored: ResolvedFinding[] = findings.map((f) => {
    const base = f.signals.nameMatch ?? 0.5;
    const adapters = keyToAdapters.get(identityKey(f))!;
    const corroboratingSources = Math.max(0, adapters.size - 1);
    let c = base;
    if (f.signals.domainMatch) c += 0.15;
    if (f.signals.locationMatch) c += 0.10;
    if (f.signals.industryMatch) c += 0.10;
    c += 0.05 * corroboratingSources;
    const confidence = Math.max(0, Math.min(1, c));
    return { ...f, confidence, corroboratingSources };
  });

  return scored.filter((f) => f.confidence >= 0.3 || f.corroboratingSources > 0);
}
