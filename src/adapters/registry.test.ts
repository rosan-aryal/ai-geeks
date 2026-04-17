import { adapters, getAdaptersFor } from "./registry";
import type { EntityType } from "./types";

describe("registry", () => {
  it("exports an array", () => {
    expect(Array.isArray(adapters)).toBe(true);
  });

  it("every adapter has required fields", () => {
    for (const a of adapters) {
      expect(typeof a.id).toBe("string");
      expect(typeof a.name).toBe("string");
      expect(["social", "technical", "regulatory"]).toContain(a.category);
      expect(Array.isArray(a.supports)).toBe(true);
      expect(typeof a.fetch).toBe("function");
    }
  });

  it("getAdaptersFor filters by entity type", () => {
    const companies = getAdaptersFor("company");
    const people = getAdaptersFor("person");
    for (const a of companies) expect(a.supports).toContain("company" as EntityType);
    for (const a of people) expect(a.supports).toContain("person" as EntityType);
  });

  it("has no duplicate ids", () => {
    const ids = adapters.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
