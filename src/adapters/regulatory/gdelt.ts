import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface GdeltArticle { url?: string; title?: string; domain?: string; seendate?: string; sourcecountry?: string; }

export const gdeltAdapter: Adapter = {
  id: "gdelt",
  name: "GDELT",
  category: "regulatory",
  supports: ["company", "person"],
  async fetch(input, signal): Promise<Finding[]> {
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(input.query)}&format=json&maxrecords=5&sort=DateDesc`;
    const res = await httpGet<{ articles?: GdeltArticle[] }>(url, { signal });
    if (!res.ok || !res.data.articles) return [];
    return res.data.articles.map((a, i) => ({
      id: `gdelt:${a.url ?? i}`,
      adapterId: "gdelt",
      category: "regulatory" as const,
      title: a.title ?? "(untitled)",
      summary: `${a.domain ?? "?"} · ${a.sourcecountry ?? "?"} · ${a.seendate ?? ""}`,
      sourceUrl: a.url ?? url,
      retrievedAt: new Date().toISOString(),
      rawData: a,
      signals: { nameMatch: 0.7 },
      severity: "low" as const,
    }));
  },
};
