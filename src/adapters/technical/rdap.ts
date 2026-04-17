import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

interface RdapResponse {
  handle?: string;
  ldhName?: string;
  events?: Array<{ eventAction?: string; eventDate?: string }>;
  status?: string[];
  entities?: Array<{ roles?: string[]; vcardArray?: unknown }>;
}

export const rdapAdapter: Adapter = {
  id: "rdap",
  name: "RDAP",
  category: "technical",
  supports: ["company", "person"],
  async fetch(input, signal): Promise<Finding[]> {
    const domain = input.hints?.domain;
    if (!domain) return [];

    const url = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
    const res = await httpGet<RdapResponse>(url, { signal });
    if (!res.ok) {
      if (res.error === "http_4xx") return [];
      throw new Error(`rdap: ${res.error}`);
    }

    const d = res.data;
    const registered = d.events?.find((e) => e.eventAction === "registration")?.eventDate;
    const status = d.status?.join(", ") ?? "unknown";

    return [{
      id: `rdap:${domain}`,
      adapterId: "rdap",
      category: "technical",
      title: `${domain} · RDAP registration`,
      summary: `Registered ${registered ?? "unknown"}. Status: ${status}.`,
      sourceUrl: url,
      retrievedAt: new Date().toISOString(),
      rawData: d,
      signals: { domainMatch: true, nameMatch: 0.9 },
      severity: "info",
    }];
  },
};
