import type { Adapter, EntityType } from "./types";
import { rdapAdapter } from "./technical/rdap";
import { dohAdapter } from "./technical/doh";
import { githubAdapter } from "./technical/github";
import { crtShAdapter } from "./technical/crt-sh";
import { wikipediaAdapter } from "./social/wikipedia";

export const adapters: Adapter[] = [
  rdapAdapter,
  dohAdapter,
  githubAdapter,
  crtShAdapter,
  wikipediaAdapter,
];

export function getAdaptersFor(entityType: EntityType): Adapter[] {
  return adapters.filter((a) => a.supports.includes(entityType));
}

export function getAdapter(id: string): Adapter | undefined {
  return adapters.find((a) => a.id === id);
}
