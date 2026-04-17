# OSINT Prototype — Expo

Mobile OSINT aggregator. Enter a company or person name, get ranked findings across social, technical, and regulatory sources. Export as Markdown or PDF.

## Run

```bash
npm install
cp .env.example .env
npx expo start
```

Scan the QR code with Expo Go. Works on iOS and Android. Web works for debugging (`npx expo start --web`).

The app runs out of the box with no keys — every adapter either hits a public endpoint or returns labeled mock data. Keys only unlock live data for a few sources.

### Optional keys (reviewers — skip unless you want live data)

Edit `.env` and fill in whichever you care about:

| Var | Get one | Effect when missing |
|---|---|---|
| `EXPO_PUBLIC_GITHUB_TOKEN` | https://github.com/settings/tokens (no scopes needed) | App still works; public GitHub rate limit applies (~60 req/h/IP) |
| `EXPO_PUBLIC_NEWSAPI_KEY` | https://newsapi.org/register (free tier) | NewsAPI adapter returns a mock finding |

`.env` is gitignored — do not commit real keys.

## Architecture

```
SearchInput
    │
    ▼
Registry → 14 Adapters (parallel, per-adapter useQuery)
    │
    ▼
Resolver (confidence + corroboration + filter)
    │
    ▼
Risk (severity escalation + downgrade)
    │
    ▼
UI (streaming render, sorted by severity + confidence)
```

### Adapter interface

Any adapter implements:

```ts
interface Adapter {
  id: string;
  name: string;
  category: "social" | "technical" | "regulatory";
  supports: ("person" | "company")[];
  mocked?: boolean;
  fetch(input: SearchInput, signal: AbortSignal): Promise<Finding[]>;
}
```

Add a new source in 15 lines: drop a new file in `src/adapters/<category>/`, implement `Adapter`, add one line to `src/adapters/registry.ts`.

### Sources

| Category | Source | Status |
|---|---|---|
| Social | Wikipedia, Hacker News, Reddit | Real |
| Social | Twitter/X, LinkedIn | Mocked |
| Technical | RDAP, DoH (Google), GitHub, crt.sh | Real |
| Technical | HIBP | Mocked |
| Regulatory | GDELT, SEC EDGAR | Real |
| Regulatory | NewsAPI | Real if key, else mocked |
| Regulatory | OpenCorporates | Mocked |

Mocked sources are visibly labeled in the UI with a "mock" tag and in reports with `[MOCK]`.

### Analysis

**Confidence** (0–1):
```
base       = signals.nameMatch ?? 0.5
+ 0.15     if domain match
+ 0.10     each for location / industry match
+ 0.05     per corroborating source (same host across different adapters)
```

Findings with confidence < 0.3 and no corroboration are filtered as false positives.

**Severity** starts from a per-adapter default (e.g. HIBP = critical, RDAP = info). Downgraded one step when confidence < 0.3. Critical with ≥2 corroborating sources is locked.

**Overall risk** is the max severity across surviving findings, tie-broken by confidence.

## Sample report

See `samples/report-aigeeks.md` for an example of the exported Markdown format the app produces via the Export sheet.
