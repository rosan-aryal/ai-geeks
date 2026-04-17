import { dohAdapter } from "./doh";
import { httpGet } from "@/lib/http";
jest.mock("@/lib/http");

describe("dohAdapter", () => {
  beforeEach(() => jest.resetAllMocks());

  it("skips without domain hint", async () => {
    const out = await dohAdapter.fetch({ query: "x", entityType: "company" }, new AbortController().signal);
    expect(out).toEqual([]);
  });

  it("returns findings for A, MX, TXT", async () => {
    (httpGet as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("type=A"))
        return Promise.resolve({ ok: true, status: 200, data: { Answer: [{ data: "1.2.3.4" }] } });
      if (url.includes("type=MX"))
        return Promise.resolve({ ok: true, status: 200, data: { Answer: [{ data: "10 mail.x.co." }] } });
      if (url.includes("type=TXT"))
        return Promise.resolve({ ok: true, status: 200, data: { Answer: [{ data: "\"v=spf1 -all\"" }] } });
      return Promise.resolve({ ok: true, status: 200, data: { Answer: [] } });
    });
    const out = await dohAdapter.fetch(
      { query: "x", entityType: "company", hints: { domain: "aigeeks.com" } },
      new AbortController().signal,
    );
    expect(out).toHaveLength(3);
    expect(out.map((f) => f.title)).toEqual(expect.arrayContaining([
      expect.stringContaining("A"), expect.stringContaining("MX"), expect.stringContaining("TXT"),
    ]));
  });
});
