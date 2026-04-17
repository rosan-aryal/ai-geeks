import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface NewsArticle { title?: string; url?: string; source?: { name?: string }; publishedAt?: string; description?: string; }

function mockNews(q: string): Finding[] {
  return [
    {
      id: `newsapi:mock:${q}:1`,
      adapterId: "newsapi",
      category: "regulatory",
      title: `[MOCK] Industry coverage of ${q}`,
      summary: "Mocked because no EXPO_PUBLIC_NEWSAPI_KEY configured.",
      sourceUrl: `https://newsapi.org/?q=${encodeURIComponent(q)}`,
      retrievedAt: new Date().toISOString(),
      rawData: { mocked: true },
      signals: { nameMatch: 0.65 },
      severity: "low",
    },
  ];
}

export const newsApiAdapter: Adapter = {
  id: "newsapi",
  name: "NewsAPI",
  category: "regulatory",
  supports: ["company", "person"],
  get mocked() { return !process.env.EXPO_PUBLIC_NEWSAPI_KEY; },
  async fetch(input, signal): Promise<Finding[]> {
    const key = process.env.EXPO_PUBLIC_NEWSAPI_KEY;
    if (!key) return mockNews(input.query);

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(input.query)}&pageSize=5&sortBy=publishedAt&apiKey=${key}`;
    const res = await httpGet<{ articles?: NewsArticle[] }>(url, { signal });
    if (!res.ok || !res.data.articles) return [];
    return res.data.articles.map((a, i) => ({
      id: `newsapi:${a.url ?? i}`,
      adapterId: "newsapi",
      category: "regulatory" as const,
      title: a.title ?? "(untitled)",
      summary: `${a.source?.name ?? "?"} · ${a.publishedAt ?? ""} · ${a.description ?? ""}`.slice(0, 160),
      sourceUrl: a.url ?? url,
      retrievedAt: new Date().toISOString(),
      rawData: a,
      signals: { nameMatch: 0.75 },
      severity: "low" as const,
    }));
  },
};
