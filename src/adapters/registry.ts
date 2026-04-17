import { gdeltAdapter } from "./regulatory/gdelt";
import { newsApiAdapter } from "./regulatory/newsapi";
import { openCorporatesMockAdapter } from "./regulatory/opencorporates";
import { secEdgarAdapter } from "./regulatory/sec-edgar";
import { hnAdapter } from "./social/hn";
import { linkedInMockAdapter } from "./social/linkedin";
import { redditAdapter } from "./social/reddit";
import { twitterMockAdapter } from "./social/twitter";
import { wikipediaAdapter } from "./social/wikipedia";
import { crtShAdapter } from "./technical/crt-sh";
import { dohAdapter } from "./technical/doh";
import { githubAdapter } from "./technical/github";
import { hibpMockAdapter } from "./technical/hibp";
import { rdapAdapter } from "./technical/rdap";
import type { Adapter, EntityType } from "./types";

export const adapters: Adapter[] = [
  rdapAdapter,
  dohAdapter,
  githubAdapter,
  crtShAdapter,
  hibpMockAdapter,

  wikipediaAdapter,
  hnAdapter,
  redditAdapter,
  twitterMockAdapter,
  linkedInMockAdapter,

  gdeltAdapter,
  secEdgarAdapter,
  newsApiAdapter,
  openCorporatesMockAdapter,
];

export function getAdaptersFor(entityType: EntityType): Adapter[] {
  return adapters.filter((a) => a.supports.includes(entityType));
}

export function getAdapter(id: string): Adapter | undefined {
  return adapters.find((a) => a.id === id);
}
