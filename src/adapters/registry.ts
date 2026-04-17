import type { Adapter, EntityType } from "./types";
import { rdapAdapter } from "./technical/rdap";
import { dohAdapter } from "./technical/doh";
import { githubAdapter } from "./technical/github";
import { crtShAdapter } from "./technical/crt-sh";
import { hibpMockAdapter } from "./technical/hibp";
import { wikipediaAdapter } from "./social/wikipedia";
import { hnAdapter } from "./social/hn";
import { redditAdapter } from "./social/reddit";
import { twitterMockAdapter } from "./social/twitter";
import { linkedInMockAdapter } from "./social/linkedin";
import { gdeltAdapter } from "./regulatory/gdelt";
import { secEdgarAdapter } from "./regulatory/sec-edgar";
import { newsApiAdapter } from "./regulatory/newsapi";
import { openCorporatesMockAdapter } from "./regulatory/opencorporates";

export const adapters: Adapter[] = [
  // technical
  rdapAdapter, dohAdapter, githubAdapter, crtShAdapter, hibpMockAdapter,
  // social
  wikipediaAdapter, hnAdapter, redditAdapter, twitterMockAdapter, linkedInMockAdapter,
  // regulatory
  gdeltAdapter, secEdgarAdapter, newsApiAdapter, openCorporatesMockAdapter,
];

export function getAdaptersFor(entityType: EntityType): Adapter[] {
  return adapters.filter((a) => a.supports.includes(entityType));
}

export function getAdapter(id: string): Adapter | undefined {
  return adapters.find((a) => a.id === id);
}
