import type { Adapter, EntityType } from "./types";
import { rdapAdapter } from "./technical/rdap";
import { dohAdapter } from "./technical/doh";

export const adapters: Adapter[] = [
  rdapAdapter,
  dohAdapter,
];

export function getAdaptersFor(entityType: EntityType): Adapter[] {
  return adapters.filter((a) => a.supports.includes(entityType));
}

export function getAdapter(id: string): Adapter | undefined {
  return adapters.find((a) => a.id === id);
}
