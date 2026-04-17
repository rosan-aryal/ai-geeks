import { resolve } from "./resolver";
import type { Finding, SearchInput } from "@/adapters/types";

const mkFinding = (over: Partial<Finding>): Finding => ({
  id: "x", adapterId: "a", category: "social", title: "", summary: "",
  sourceUrl: "https://example.com/x", retrievedAt: "2026-04-17T00:00:00Z",
  signals: {}, severity: "info", ...over,
});

const input: SearchInput = { query: "AIGeeks", entityType: "company" };

describe("resolver", () => {
  it("assigns base confidence from nameMatch when no other signals", () => {
    const [r] = resolve([mkFinding({ signals: { nameMatch: 0.7 } })], input);
    expect(r.confidence).toBeCloseTo(0.7, 2);
  });

  it("falls back to 0.5 when nameMatch missing", () => {
    const [r] = resolve([mkFinding({ signals: {} })], input);
    expect(r.confidence).toBeCloseTo(0.5, 2);
  });

  it("adds 0.15 for domain match", () => {
    const [r] = resolve([mkFinding({ signals: { nameMatch: 0.5, domainMatch: true } })], input);
    expect(r.confidence).toBeCloseTo(0.65, 2);
  });

  it("adds 0.10 each for location and industry match", () => {
    const [r] = resolve([mkFinding({
      signals: { nameMatch: 0.5, locationMatch: true, industryMatch: true },
    })], input);
    expect(r.confidence).toBeCloseTo(0.7, 2);
  });

  it("detects corroboration via shared hostname", () => {
    const findings = [
      mkFinding({ id: "1", adapterId: "github", sourceUrl: "https://github.com/aigeeks-inc" }),
      mkFinding({ id: "2", adapterId: "rdap", sourceUrl: "https://github.com/aigeeks-inc/edit" }),
    ];
    const out = resolve(findings, input);
    expect(out[0].corroboratingSources).toBe(1);
    expect(out[1].corroboratingSources).toBe(1);
  });

  it("adds 0.05 per corroborating source", () => {
    const findings = [
      mkFinding({ id: "1", adapterId: "github", sourceUrl: "https://ai.co/a", signals: { nameMatch: 0.5 } }),
      mkFinding({ id: "2", adapterId: "rdap", sourceUrl: "https://ai.co/b", signals: { nameMatch: 0.5 } }),
      mkFinding({ id: "3", adapterId: "crt", sourceUrl: "https://ai.co/c", signals: { nameMatch: 0.5 } }),
    ];
    const [a] = resolve(findings, input);
    // 0.5 base + 2 corroborators * 0.05 = 0.60
    expect(a.confidence).toBeCloseTo(0.6, 2);
  });

  it("does not count same-adapter duplicates as corroboration", () => {
    const findings = [
      mkFinding({ id: "1", adapterId: "github", sourceUrl: "https://a.co/1" }),
      mkFinding({ id: "2", adapterId: "github", sourceUrl: "https://a.co/2" }),
    ];
    const out = resolve(findings, input);
    expect(out[0].corroboratingSources).toBe(0);
  });

  it("filters findings with confidence < 0.3 and no corroboration", () => {
    const out = resolve([mkFinding({ signals: { nameMatch: 0.1 } })], input);
    expect(out).toHaveLength(0);
  });

  it("keeps low-confidence findings if corroborated", () => {
    const findings = [
      mkFinding({ id: "1", adapterId: "x", sourceUrl: "https://a.co/1", signals: { nameMatch: 0.1 } }),
      mkFinding({ id: "2", adapterId: "y", sourceUrl: "https://a.co/2", signals: { nameMatch: 0.1 } }),
    ];
    const out = resolve(findings, input);
    expect(out).toHaveLength(2);
  });

  it("clamps confidence to [0,1]", () => {
    const findings = Array.from({ length: 20 }, (_, i) => mkFinding({
      id: String(i), adapterId: `a${i}`, sourceUrl: `https://shared.co/${i}`,
      signals: { nameMatch: 0.9, domainMatch: true, locationMatch: true, industryMatch: true },
    }));
    const out = resolve(findings, input);
    out.forEach((f) => { expect(f.confidence).toBeLessThanOrEqual(1); expect(f.confidence).toBeGreaterThanOrEqual(0); });
  });
});
