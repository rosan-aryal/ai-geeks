import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface WikiResp { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } }; }

export const wikipediaAdapter: Adapter = {
  id: "wikipedia",
  name: "Wikipedia",
  category: "social",
  supports: ["company", "person"],
  async fetch(input, signal): Promise<Finding[]> {
    const title = encodeURIComponent(input.query.replace(/\s+/g, "_"));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
    const res = await httpGet<WikiResp>(url, { signal });
    if (!res.ok) return [];
    const page = res.data.content_urls?.desktop?.page ?? url;
    return [{
      id: `wikipedia:${input.query}`,
      adapterId: "wikipedia",
      category: "social",
      title: `Wikipedia: ${res.data.title}`,
      summary: res.data.extract ?? "",
      sourceUrl: page,
      retrievedAt: new Date().toISOString(),
      rawData: res.data,
      signals: { nameMatch: 0.9 },
      severity: "info",
    }];
  },
};
