import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { Adapter, Finding, ResolvedFinding, SearchInput, Severity } from "@/adapters/types";
import { resolve } from "@/analysis/resolver";
import { applyRisk, overallRisk } from "@/analysis/risk";
import { adapters as ALL_ADAPTERS } from "@/adapters/registry";

export interface AdapterQueryState {
  adapter: Adapter;
  loading: boolean;
  errored: boolean;
  count: number;
  error?: unknown;
  refetch: () => void;
}

export interface AggregateResult {
  input: SearchInput | null;
  states: AdapterQueryState[];
  findings: ResolvedFinding[];
  overall: Severity;
  allLoading: boolean;
  anyLoaded: boolean;
}

const SEV_ORDER = { info: 0, low: 1, medium: 2, high: 3, critical: 4 } as const;

export function useAggregate(input: SearchInput | null): AggregateResult {
  const results = useQueries({
    queries: ALL_ADAPTERS.map((a) => ({
      queryKey: ["adapter", a.id, input?.query, input?.entityType, input?.hints?.domain ?? ""],
      queryFn: async ({ signal }: { signal: AbortSignal }) => a.fetch(input!, signal),
      enabled: !!input && a.supports.includes(input.entityType),
      staleTime: 60_000,
    })),
  });

  const states: AdapterQueryState[] = ALL_ADAPTERS.map((adapter, i) => {
    const r = results[i];
    return {
      adapter,
      loading: r.isLoading || r.isFetching,
      errored: r.isError,
      count: r.data?.length ?? 0,
      error: r.error,
      refetch: () => r.refetch(),
    };
  });

  const rawFingerprint = results.map((r) => r.dataUpdatedAt).join(",");

  const findings: ResolvedFinding[] = useMemo(() => {
    if (!input) return [];
    const raw: Finding[] = results.flatMap((r) => r.data ?? []);
    const resolved = resolve(raw, input);
    const withRisk = applyRisk(resolved);
    return withRisk.sort((a, b) =>
      SEV_ORDER[b.severity] - SEV_ORDER[a.severity] ||
      b.confidence - a.confidence,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawFingerprint, input?.query, input?.entityType, input?.hints?.domain]);

  const overall = overallRisk(findings);
  const activeStates = states.filter((s) => !!input && s.adapter.supports.includes(input.entityType));
  const allLoading = activeStates.length > 0 && activeStates.every((s) => s.loading);
  const anyLoaded = activeStates.some((s) => !s.loading);

  return { input, states: activeStates, findings, overall, allLoading, anyLoaded };
}
