export type EntityType = "person" | "company";
export type Category = "social" | "technical" | "regulatory";
export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface SearchHints {
  location?: string;
  industry?: string;
  domain?: string;
}

export interface SearchInput {
  query: string;
  entityType: EntityType;
  hints?: SearchHints;
}

export interface FindingSignals {
  nameMatch?: number; // 0-1, adapter's name-match strength
  locationMatch?: boolean;
  industryMatch?: boolean;
  domainMatch?: boolean;
}

export interface Finding {
  id: string; // stable hash of (adapterId + sourceUrl)
  adapterId: string;
  category: Category;
  title: string;
  summary: string;
  sourceUrl: string;
  retrievedAt: string; // ISO
  rawData?: unknown;
  signals: FindingSignals;
  severity: Severity; // adapter's initial guess
}

export interface ResolvedFinding extends Finding {
  confidence: number; // 0-1, computed by resolver
  corroboratingSources: number; // count of other adapters sharing identity key
}

export interface Adapter {
  id: string;
  name: string;
  category: Category;
  supports: EntityType[];
  mocked?: boolean;
  fetch(input: SearchInput, signal: AbortSignal): Promise<Finding[]>;
}

export type AdapterErrorKind =
  | "timeout"
  | "network"
  | "http_4xx"
  | "http_5xx"
  | "parse"
  | "unsupported";

export class AdapterError extends Error {
  constructor(
    public adapterId: string,
    public kind: AdapterErrorKind,
    message?: string,
  ) {
    super(message ?? `${adapterId}: ${kind}`);
    this.name = "AdapterError";
  }
}
