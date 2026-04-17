import type { Adapter, EntityType } from "./types";
import { rdapAdapter } from "./technical/rdap";
import { dohAdapter } from "./technical/doh";
import { githubAdapter } from "./technical/github";
import { crtShAdapter } from "./technical/crt-sh";
import { wikipediaAdapter } from "./social/wikipedia";
import { hnAdapter } from "./social/hn";
import { redditAdapter } from "./social/reddit";
import { gdeltAdapter } from "./regulatory/gdelt";
import { secEdgarAdapter } from "./regulatory/sec-edgar";
import { newsApiAdapter } from "./regulatory/newsapi";

export const adapters: Adapter[] = [
  rdapAdapter,
  dohAdapter,
  githubAdapter,
  crtShAdapter,
  wikipediaAdapter,
  hnAdapter,
  redditAdapter,
  gdeltAdapter,
  secEdgarAdapter,
  newsApiAdapter,
];

export function getAdaptersFor(entityType: EntityType): Adapter[] {
  return adapters.filter((a) => a.supports.includes(entityType));
}

export function getAdapter(id: string): Adapter | undefined {
  return adapters.find((a) => a.id === id);
}
