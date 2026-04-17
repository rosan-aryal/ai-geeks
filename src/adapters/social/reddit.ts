import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface RedditPost { id: string; title?: string; subreddit?: string; permalink?: string; ups?: number; created_utc?: number; }
interface RedditListing { data: { children: { data: RedditPost }[] }; }

export const redditAdapter: Adapter = {
  id: "reddit",
  name: "Reddit",
  category: "social",
  supports: ["company", "person"],
  async fetch(input, signal): Promise<Finding[]> {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(input.query)}&limit=5`;
    const res = await httpGet<RedditListing>(url, { signal, headers: { "User-Agent": "osint-prototype/1.0" } });
    if (!res.ok) return [];
    return res.data.data.children.map(({ data: p }) => ({
      id: `reddit:${p.id}`,
      adapterId: "reddit",
      category: "social" as const,
      title: p.title ?? "(untitled)",
      summary: `r/${p.subreddit} · ${p.ups ?? 0} ups`,
      sourceUrl: `https://www.reddit.com${p.permalink ?? ""}`,
      retrievedAt: new Date().toISOString(),
      rawData: p,
      signals: { nameMatch: 0.6 },
      severity: "low" as const,
    }));
  },
};
