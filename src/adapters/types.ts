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
  nameMatch?: number;
  locationMatch?: boolean;
  industryMatch?: boolean;
  domainMatch?: boolean;
}

export interface Finding {
  id: string;
  adapterId: string;
  category: Category;
  title: string;
  summary: string;
  sourceUrl: string;
  retrievedAt: string;
  rawData?: unknown;
  signals: FindingSignals;
  severity: Severity;
}

export interface ResolvedFinding extends Finding {
  confidence: number;
  corroboratingSources: number;
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
