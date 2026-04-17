import type { Adapter } from "@/adapters/types";
import { mockDelay, seededMockFinding } from "../_mock";

export const hibpMockAdapter: Adapter = {
  id: "hibp",
  name: "Have I Been Pwned",
  category: "technical",
  supports: ["person"],
  mocked: true,
  async fetch(input) {
    await mockDelay();
    const has = input.query.length % 2 === 0;
    if (!has) return [];
    return [{
      ...seededMockFinding("hibp", "technical", input.query, 1, "critical"),
      title: `[MOCK] Credential exposure suspected for "${input.query}"`,
      summary: "Mocked HIBP result. Real integration requires a paid API key.",
    }];
  },
};
