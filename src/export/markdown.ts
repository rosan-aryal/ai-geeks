import type { Category, ResolvedFinding, SearchInput, Severity } from "@/adapters/types";
import { getAdapter } from "@/adapters/registry";

const TITLES: Record<Category, string> = {
  social: "Social & Public Footprint",
  technical: "Technical Infrastructure",
  regulatory: "Contextual & Regulatory",
};

function renderFinding(f: ResolvedFinding): string {
  const adapter = getAdapter(f.adapterId);
  const host = (() => { try { return new URL(f.sourceUrl).hostname; } catch { return f.sourceUrl; } })();
  const mockLabel = adapter?.mocked ? " **[MOCK]**" : "";
  const corr = f.corroboratingSources > 0 ? `  **Corroborated by:** ${f.corroboratingSources} other source${f.corroboratingSources === 1 ? "" : "s"}\n` : "";
  return `### ${f.title}${mockLabel}

- **Source:** [${host}](${f.sourceUrl})
- **Adapter:** ${adapter?.name ?? f.adapterId}  **Confidence:** ${f.confidence.toFixed(2)}  **Severity:** ${f.severity}
- **Retrieved:** ${f.retrievedAt}
${corr}
${f.summary}

---
`;
}

export function renderMarkdown(
  input: SearchInput,
  findings: ResolvedFinding[],
  overall: Severity,
  now: Date = new Date(),
): string {
  const byCat: Record<Category, ResolvedFinding[]> = { social: [], technical: [], regulatory: [] };
  for (const f of findings) byCat[f.category].push(f);

  const sources = new Set(findings.map((f) => f.adapterId)).size;
  const sections = (["social", "technical", "regulatory"] as Category[])
    .filter((c) => byCat[c].length)
    .map((c) => `## ${TITLES[c]} (${byCat[c].length})\n\n${byCat[c].map(renderFinding).join("\n")}`)
    .join("\n");

  return `# OSINT Report — ${input.query}
_Generated ${now.toISOString()} · ${findings.length} findings from ${sources} sources_

**Overall risk:** ${overall}   **Entity type:** ${input.entityType}

${sections}

## Methodology

Findings aggregated from ${sources} open sources. Confidence computed from name/domain/location match + cross-source corroboration. Mocked sources are labeled [MOCK].
`;
}
