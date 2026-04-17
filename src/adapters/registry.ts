import type { Adapter, EntityType } from "./types";
import { rdapAdapter } from "./technical/rdap";
import { dohAdapter } from "./technical/doh";
import { githubAdapter } from "./technical/github";

export const adapters: Adapter[] = [
  rdapAdapter,
  dohAdapter,
  githubAdapter,
];

export function getAdaptersFor(entityType: EntityType): Adapter[] {
  return adapters.filter((a) => a.supports.includes(entityType));
}

export function getAdapter(id: string): Adapter | undefined {
  return adapters.find((a) => a.id === id);
}
