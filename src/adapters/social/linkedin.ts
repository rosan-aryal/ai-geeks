import type { Adapter } from "@/adapters/types";
import { mockDelay, seededMockFinding } from "../_mock";

export const linkedInMockAdapter: Adapter = {
  id: "linkedin",
  name: "LinkedIn",
  category: "social",
  supports: ["company", "person"],
  mocked: true,
  async fetch(input) {
    await mockDelay();
    return [seededMockFinding("linkedin", "social", input.query, 1)];
  },
};
