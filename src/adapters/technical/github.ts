import type { Adapter, Finding } from "@/adapters/types";
import { httpGet } from "@/lib/http";

const TOKEN = process.env.EXPO_PUBLIC_GITHUB_TOKEN;
const headers: Record<string, string> = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

interface User { login: string; html_url: string; score?: number; avatar_url?: string; }
interface Repo { full_name: string; html_url: string; stargazers_count?: number; description?: string; }

export const githubAdapter: Adapter = {
  id: "github",
  name: "GitHub",
  category: "technical",
  supports: ["person", "company"],
  async fetch(input, signal): Promise<Finding[]> {
    const q = encodeURIComponent(input.query);
    const [users, repos] = await Promise.all([
      httpGet<{ items: User[] }>(`https://api.github.com/search/users?q=${q}&per_page=3`, { signal, headers }),
      httpGet<{ items: Repo[] }>(`https://api.github.com/search/repositories?q=${q}&per_page=3&sort=stars`, { signal, headers }),
    ]);

    const out: Finding[] = [];
    if (users.ok) {
      for (const u of users.data.items.slice(0, 3)) {
        out.push({
          id: `github:user:${u.login}`,
          adapterId: "github",
          category: "technical",
          title: `GitHub user: ${u.login}`,
          summary: `${u.html_url}`,
          sourceUrl: u.html_url,
          retrievedAt: new Date().toISOString(),
          rawData: u,
          signals: { nameMatch: u.score && u.score > 1 ? 0.85 : 0.7 },
          severity: "info",
        });
      }
    }
    if (repos.ok) {
      for (const r of repos.data.items.slice(0, 3)) {
        out.push({
          id: `github:repo:${r.full_name}`,
          adapterId: "github",
          category: "technical",
          title: `Repo: ${r.full_name} (${r.stargazers_count ?? 0}★)`,
          summary: r.description ?? "",
          sourceUrl: r.html_url,
          retrievedAt: new Date().toISOString(),
          rawData: r,
          signals: { nameMatch: 0.6 },
          severity: "info",
        });
      }
    }
    return out;
  },
};
