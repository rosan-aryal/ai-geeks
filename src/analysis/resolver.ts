import type { Finding, ResolvedFinding, SearchInput } from "@/adapters/types";

function identityKey(f: Finding, hints?: SearchInput["hints"]): string {
  try {
    const host = new URL(f.sourceUrl).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return f.sourceUrl;
  }
}

export function resolve(findings: Finding[], input: SearchInput): ResolvedFinding[] {
  // 1. Build corroboration map: identity key -> set of adapterIds
  const keyToAdapters = new Map<string, Set<string>>();
  for (const f of findings) {
    const k = identityKey(f, input.hints);
    if (!keyToAdapters.has(k)) keyToAdapters.set(k, new Set());
    keyToAdapters.get(k)!.add(f.adapterId);
  }

  // 2. Score each finding
  const scored: ResolvedFinding[] = findings.map((f) => {
    const base = f.signals.nameMatch ?? 0.5;
    const adapters = keyToAdapters.get(identityKey(f, input.hints))!;
    const corroboratingSources = Math.max(0, adapters.size - 1); // exclude self-adapter
    let c = base;
    if (f.signals.domainMatch) c += 0.15;
    if (f.signals.locationMatch) c += 0.10;
    if (f.signals.industryMatch) c += 0.10;
    c += 0.05 * corroboratingSources;
    const confidence = Math.max(0, Math.min(1, c));
    return { ...f, confidence, corroboratingSources };
  });

  // 3. Filter false positives: conf < 0.3 AND no corroboration
  return scored.filter((f) => f.confidence >= 0.3 || f.corroboratingSources > 0);
}
