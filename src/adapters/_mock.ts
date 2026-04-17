import type { Finding, Severity } from "./types";

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function mockDelay(): Promise<void> {
  const ms = 800 + (hash("delay") % 700);
  return new Promise((r) => setTimeout(r, ms));
}

export function seededMockFinding(
  adapterId: string,
  category: Finding["category"],
  query: string,
  n: number,
  severity: Severity = "low",
): Finding {
  return {
    id: `${adapterId}:mock:${query}:${n}`,
    adapterId,
    category,
    title: `[MOCK] ${adapterId} result ${n} for "${query}"`,
    summary: "Deterministic mock result — replace with real adapter in production.",
    sourceUrl: `https://mock.local/${adapterId}/${encodeURIComponent(query)}/${n}`,
    retrievedAt: new Date(1_745_000_000_000 + n * 1000).toISOString(),
    rawData: { mocked: true },
    signals: { nameMatch: 0.55 + (n % 3) * 0.1 },
    severity,
  };
}
