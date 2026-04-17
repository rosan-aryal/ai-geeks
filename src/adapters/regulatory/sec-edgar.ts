import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface EdgarHit { _id: string; _source: { display_names?: string[]; file_type?: string; adsh?: string; file_date?: string } }

export const secEdgarAdapter: Adapter = {
  id: "sec-edgar",
  name: "SEC EDGAR",
  category: "regulatory",
  supports: ["company"],
  async fetch(input, signal): Promise<Finding[]> {
    if (input.entityType !== "company") return [];
    const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(input.query)}%22&forms=10-K,10-Q`;
    const res = await httpGet<{ hits?: { hits?: EdgarHit[] } }>(url, { signal });
    if (!res.ok || !res.data.hits?.hits) return [];
    return res.data.hits.hits.slice(0, 5).map((h) => ({
      id: `sec:${h._id}`,
      adapterId: "sec-edgar",
      category: "regulatory" as const,
      title: `${h._source.display_names?.[0] ?? input.query} · ${h._source.file_type}`,
      summary: `Filed ${h._source.file_date ?? "?"} · adsh ${h._source.adsh}`,
      sourceUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(h._source.display_names?.[0] ?? "")}`,
      retrievedAt: new Date().toISOString(),
      rawData: h,
      signals: { nameMatch: 0.8 },
      severity: "info" as const,
    }));
  },
};
