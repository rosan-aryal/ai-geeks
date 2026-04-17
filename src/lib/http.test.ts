import { httpGet } from "./http";

describe("httpGet", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it("returns ok result on 200", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ hello: "world" }),
    }) as unknown as typeof fetch;

    const r = await httpGet("https://example.com");
    expect(r).toEqual({ ok: true, data: { hello: "world" }, status: 200 });
  });

  it("returns http_4xx on 404", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 404, headers: new Headers(), json: async () => ({}),
    }) as unknown as typeof fetch;

    const r = await httpGet("https://example.com");
    expect(r).toEqual({ ok: false, error: "http_4xx", status: 404 });
  });

  it("returns http_5xx on 500", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 500, headers: new Headers(), json: async () => ({}),
    }) as unknown as typeof fetch;

    const r = await httpGet("https://example.com");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("http_5xx");
  });

  it("returns timeout when AbortError thrown", async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      throw err;
    }) as unknown as typeof fetch;

    const r = await httpGet("https://example.com", { timeoutMs: 10 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("timeout");
  });

  it("returns network on fetch throw", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("no net")) as unknown as typeof fetch;
    const r = await httpGet("https://example.com");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("network");
  });
});
