import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface CrtRow { name_value: string; id?: number; not_before?: string; }

export const crtShAdapter: Adapter = {
  id: "crt-sh",
  name: "crt.sh",
  category: "technical",
  supports: ["company", "person"],
  async fetch(input, signal): Promise<Finding[]> {
    const domain = input.hints?.domain;
    if (!domain) return [];

    const url = `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`;
    const res = await httpGet<CrtRow[]>(url, { signal });
    if (!res.ok || !Array.isArray(res.data)) return [];

    const subs = new Set<string>();
    for (const row of res.data) {
      for (const name of row.name_value.split(/\s+/)) subs.add(name.toLowerCase());
    }

    return [{
      id: `crt-sh:${domain}`,
      adapterId: "crt-sh",
      category: "technical",
      title: `${domain} · Certificate Transparency`,
      summary: `${subs.size} subdomain(s) observed in public CT logs.`,
      sourceUrl: url,
      retrievedAt: new Date().toISOString(),
      rawData: { subdomains: [...subs].slice(0, 50) },
      signals: { domainMatch: true, nameMatch: 0.9 },
      severity: "low",
    }];
  },
};
