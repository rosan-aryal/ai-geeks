import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface HnHit { objectID: string; title?: string; url?: string; author?: string; points?: number; created_at?: string; }

export const hnAdapter: Adapter = {
  id: "hn",
  name: "Hacker News",
  category: "social",
  supports: ["company", "person"],
  async fetch(input, signal): Promise<Finding[]> {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(input.query)}&hitsPerPage=5`;
    const res = await httpGet<{ hits: HnHit[] }>(url, { signal });
    if (!res.ok) return [];
    return res.data.hits.slice(0, 5).map((h) => ({
      id: `hn:${h.objectID}`,
      adapterId: "hn",
      category: "social",
      title: h.title ?? "(untitled)",
      summary: `${h.points ?? 0} points · by ${h.author ?? "?"} · ${h.created_at ?? ""}`,
      sourceUrl: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
      retrievedAt: new Date().toISOString(),
      rawData: h,
      signals: { nameMatch: 0.7 },
      severity: "info",
    }));
  },
};
