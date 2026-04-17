import { rdapAdapter } from "./rdap";
import { httpGet } from "@/lib/http";

jest.mock("@/lib/http");

const fixture = {
  handle: "AIGEEKS-COM",
  ldhName: "AIGEEKS.COM",
  entities: [{ roles: ["registrant"], vcardArray: ["vcard", [["fn", {}, "text", "AIGeeks Inc"]]] }],
  events: [{ eventAction: "registration", eventDate: "2018-04-15T00:00:00Z" }],
  status: ["client transfer prohibited"],
};

describe("rdapAdapter", () => {
  beforeEach(() => jest.resetAllMocks());

  it("skips when no domain hint for company", async () => {
    const out = await rdapAdapter.fetch(
      { query: "AIGeeks", entityType: "company" },
      new AbortController().signal,
    );
    expect(out).toEqual([]);
  });

  it("fetches and normalizes a domain registration", async () => {
    (httpGet as jest.Mock).mockResolvedValue({ ok: true, status: 200, data: fixture });
    const out = await rdapAdapter.fetch(
      { query: "AIGeeks", entityType: "company", hints: { domain: "aigeeks.com" } },
      new AbortController().signal,
    );
    expect(out).toHaveLength(1);
    expect(out[0].adapterId).toBe("rdap");
    expect(out[0].category).toBe("technical");
    expect(out[0].signals.domainMatch).toBe(true);
    expect(out[0].sourceUrl).toBe("https://rdap.org/domain/aigeeks.com");
    expect(out[0].title).toContain("aigeeks.com");
  });

  it("returns [] on 404", async () => {
    (httpGet as jest.Mock).mockResolvedValue({ ok: false, error: "http_4xx", status: 404 });
    const out = await rdapAdapter.fetch(
      { query: "AIGeeks", entityType: "company", hints: { domain: "notreal.tld" } },
      new AbortController().signal,
    );
    expect(out).toEqual([]);
  });

  it("supports both company and person (keyed on domain hint)", () => {
    expect(rdapAdapter.supports).toEqual(expect.arrayContaining(["company", "person"]));
  });
});
