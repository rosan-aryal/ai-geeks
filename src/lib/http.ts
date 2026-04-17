export type HttpOk<T> = { ok: true; data: T; status: number };
export type HttpErr = {
  ok: false;
  error: "timeout" | "network" | "http_4xx" | "http_5xx" | "parse";
  status?: number;
};
export type HttpResult<T> = HttpOk<T> | HttpErr;

export interface HttpOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  accept?: "json" | "text";
}

export async function httpGet<T = unknown>(
  url: string,
  opts: HttpOptions = {},
): Promise<HttpResult<T>> {
  const { timeoutMs = 10_000, accept = "json" } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // chain external signal if provided
  opts.signal?.addEventListener("abort", () => controller.abort());

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: accept === "json" ? "application/json" : "text/plain", ...opts.headers },
    });
    clearTimeout(timer);

    if (!res.ok) {
      if (res.status >= 500) return { ok: false, error: "http_5xx", status: res.status };
      return { ok: false, error: "http_4xx", status: res.status };
    }

    try {
      const data = (accept === "json" ? await res.json() : await res.text()) as T;
      return { ok: true, data, status: res.status };
    } catch {
      return { ok: false, error: "parse", status: res.status };
    }
  } catch (e: unknown) {
    clearTimeout(timer);
    if (e instanceof Error && e.name === "AbortError") return { ok: false, error: "timeout" };
    return { ok: false, error: "network" };
  }
}
