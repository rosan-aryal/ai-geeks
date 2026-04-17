import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

const TYPES: ("A" | "MX" | "TXT")[] = ["A", "MX", "TXT"];

interface DohResp { Answer?: { data: string }[]; }

export const dohAdapter: Adapter = {
  id: "doh",
  name: "DNS (DoH)",
  category: "technical",
  supports: ["company", "person"],
  async fetch(input, signal): Promise<Finding[]> {
    const domain = input.hints?.domain;
    if (!domain) return [];

    const results = await Promise.all(TYPES.map(async (type): Promise<Finding | null> => {
      const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`;
      const res = await httpGet<DohResp>(url, { signal });
      if (!res.ok || !res.data.Answer?.length) return null;
      return {
        id: `doh:${domain}:${type}`,
        adapterId: "doh",
        category: "technical" as const,
        title: `${domain} · ${type} records`,
        summary: res.data.Answer.map((a) => a.data).join(", "),
        sourceUrl: url,
        retrievedAt: new Date().toISOString(),
        rawData: res.data,
        signals: { domainMatch: true, nameMatch: 0.9 },
        severity: "info" as const,
      };
    }));

    return results.filter((f): f is Finding => f !== null);
  },
};
