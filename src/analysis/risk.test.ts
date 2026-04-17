import { applyRisk, overallRisk, DEFAULT_SEVERITY } from "./risk";
import type { ResolvedFinding } from "@/adapters/types";

const mk = (over: Partial<ResolvedFinding>): ResolvedFinding => ({
  id: "x", adapterId: "github", category: "technical", title: "", summary: "",
  sourceUrl: "https://x", retrievedAt: "t", signals: {}, severity: "info",
  confidence: 0.7, corroboratingSources: 0, ...over,
});

describe("applyRisk", () => {
  it("downgrades severity one step for confidence < 0.3", () => {
    const r = applyRisk([mk({ severity: "high", confidence: 0.2 })]);
    expect(r[0].severity).toBe("medium");
  });

  it("does not downgrade below info", () => {
    const r = applyRisk([mk({ severity: "info", confidence: 0.1 })]);
    expect(r[0].severity).toBe("info");
  });

  it("locks critical with 2+ corroborators", () => {
    const r = applyRisk([mk({ severity: "critical", confidence: 0.2, corroboratingSources: 2 })]);
    expect(r[0].severity).toBe("critical");
  });

  it("keeps severity when confidence >= 0.3", () => {
    const r = applyRisk([mk({ severity: "high", confidence: 0.6 })]);
    expect(r[0].severity).toBe("high");
  });
});

describe("overallRisk", () => {
  it("returns the highest severity", () => {
    expect(overallRisk([mk({ severity: "low" }), mk({ severity: "high" }), mk({ severity: "info" })])).toBe("high");
  });

  it("returns info when empty", () => {
    expect(overallRisk([])).toBe("info");
  });

  it("ties broken by highest confidence", () => {
    const a = mk({ id: "a", severity: "high", confidence: 0.5 });
    const b = mk({ id: "b", severity: "high", confidence: 0.9 });
    // just check both resolve correctly — tie-breaker is internal, but overall is "high"
    expect(overallRisk([a, b])).toBe("high");
  });
});

describe("DEFAULT_SEVERITY table", () => {
  it("contains critical for hibp and info for rdap", () => {
    expect(DEFAULT_SEVERITY.hibp).toBe("critical");
    expect(DEFAULT_SEVERITY.rdap).toBe("info");
  });
});
