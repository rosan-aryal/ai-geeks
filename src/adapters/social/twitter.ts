import type { Adapter } from "@/adapters/types";
import { mockDelay, seededMockFinding } from "../_mock";

export const twitterMockAdapter: Adapter = {
  id: "twitter",
  name: "Twitter / X",
  category: "social",
  supports: ["company", "person"],
  mocked: true,
  async fetch(input) {
    await mockDelay();
    return [
      seededMockFinding("twitter", "social", input.query, 1),
      seededMockFinding("twitter", "social", input.query, 2),
    ];
  },
};
